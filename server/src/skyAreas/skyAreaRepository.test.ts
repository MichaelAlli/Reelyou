import assert from 'node:assert/strict';

import { loadAccountDatabase } from '../db/accountStore.js';
import { SKY_AREA_PROMOTION_THRESHOLD } from './skyAreaConstants.js';
import {
  ensureSkyAreaCatalogSeeded,
  resolveOrCreateSkyAreaForLabel,
  setUserSkyAreaSelection,
} from './skyAreaRepository.js';

process.env.DATABASE_URL = '';

async function run() {
  ensureSkyAreaCatalogSeeded();
  const db = loadAccountDatabase();
  db.userSkyAreas = [];
  db.skyAreas = db.skyAreas?.filter((area) => area.status === 'established') ?? [];

  const userA = 'user-a';
  const userB = 'user-b';
  const userC = 'user-c';
  const label = 'Movement Direction';

  resolveOrCreateSkyAreaForLabel(label, userA);
  let area = db.skyAreas!.find((entry) => entry.normalizedName === 'movement direction');
  assert.ok(area);
  assert.equal(area!.status, 'emerging');
  assert.equal(area!.uniqueUserCount, 1);

  resolveOrCreateSkyAreaForLabel(label, userB);
  area = db.skyAreas!.find((entry) => entry.normalizedName === 'movement direction');
  assert.equal(area!.uniqueUserCount, 2);

  resolveOrCreateSkyAreaForLabel(label, userC);
  area = db.skyAreas!.find((entry) => entry.normalizedName === 'movement direction');
  assert.equal(area!.uniqueUserCount, SKY_AREA_PROMOTION_THRESHOLD);
  assert.equal(area!.status, 'established');
  assert.ok(area!.promotedAt);

  resolveOrCreateSkyAreaForLabel(label, userA);
  area = db.skyAreas!.find((entry) => entry.normalizedName === 'movement direction');
  assert.equal(area!.uniqueUserCount, SKY_AREA_PROMOTION_THRESHOLD);

  const tooMany = setUserSkyAreaSelection(userA, {
    establishedIds: ['dance'],
    customLabels: ['One', 'Two', 'Three', 'Four', 'Five', 'Six'],
  });
  assert.equal(tooMany.ok, false);

  const ok = setUserSkyAreaSelection(userA, {
    establishedIds: ['dance', 'music'],
    customLabels: ['Voice acting', 'Stage direction'],
  });
  assert.equal(ok.ok, true);
  if (ok.ok) {
    assert.ok(ok.skyAreaIds.includes('dance'));
    assert.ok(ok.skyAreaIds.includes('music'));
  }

  console.log('skyAreaRepository.test.ts ok');
}

void run();
