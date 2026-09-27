import assert from 'node:assert/strict';

import { SKY_INVITATION_SAFETY_VERSION } from '@/skywrite/invitations/skyInvitationSafetyAck';

assert(SKY_INVITATION_SAFETY_VERSION === 1, 'safety acknowledgement version');

console.log('skyInvitationSafetyAck.test.ts — OK');
