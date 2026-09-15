import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseCdPhone } from '../../../lib/phone';
import { resolveDevAuthBypass } from './demoAuthEnabled';
import { buildDirectDemoUser } from './demoAuthLogic';

test('contournement uniquement en développement ou debug embarqué', () => {
  assert.equal(resolveDevAuthBypass(true, false), true);
  assert.equal(resolveDevAuthBypass(true, undefined), true);
  assert.equal(resolveDevAuthBypass(false, true), true);
  assert.equal(resolveDevAuthBypass(false, false), false);
  assert.equal(resolveDevAuthBypass(false, undefined), false);
});

test('0812345678 → +243812345678 et profil local', () => {
  assert.deepEqual(parseCdPhone('0812345678'), { ok: true, phone: '+243812345678' });
  const session = buildDirectDemoUser('0812345678', '2026-01-01T00:00:00.000Z');
  assert.equal(session.mode, 'demo-local');
  assert.equal(session.user.id, 'demo-rider-local');
  assert.equal(session.user.phone, '+243812345678');
  assert.equal(session.user.role, 'rider');
  assert.equal(session.user.displayName, 'Client Taxi Na Biso');
});

test('n’importe quel numéro RDC à 9 chiffres après +243 est accepté', () => {
  const session = buildDirectDemoUser('0820000000');
  assert.equal(session.user.id, 'demo-rider-local');
  assert.equal(session.user.phone, '+243820000000');
});

test('numéro trop court refusé', () => {
  assert.throws(() => buildDirectDemoUser('12'));
});
