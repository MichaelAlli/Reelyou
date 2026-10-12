import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { LEGACY_ONBOARDING_INTRO_MARKERS } from '@/auth/legacyOnboardingIntroCopy';
import {
  assertRegistryCoversCatalog,
  QA_PREVIEW_SCREEN_SPECS,
  qaPreviewTargetPathname,
  readRepoFile,
  resolveQaPreviewAppRouteFile,
} from '@/qa/qaPreviewScreenRegistry';
import { QA_PREVIEW_TARGETS, withQaPreviewHref } from '@/qa/qaPreviewRoutes';

assertRegistryCoversCatalog();

const hrefById = new Map(QA_PREVIEW_TARGETS.map((t) => [t.id, t.href]));
const specById = new Map(QA_PREVIEW_SCREEN_SPECS.map((s) => [s.targetId, s]));

/** hrefs may repeat when query differs (library tabs, photo vs video). */
const pathnameOwners = new Map<string, string[]>();
for (const target of QA_PREVIEW_TARGETS) {
  const path = qaPreviewTargetPathname(target.href);
  const owners = pathnameOwners.get(path) ?? [];
  owners.push(target.id);
  pathnameOwners.set(path, owners);
}

for (const target of QA_PREVIEW_TARGETS) {
  const spec = specById.get(target.id);
  assert.ok(spec, `spec for ${target.id}`);

  const routePath = qaPreviewTargetPathname(target.href);
  const routeFile = resolveQaPreviewAppRouteFile(routePath);
  assert.ok(routeFile, `missing app route file for ${target.id} → ${routePath}`);
  const expectedRouteFile = join(process.cwd(), spec.appRouteFile);
  assert.equal(
    routeFile,
    expectedRouteFile,
    `route file mismatch for ${target.id}: expected ${spec.appRouteFile}`,
  );

  assert.ok(existsSync(join(process.cwd(), spec.markerModule)), `marker module missing: ${spec.markerModule}`);
  const moduleSource = readRepoFile(spec.markerModule);
  assert.match(
    moduleSource,
    new RegExp(spec.screenMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    `${target.id} marker ${spec.screenMarker} not found in ${spec.markerModule}`,
  );

  const routeSource = readRepoFile(spec.appRouteFile);
  for (const marker of LEGACY_ONBOARDING_INTRO_MARKERS) {
    assert.doesNotMatch(routeSource, new RegExp(marker), `${target.id} route must not reference legacy intro`);
  }

  const previewHref = withQaPreviewHref(target.href);
  assert.match(previewHref, /qaPreview=1/, `${target.id} must append qaPreview=1`);

  if (spec.effectivePath) {
    assert.notEqual(
      routePath,
      spec.effectivePath,
      `${target.id} should enter via ${routePath} before redirect`,
    );
    assert.ok(
      resolveQaPreviewAppRouteFile(spec.effectivePath),
      `${target.id} effective path missing: ${spec.effectivePath}`,
    );
  }
}

const starpathIntro = QA_PREVIEW_TARGETS.find((t) => t.id === 'onboarding-starpath');
assert.equal(starpathIntro?.href, '/onboarding/starpath', 'Starpath intro must use onboarding/starpath route');
assert.doesNotMatch(starpathIntro!.href, /welcome/i, 'Starpath intro must not target Welcome');

const starpathRedirect = readRepoFile('src/app/(post-welcome)/onboarding/starpath.tsx');
assert.match(starpathRedirect, /useQaPreviewMode/, 'starpath redirect must preserve QA preview context');
assert.match(starpathRedirect, /\/process/, 'starpath redirect must land on Process screen');

const splash = QA_PREVIEW_TARGETS.find((t) => t.id === 'splash');
assert.equal(splash?.href, '/qa/preview/splash');

const welcome = QA_PREVIEW_TARGETS.find((t) => t.id === 'welcome');
assert.equal(welcome?.href, '/welcome');

for (const target of QA_PREVIEW_TARGETS) {
  assert.ok(!target.href.includes('/onboarding/index'), `avoid generic onboarding index: ${target.id}`);
  assert.notEqual(target.href.split('?')[0], '/', `${target.id} must not use / (auto-advances from splash)`);
}

console.log(`qaGalleryRouting.test.ts ok (${QA_PREVIEW_TARGETS.length} entries)`);
