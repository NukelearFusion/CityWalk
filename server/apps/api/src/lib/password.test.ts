import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hashPassword, needsRehash, verifyPassword } from './password.ts';

describe('password hashing', () => {
  it('verifies the password it was produced from', async () => {
    const hash = await hashPassword('correct horse battery');

    assert.equal(await verifyPassword('correct horse battery', hash), true);
    assert.equal(await verifyPassword('wrong horse battery', hash), false);
  });

  it('salts every hash', async () => {
    const [a, b] = await Promise.all([hashPassword('same'), hashPassword('same')]);

    assert.notEqual(a, b);
  });

  it('matches a password typed in a different Unicode composition', async () => {
    // "ó" as one code point, then as "o" followed by a combining accent.
    const hash = await hashPassword('Kraków');

    assert.equal(await verifyPassword('Kraków', hash), true);
  });

  it('rejects malformed and tampered hashes instead of throwing', async () => {
    assert.equal(await verifyPassword('x', ''), false);
    assert.equal(await verifyPassword('x', 'bcrypt$1$2$3$4$5'), false);
    assert.equal(await verifyPassword('x', 'scrypt$999999999$8$1$AAAA$AAAA'), false);
  });

  it('flags hashes made with weaker parameters for an upgrade', async () => {
    assert.equal(needsRehash(await hashPassword('x')), false);
    assert.equal(needsRehash('scrypt$1024$8$1$AAAA$AAAA'), true);
  });
});
