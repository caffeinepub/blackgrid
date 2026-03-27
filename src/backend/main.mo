import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Random "mo:core/Random";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";
import InviteLinksModule "invite-links/invite-links-module";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  // Types
  public type Profile = {
    name : Text;
    verificationLevel : { #none; #basic; #verified; #elite };
    trustScore : Nat;
    subscriptionTier : { #free; #elite; #black };
    profileBadge : ?{ #business; #personal; #flagged };
    isActive : Bool;
  };

  public type WatchlistEntry = {
    id : Nat;
    targetName : Text;
    tag : { #safe; #unknown; #avoid };
    notes : Text;
    interactionHistory : [(Int, Text)];
    addedAt : Int;
  };

  public type ThreatAlert = {
    id : Nat;
    title : Text;
    severity : { #warning; #alert; #critical };
    location : Text;
    timestamp : Int;
    isRead : Bool;
  };

  public type SubscriptionRecord = {
    buyer : Principal;
    tier : Text;
    sessionId : Text;
    timestamp : Int;
    seen : Bool;
  };

  public type OffenderRecord = {
    id : Nat;
    name : Text;
    offenseType : Text;
    offenseCategory : { #violent; #property; #sex_offense; #drug; #other };
    location : Text;
    neighborhood : Text;
    severity : { #low; #moderate; #severe };
    description : Text;
    addedAt : Int;
    addedBy : Principal;
  };

  module VerificationLevel {
    public func toNat(level : { #none; #basic; #verified; #elite }) : Nat {
      switch (level) {
        case (#none) { 0 };
        case (#basic) { 1 };
        case (#verified) { 2 };
        case (#elite) { 3 };
      };
    };
  };

  module Profile {
    public func compare(p1 : Profile, p2 : Profile) : Order.Order {
      Text.compare(p1.name, p2.name);
    };
  };

  // Area Incident Types
  public type AreaIncident = {
    location : Text;
    incidentType : Text;
    severity : { #low; #moderate; #severe };
  };

  // Persistent State
  let profiles = Map.empty<Principal, Profile>();
  let watchlists = Map.empty<Principal, [WatchlistEntry]>();
  let alerts = Map.empty<Principal, [ThreatAlert]>();
  let subscriptionRecords = Map.empty<Text, SubscriptionRecord>();
  let offenderRecords = Map.empty<Nat, OffenderRecord>();
  var nextWatchlistId = 1;
  var nextAlertId = 1;
  var nextOffenderId = 1;
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // Persistent empty state for HTTP Outcalls transform
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Initialize access control and user approval states
  let accessControlState = AccessControl.initState();
  let approvalState = UserApproval.initState(accessControlState);
  include MixinAuthorization(accessControlState);

  // Invite Links & RSVP system (admin only access)
  let inviteState = InviteLinksModule.initState();

  // --- 1. USER PROFILE MANAGEMENT ---
  public query ({ caller }) func getCallerUserProfile() : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?Profile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.add(caller, profile);
  };

  // --- 2. WATCHLIST MANAGEMENT ---
  public shared ({ caller }) func addWatchlistEntry(entry : WatchlistEntry) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only authenticated users can add watchlist entries.");
    };
    let id = nextWatchlistId;
    nextWatchlistId += 1;

    let newEntry : WatchlistEntry = {
      entry with
      id;
      addedAt = Time.now();
      interactionHistory = [];
    };

    let existing = switch (watchlists.get(caller)) {
      case (null) { [] };
      case (?entries) { entries };
    };
    watchlists.add(caller, existing.concat([newEntry]));
    id;
  };

  public shared ({ caller }) func updateWatchlistTag(id : Nat, newTag : { #safe; #unknown; #avoid }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only authenticated users can update watchlist entries.");
    };
    let userEntries = switch (watchlists.get(caller)) {
      case (null) { Runtime.trap("Watchlist entry not found.") };
      case (?entries) { entries };
    };

    var found = false;
    let updatedEntries = userEntries.map(func(entry) { if (entry.id == id) { found := true; { entry with tag = newTag } } else { entry } });

    if (not found) {
      Runtime.trap("Watchlist entry not found for id " # id.toText());
    };
    watchlists.add(caller, updatedEntries);
  };

  public shared ({ caller }) func removeWatchlistEntry(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only authenticated users can remove watchlist entries.");
    };
    let userEntries = switch (watchlists.get(caller)) {
      case (null) { Runtime.trap("Watchlist entry not found.") };
      case (?entries) { entries };
    };

    let filteredEntries = userEntries.filter(func(entry) { entry.id != id });
    watchlists.add(caller, filteredEntries);
  };

  public query ({ caller }) func getWatchlist() : async [WatchlistEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only authenticated users can view watchlist.");
    };
    switch (watchlists.get(caller)) {
      case (null) { [] };
      case (?entries) { entries };
    };
  };

  // --- 3. ALERT / INCIDENT MANAGEMENT ---
  public shared ({ caller }) func markAlertRead(alertId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only authenticated users can mark alerts as read.");
    };
    let userAlerts = switch (alerts.get(caller)) {
      case (null) { Runtime.trap("Alert not found.") };
      case (?alerts) { alerts };
    };

    let updatedAlerts = userAlerts.map(func(alert) { if (alert.id == alertId) { { alert with isRead = true } } else { alert } });
    alerts.add(caller, updatedAlerts);
  };

  public query ({ caller }) func getUnreadAlertCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only authenticated users can check alert count.");
    };
    let userAlerts = switch (alerts.get(caller)) {
      case (null) { [] };
      case (?alerts) { alerts };
    };
    var unreadCount = 0;
    for (alert in userAlerts.vals()) {
      if (not alert.isRead) { unreadCount += 1 };
    };
    unreadCount;
  };

  public query ({ caller }) func getAreaIncidents() : async [AreaIncident] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only authenticated users can view area incidents.");
    };
    [
      {
        location = "Market St, SF";
        incidentType = "Robbery";
        severity = #moderate;
      },
      {
        location = "Mission District";
        incidentType = "Vandalism";
        severity = #low;
      },
      {
        location = "Financial District";
        incidentType = "Assault";
        severity = #severe;
      },
    ];
  };

  // --- 4. OFFENDER REGISTRY ---
  public shared ({ caller }) func addOffender(record : OffenderRecord) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can add offenders.");
    };
    let id = nextOffenderId;
    nextOffenderId += 1;
    let newRecord : OffenderRecord = {
      record with
      id;
      addedAt = Time.now();
      addedBy = caller;
    };
    offenderRecords.add(id, newRecord);
    id;
  };

  public query ({ caller }) func getOffenders() : async [OffenderRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only authenticated users can view offender registry.");
    };
    offenderRecords.values().toArray();
  };

  public shared ({ caller }) func removeOffender(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can remove offenders.");
    };
    ignore offenderRecords.remove(id);
  };

  // --- 5. INVITE LINKS / RSVPs ---
  public shared ({ caller }) func generateInviteCode() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate invite codes");
    };
    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteState, code);
    code;
  };

  public shared func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view RSVPs");
    };
    InviteLinksModule.getAllRSVPs(inviteState);
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view invite codes");
    };
    InviteLinksModule.getInviteCodes(inviteState);
  };

  // --- 6. STRIPE PAYMENTS ---
  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create checkout sessions");
    };
    let config = getStripeConfig();
    await Stripe.createCheckoutSession(config, caller, items, successUrl, cancelUrl, transform);
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check session status");
    };
    let config = getStripeConfig();
    await Stripe.getSessionStatus(config, sessionId, transform);
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) {
        Runtime.trap("Stripe integration not configured. Please contact administrator");
      };
      case (?c) { c };
    };
  };

  // --- 7. SUBSCRIPTION PURCHASE TRACKING ---
  public shared ({ caller }) func recordSubscriptionPurchase(sessionId : Text, tier : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can record purchases");
    };
    if (subscriptionRecords.get(sessionId) == null) {
      let record : SubscriptionRecord = {
        buyer = caller;
        tier;
        sessionId;
        timestamp = Time.now();
        seen = false;
      };
      subscriptionRecords.add(sessionId, record);
    };
  };

  public query ({ caller }) func getSubscriptionPurchases() : async [SubscriptionRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view subscription purchases");
    };
    subscriptionRecords.values().toArray();
  };

  public shared ({ caller }) func markPurchaseSeen(sessionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark purchases as seen");
    };
    switch (subscriptionRecords.get(sessionId)) {
      case (null) {};
      case (?record) {
        subscriptionRecords.add(sessionId, { record with seen = true });
      };
    };
  };

  // --- 8. AUTH / APPROVAL MANAGEMENT ---
  public query ({ caller }) func isEliteTierSubscriber() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check subscription status");
    };
    switch (profiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.subscriptionTier) {
          case (#elite) { true };
          case (#black) { true };
          case (_) { false };
        };
      };
    };
  };

  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  public query ({ caller }) func getAllUsers() : async [Profile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    profiles.values().toArray();
  };
}
