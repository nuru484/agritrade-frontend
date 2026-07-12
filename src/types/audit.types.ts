/**
 * Audit-log shapes, mirroring the backend's `toAuditDTO`
 * (agritrade-backend `src/utils/mappers/audit.mapper.ts`).
 */
export interface IAuditLog {
  id: string;
  /** Dotted action, e.g. "auth.login_failed", "user.role_changed". */
  action: string;
  actor: null | { email: string; id: string; name: string };
  entity: string;
  entityId: string | null;
  ip: string | null;
  metadata: unknown;
  createdAt: string;
}

export interface IAuditListResponse {
  message: string;
  data: IAuditLog[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

/** Mirrors the backend `auditListQuery`. */
export interface IAuditListQuery {
  page?: number;
  limit?: number;
  action?: string;
  /** Action-prefix facet, e.g. "auth." / "user.". */
  category?: string;
  actorId?: string;
  entity?: string;
  entityId?: string;
  search?: string;
  /** YYYY-MM-DD, inclusive. */
  from?: string;
  to?: string;
}
