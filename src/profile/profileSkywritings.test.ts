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

function testVisitorBetaTabs() {
  const view = buildVisitorProfileView({
    ownerId: 'orbit-jordan',
    connectionStatus: 'none',
  });
  assert(view !== null, 'visitor view');
  assert(view!.skywritings.tabs.length === 4, 'visitor beta tabs');
}

function run() {
  testBetaTabsOnly();
  testNoExtraTabsFromData();
  testVisitorBetaTabs();
  console.log('profileSkywritings.test.ts — all cases passed');
}

run();
