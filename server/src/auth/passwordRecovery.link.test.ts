import assert from 'node:assert/strict';

process.env.APP_ORIGIN = 'https://reelyou.onrender.com/';

async function run() {
  const { config } = await import('../config.js');
  assert.equal(config.appOrigin.replace(/\/$/, ''), 'https://reelyou.onrender.com');

  const token = 'abc123token';
  const link = `${config.appOrigin.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
  assert.equal(link, 'https://reelyou.onrender.com/reset-password?token=abc123token');
  console.log('passwordRecovery.link.test.ts ok');
}

void run();
