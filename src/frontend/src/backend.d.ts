import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface AreaIncident {
    severity: Variant_low_severe_moderate;
    location: string;
    incidentType: string;
}
export interface Profile {
    profileBadge?: Variant_personal_business_flagged;
    name: string;
    subscriptionTier: Variant_free_elite_black;
    trustScore: bigint;
    isActive: boolean;
    verificationLevel: Variant_verified_none_elite_basic;
}
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export interface http_header {
    value: string;
    name: string;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface SubscriptionRecord {
    buyer: Principal;
    tier: string;
    sessionId: string;
    timestamp: bigint;
    seen: boolean;
}
export interface OffenderRecord {
    id: bigint;
    name: string;
    offenseType: string;
    offenseCategory: Variant_offenseCategory;
    location: string;
    neighborhood: string;
    severity: Variant_low_severe_moderate;
    description: string;
    addedAt: bigint;
    addedBy: Principal;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface WatchlistEntry {
    id: bigint;
    tag: Variant_avoid_safe_unknown;
    addedAt: bigint;
    notes: string;
    targetName: string;
    interactionHistory: Array<[bigint, string]>;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_avoid_safe_unknown {
    avoid = "avoid",
    safe = "safe",
    unknown_ = "unknown"
}
export enum Variant_free_elite_black {
    free = "free",
    elite = "elite",
    black = "black"
}
export enum Variant_low_severe_moderate {
    low = "low",
    severe = "severe",
    moderate = "moderate"
}
export enum Variant_personal_business_flagged {
    personal = "personal",
    business = "business",
    flagged = "flagged"
}
export enum Variant_verified_none_elite_basic {
    verified = "verified",
    none = "none",
    elite = "elite",
    basic = "basic"
}
export enum Variant_offenseCategory {
    violent = "violent",
    property = "property",
    sex_offense = "sex_offense",
    drug = "drug",
    other = "other"
}
export interface backendInterface {
    addOffender(record: OffenderRecord): Promise<bigint>;
    addWatchlistEntry(entry: WatchlistEntry): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    generateInviteCode(): Promise<string>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getAllUsers(): Promise<Array<Profile>>;
    getAreaIncidents(): Promise<Array<AreaIncident>>;
    getCallerUserProfile(): Promise<Profile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getOffenders(): Promise<Array<OffenderRecord>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getSubscriptionPurchases(): Promise<Array<SubscriptionRecord>>;
    getUnreadAlertCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<Profile | null>;
    getWatchlist(): Promise<Array<WatchlistEntry>>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    isEliteTierSubscriber(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    markAlertRead(alertId: bigint): Promise<void>;
    markPurchaseSeen(sessionId: string): Promise<void>;
    recordSubscriptionPurchase(sessionId: string, tier: string): Promise<void>;
    removeOffender(id: bigint): Promise<void>;
    removeWatchlistEntry(id: bigint): Promise<void>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: Profile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateWatchlistTag(id: bigint, newTag: Variant_avoid_safe_unknown): Promise<void>;
}
