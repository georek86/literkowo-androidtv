import { test } from 'node:test';
import assert from 'node:assert/strict';
import { acquireKeyboardProtection } from '../keyboard-protection.js';

function environment() {
  const calls = [];
  const document = {
    fullscreenEnabled: true,
    fullscreenElement: null,
    documentElement: {
      async requestFullscreen() { calls.push('fullscreen'); document.fullscreenElement = this; },
    },
  };
  const keyboard = {
    async lock(...args) { calls.push(['lock', ...args]); },
    unlock() { calls.push('unlock'); },
  };
  return { document, keyboard, calls, secureContext: true };
}

test('requests every available key only after entering fullscreen', async () => {
  const env = environment();
  assert.deepEqual(await acquireKeyboardProtection(env), { locked: true });
  assert.deepEqual(env.calls, ['fullscreen', ['lock']], 'an explicit key list would weaken the all-key request');
});

test('unsupported and insecure contexts cannot report protection or enter partial fullscreen', async () => {
  for (const change of [env => { env.secureContext = false; }, env => { env.keyboard = undefined; }, env => { env.document.fullscreenEnabled = false; }]) {
    const env = environment();
    change(env);
    const result = await acquireKeyboardProtection(env);
    assert.equal(result.locked, false);
    assert.ok(result.reason);
    assert.deepEqual(env.calls, []);
  }
});

test('fullscreen rejection cannot proceed to a keyboard lock request', async () => {
  const env = environment();
  env.document.documentElement.requestFullscreen = async () => { throw new Error('Denied'); };
  const result = await acquireKeyboardProtection(env);
  assert.equal(result.locked, false);
  assert.deepEqual(env.calls, []);
});

test('keyboard rejection is reported instead of treating fullscreen as protection', async () => {
  const env = environment();
  env.keyboard.lock = async () => { throw new Error('Denied'); };
  assert.equal((await acquireKeyboardProtection(env)).locked, false);
});

test('leaving fullscreen during the async lock request releases the result', async () => {
  const env = environment();
  env.keyboard.lock = async () => { env.document.fullscreenElement = null; };
  assert.equal((await acquireKeyboardProtection(env)).locked, false);
  assert.deepEqual(env.calls, ['fullscreen', 'unlock']);
});

test('resuming inside fullscreen requests the keyboard lock again', async () => {
  const env = environment();
  env.document.fullscreenElement = env.document.documentElement;
  assert.equal((await acquireKeyboardProtection(env)).locked, true);
  assert.deepEqual(env.calls, [['lock']]);
});
