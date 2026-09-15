import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parseCdPhone } from './phone';

test('0812345678 → +243812345678', () => {
  assert.deepEqual(parseCdPhone('0812345678'), { ok: true, phone: '+243812345678' });
});

test('0810000001 → +243810000001', () => {
  assert.deepEqual(parseCdPhone('0810000001'), { ok: true, phone: '+243810000001' });
});

test('810000001 → +243810000001', () => {
  assert.deepEqual(parseCdPhone('810000001'), { ok: true, phone: '+243810000001' });
});

test('+243810000001 → +243810000001', () => {
  assert.deepEqual(parseCdPhone('+243810000001'), { ok: true, phone: '+243810000001' });
});

test('refuse +2430810000001', () => {
  assert.equal(parseCdPhone('+2430810000001').ok, false);
});

test('refuse 2430810000001', () => {
  assert.equal(parseCdPhone('2430810000001').ok, false);
});

test('refuse numéro trop court', () => {
  assert.equal(parseCdPhone('12').ok, false);
});

test('refuse lettres', () => {
  assert.equal(parseCdPhone('81ABC0001').ok, false);
});
