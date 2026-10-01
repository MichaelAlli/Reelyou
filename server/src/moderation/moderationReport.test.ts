import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.AUTH_JWT_SECRET = 'test-jwt-secret-minimum-32-characters-long';

const tmpDb = path.join(os.tmpdir(), `reellyou-mod-${Date.now()}.json`);
process.env.REELYOU_DB_PATH = tmpDb;

const { resetAccountDatabaseForTests } = await import('../db/accountStore.js');
const { createUser } = await import('../db/accountRepository.js');
const { submitModerationReport, listModerationReportsForOperator } = await import(
  './moderationReportStore.js'
);

resetAccountDatabaseForTests(tmpDb);
const reporter = createUser({
  email: 'reporter@example.com',
  password: 'password123',
  fullName: 'Reporter',
  legalConsent: {
    termsVersion: '2026-10-01-beta-draft',
    privacyVersion: '2026-10-01-beta-draft',
    acceptedAt: Date.now(),
  },
});

const first = submitModerationReport({
  reporterUserId: reporter.id,
  targetType: 'user',
  targetId: 'target-user-1',
  targetOwnerUserId: 'target-user-1',
  reason: 'harassment',
  optionalNote: 'test note',
});
assert.ok(first.ok && !first.duplicate);

const dup = submitModerationReport({
  reporterUserId: reporter.id,
  targetType: 'user',
  targetId: 'target-user-1',
  targetOwnerUserId: 'target-user-1',
  reason: 'harassment',
});
assert.ok(dup.ok && dup.duplicate);

const operatorList = listModerationReportsForOperator();
assert.equal(operatorList.length, 1);
assert.equal(operatorList[0]?.reporterUserId, reporter.id);

fs.unlinkSync(tmpDb);
console.log('moderationReport tests ok');
