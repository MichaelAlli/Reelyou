import { isSkyAreaCategoryId } from '@/skyAreas/skyAreaCategory';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
import {
  addCustomSkyArea,
  isBeaconActiveForArea,
  selectedSkyAreaIds,
  setPauseAllContributionBeacons,
  setSkyAreaBeaconEnabled,
  setStillDiscovering,
  toggleSkyAreaSelection,
} from '@/skyAreas/skyAreaPreferencesLogic';
import { parseSkyAreaPreferencesRecord } from '@/skyAreas/skyAreaPreferencesPersistence';
import { emptySkyAreaPreferences } from '@/skyAreas/skyAreaPreferencesTypes';

function testSelectionAndBeacons() {
  let record = emptySkyAreaPreferences('user-michael');
  record = toggleSkyAreaSelection(record, 'growth');
  record = toggleSkyAreaSelection(record, 'purpose');
  assertEqual(selectedSkyAreaIds(record).sort(), ['growth', 'purpose'], 'selected ids');
  assert(isBeaconActiveForArea(record, 'growth'), 'growth beacon on');

  record = setSkyAreaBeaconEnabled(record, 'growth', false);
  assert(!isBeaconActiveForArea(record, 'growth'), 'growth beacon off');
  assert(isBeaconActiveForArea(record, 'purpose'), 'purpose beacon on');

  record = setPauseAllContributionBeacons(record, true);
  assert(!isBeaconActiveForArea(record, 'purpose'), 'pause all');
  assertEqual(selectedSkyAreaIds(record).sort(), ['growth', 'purpose'], 'selections kept');

  record = setPauseAllContributionBeacons(record, false);
  assert(isBeaconActiveForArea(record, 'purpose'), 'pause lifted');
}

function testDiscoveringClearsSelections() {
  let record = emptySkyAreaPreferences('user-michael');
  record = toggleSkyAreaSelection(record, 'creativity');
  record = setStillDiscovering(record, true);
  assert(record.stillDiscovering, 'discovering');
  assertEqual(selectedSkyAreaIds(record), [], 'cleared selections');
}

function testCustomAreaUsesCanonicalPrefix() {
  let record = emptySkyAreaPreferences('user-michael');
  const result = addCustomSkyArea(record, 'Dance Training', [], []);
  assert(result.area != null, 'custom area');
  assert(result.area!.id.startsWith('custom-'), 'custom id prefix');
  assert(selectedSkyAreaIds(result.record).length === 1, 'auto-select custom');
}

function testPersistenceParse() {
  const raw = JSON.stringify({
    userId: 'user-michael',
    stillDiscovering: false,
    pauseAllBeacons: true,
    preferences: [
      {
        skyAreaId: 'growth',
        selected: true,
        beaconEnabled: true,
        createdAt: 1,
        updatedAt: 2,
      },
    ],
    customAreas: [],
    updatedAt: 3,
  });
  const parsed = parseSkyAreaPreferencesRecord(raw, 'user-michael');
  assert(parsed.pauseAllBeacons, 'parsed pause');
  assert(parsed.preferences.length === 1, 'parsed prefs');
  assert(isSkyAreaCategoryId('entrepreneurship'), 'entrepreneurship id');
}

testSelectionAndBeacons();
testDiscoveringClearsSelections();
testCustomAreaUsesCanonicalPrefix();
testPersistenceParse();

console.log('skyAreaPreferences.test.ts — OK');
