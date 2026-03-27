import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface WatchlistEntry {
    id: bigint;
    tag: Variant_avoid_safe_unknown;
    addedAt: bigint;
    notes: string;
    targetName: string;
    interactionHistory: Array<[bigint, string]>;
}
export type Time = bigint;
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
export interface backendInterface {
    addWatchlistEntry(entry: WatchlistEntry): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    generateInviteCode(): Promise<string>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getAreaIncidents(): Promise<Array<{
        severity: Variant_low_severe_moderate;
        location: string;
        incidentType: string;
    }>>;
    getCallerUserProfile(): Promise<Profile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getProfile(): Promise<Profile>;
    getUnreadAlertCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<Profile | null>;
    getWatchlist(): Promise<Array<WatchlistEntry>>;
    isCallerAdmin(): Promise<boolean>;
    isEliteSubscriber(): Promise<boolean>;
    markAlertRead(alertId: bigint): Promise<void>;
    removeWatchlistEntry(entryId: bigint): Promise<void>;
    saveCallerUserProfile(profile: Profile): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    updateProfile(profile: Profile): Promise<void>;
    updateWatchlistTag(entryId: bigint, newTag: Variant_avoid_safe_unknown): Promise<void>;
}
