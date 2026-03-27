import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Random "mo:core/Random";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import InviteLinksModule "invite-links/invite-links-module";

actor {
  // Types
  type Profile = {
    name : Text;
    verificationLevel : { #none; #basic; #verified; #elite };
    trustScore : Nat;
    subscriptionTier : { #free; #elite; #black };
    profileBadge : ?{ #business; #personal; #flagged };
    isActive : Bool;
  };

  module Profile {
    public func compare(p1 : Profile, p2 : Profile) : Order.Order {
      Text.compare(p1.name, p2.name);
    };
  };

  type WatchlistEntry = {
    id : Nat;
    targetName : Text;
    tag : { #safe; #unknown; #avoid };
    notes : Text;
    interactionHistory : [(Int, Text)];
    addedAt : Int;
  };

  type ThreatAlert = {
    id : Nat;
    title : Text;
    severity : { #warning; #alert; #critical };
    location : Text;
    timestamp : Int;
    isRead : Bool;
  };

  // State
  let profiles = Map.empty<Principal, Profile>();
  let watchlists = Map.empty<Principal, [WatchlistEntry]>();
  let alerts = Map.empty<Principal, [ThreatAlert]>();
  var nextWatchlistId = 1;
  var nextAlertId = 1;

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Profile functions (following required naming convention)
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

  // Legacy profile functions (keeping for backward compatibility)
  public query ({ caller }) func getProfile() : async Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func updateProfile(profile : Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    profiles.add(caller, profile);
  };

  // Helper function to check Elite+ subscription
  private func isEliteTier(caller : Principal) : Bool {
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

  // Watchlist functions
  public shared ({ caller }) func addWatchlistEntry(entry : WatchlistEntry) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add watchlist entries");
    };
    // Gate watchlist to Elite+ tier as per requirement #9
    if (not isEliteTier(caller)) {
      Runtime.trap("Unauthorized: Watchlist feature requires Elite or Black subscription tier");
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
      case (?list) { list };
    };
    watchlists.add(caller, existing.concat([newEntry]));
    id;
  };

  public shared ({ caller }) func updateWatchlistTag(entryId : Nat, newTag : { #safe; #unknown; #avoid }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update watchlist entries");
    };
    // Gate watchlist to Elite+ tier
    if (not isEliteTier(caller)) {
      Runtime.trap("Unauthorized: Watchlist feature requires Elite or Black subscription tier");
    };

    let userEntries = switch (watchlists.get(caller)) {
      case (null) { Runtime.trap("Watchlist not found") };
      case (?list) { list };
    };

    let updatedEntries = List.empty<WatchlistEntry>();
    var found = false;

    for (entry in userEntries.values()) {
      if (entry.id == entryId) {
        found := true;
        updatedEntries.add({ entry with tag = newTag });
      } else {
        updatedEntries.add(entry);
      };
    };

    if (not found) { Runtime.trap("Watchlist entry not found") };
    watchlists.add(caller, updatedEntries.toArray());
  };

  public shared ({ caller }) func removeWatchlistEntry(entryId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove watchlist entries");
    };
    // Gate watchlist to Elite+ tier
    if (not isEliteTier(caller)) {
      Runtime.trap("Unauthorized: Watchlist feature requires Elite or Black subscription tier");
    };

    let userEntries = switch (watchlists.get(caller)) {
      case (null) { Runtime.trap("Watchlist not found") };
      case (?list) { list };
    };

    let filteredEntries = userEntries.filter(func(e) { e.id != entryId });
    watchlists.add(caller, filteredEntries);
  };

  public query ({ caller }) func getWatchlist() : async [WatchlistEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view watchlist");
    };
    // Gate watchlist to Elite+ tier
    if (not isEliteTier(caller)) {
      Runtime.trap("Unauthorized: Watchlist feature requires Elite or Black subscription tier");
    };
    switch (watchlists.get(caller)) {
      case (null) { [] };
      case (?list) { list };
    };
  };

  // Alert functions
  public shared ({ caller }) func markAlertRead(alertId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark alerts");
    };
    let userAlerts = switch (alerts.get(caller)) {
      case (null) { Runtime.trap("Alerts not found") };
      case (?list) { list };
    };

    let updatedAlerts = userAlerts.map(func(a) { if (a.id == alertId) { { a with isRead = true } } else { a } });
    alerts.add(caller, updatedAlerts);
  };

  public query ({ caller }) func getUnreadAlertCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view alert count");
    };

    let userAlerts = switch (alerts.get(caller)) {
      case (null) { [] };
      case (?list) { list };
    };
    userAlerts.filter(func(a) { not a.isRead }).size();
  };

  // Simulated area incidents - accessible to all users including guests
  public query ({ caller }) func getAreaIncidents() : async [{
    location : Text;
    incidentType : Text;
    severity : { #low; #moderate; #severe };
  }] {
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

  // Subscription check
  public query ({ caller }) func isEliteSubscriber() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check subscription status");
    };
    isEliteTier(caller);
  };

  // Invite Links & RSVP system (admin only access)
  let inviteState = InviteLinksModule.initState();

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
};
