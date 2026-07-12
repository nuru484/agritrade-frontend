/**
 * The authenticated console user, mirroring the backend's `toPublicUser`
 * mapper (agritrade-backend `src/utils/mappers/user.mapper.ts`) — the safe,
 * client-facing subset (never the password hash or `tokenVersion`).
 */
export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  STAFF = "STAFF",
  AGENT = "AGENT",
}

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  /** A requested new sign-in email awaiting confirmation from that mailbox. */
  pendingEmail: string | null;
  phone: string | null;
  profilePicture: string | null;
  role: UserRole;
  /** Owner-delegable approval right (decides pending ApprovalRequests). */
  canApprove: boolean;
  /** When false, money columns are stripped from API responses for this user. */
  financialVisibility: boolean;
  isActive: boolean;
  twoFactorEnabled: boolean;
  /** Hard-blocked after repeated failed logins; null when not blocked. */
  blockedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Standard success envelope carrying a single user. Mirrors the backend
 * `sendSuccess({ user })` shape exactly: `{ message, data: { user } }`
 * (login, 2FA verify/confirm/disable, refresh-token, and `/auth/me` all use it).
 */
export interface IUserResponse {
  message: string;
  data: { user: IUser };
}
