/**
 * Canonical authenticated identity for Reelyou Beta.
 * Product code should resolve the signed-in user only through these exports.
 */
export { resolveActiveUserId } from '@/auth/resolveActiveUserId';
export { resolveSessionUserId, resolveSessionUserIdOrDemo } from '@/auth/resolveSessionUserId';
export {
  useSessionUserId,
  useEffectiveViewerId,
  useRequireEffectiveViewerId,
} from '@/auth/useSessionUserId';
