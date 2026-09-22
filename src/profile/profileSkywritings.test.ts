import { buildProfileBetaSkywritingTabs, buildProfileSkywritingsSection } from '@/profile/buildProfileSkywritingsSection';
import { ORBIT_PROFILE_SKYWRITE_FIXTURES } from '@/profile/orbitProfileSkywriteFixtures';
import { buildVisitorProfileView } from '@/profile/buildVisitorProfileView';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function testBetaTabsOnly() {
  const tabs = buildProfileBetaSkywritingTabs();
  const labels = tabs.map((tab) => tab.label);
  assert(labels.join('|') === 'All|Growth|Purpose|Creativity', 'beta tab set');
  assert(!labels.includes('Contribution'), 'no contribution tab');
}

function testNoExtraTabsFromData() {
  const section = buildProfileSkywritingsSection({
    skywrites: ORBIT_PROFILE_SKYWRITE_FIXTURES['orbit-jordan'],
    viewerMode: 'owner',
  });
  assert(section.tabs.length === 4, 'four tabs only');
}

function testVisitorPrivacyTabs() {
  const view = buildVisitorProfileView({
    ownerId: 'orbit-jordan',
    connectionStatus: 'none',
  });
  assert(view !== null, 'visitor view');
  const labels = view!.skywritings.tabs.map((tab) => tab.label).join('|');
  assert(labels === 'All|Growth|Purpose', 'visitor tabs from visible content only');
}

function run() {
  testBetaTabsOnly();
  testNoExtraTabsFromData();
  testVisitorPrivacyTabs();
  console.log('profileSkywritings.test.ts — all cases passed');
}

run();
