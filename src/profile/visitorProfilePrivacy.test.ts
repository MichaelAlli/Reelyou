import { buildProfileSkywritingsSection } from '@/profile/buildProfileSkywritingsSection';
import { buildVisitorProfileView } from '@/profile/buildVisitorProfileView';
import { ORBIT_PROFILE_SKYWRITE_FIXTURES } from '@/profile/orbitProfileSkywriteFixtures';
import {
  buildVisitorSkywritingTabsFromVisibleItems,
  isVisitorProfileBlocked,
} from '@/profile/resolveVisitorProfilePrivacy';
import { filterVisitorVisibleSkywrites } from '@/profile/buildSkywritingPreviews';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function testVisitorTabsHidePrivateOnlyCategories() {
  const section = buildProfileSkywritingsSection({
    skywrites: ORBIT_PROFILE_SKYWRITE_FIXTURES['orbit-jordan'],
    viewerMode: 'visitor',
    isConnected: false,
  });
  const labels = section.tabs.map((tab) => tab.label);
  assert(labels.includes('All'), 'all tab');
  assert(labels.includes('Growth'), 'growth visible');
  assert(labels.includes('Purpose'), 'purpose visible');
  assert(!labels.includes('Creativity'), 'creativity tab hidden — private-only');
  assert(section.items.every((item) => !item.label.toLowerCase().includes('private')), 'no private text');
}

function testOwnerStillHasBetaTabs() {
  const section = buildProfileSkywritingsSection({
    skywrites: ORBIT_PROFILE_SKYWRITE_FIXTURES['orbit-jordan'],
    viewerMode: 'owner',
  });
  assert(section.tabs.length === 4, 'owner beta tabs unchanged');
}

function testBlockHelper() {
  assert(isVisitorProfileBlocked('orbit-1', ['orbit-1']), 'blocked');
  assert(!isVisitorProfileBlocked('orbit-1', []), 'not blocked');
}

function testPrivateSkywriteFilteredBeforeTabs() {
  const visible = filterVisitorVisibleSkywrites(
    ORBIT_PROFILE_SKYWRITE_FIXTURES['orbit-jordan'],
    false,
  );
  const tabs = buildVisitorSkywritingTabsFromVisibleItems(
    visible.map((record) => ({
      id: record.id,
      label: record.text.slice(0, 28),
      skyAreaId: record.skyAreaId ?? 'growth',
      tone: 'leaf' as const,
    })),
  );
  assert(!tabs.some((tab) => tab.id === 'creativity'), 'no creativity tab');
}

function testVisitorViewUsesFilteredSection() {
  const view = buildVisitorProfileView({
    ownerId: 'orbit-jordan',
    connectionStatus: 'none',
  });
  assert(view !== null, 'view');
  assert(
    !view!.skywritings.tabs.some((tab) => tab.id === 'creativity'),
    'visitor view tabs privacy-safe',
  );
}

function run() {
  testVisitorTabsHidePrivateOnlyCategories();
  testOwnerStillHasBetaTabs();
  testBlockHelper();
  testPrivateSkywriteFilteredBeforeTabs();
  testVisitorViewUsesFilteredSection();
  console.log('visitorProfilePrivacy.test.ts — all cases passed');
}

run();
