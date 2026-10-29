import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto';

/**
 * Promise wrapper around `scrypt`.
 *
 * Written by hand rather than with `promisify`, whose overload resolution picks
 * the three-argument signature and drops the options parameter that carries the
 * cost factors.
 */
function scryptAsync(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

/**
 * Password hashing with scrypt.
 *
 * scrypt is memory-hard and part of Node's standard library, so the API has no
 * native build step — which matters because the deployment target compiles the
 * project from source on every release.
 *
 * Cost parameters follow the current OWASP guidance (N ≥ 2^15, r = 8, p = 1)
 * and are stored inside each hash, so they can be raised later without
 * invalidating existing passwords.
 */
const PARAMS = {
  N: 32_768,
  r: 8,
  p: 1,
  keyLength: 64,
  saltLength: 16,
} as const;

/** scrypt needs roughly 128 · N · r bytes; the default 32 MiB cap is exactly at the limit. */
const MAX_MEMORY = 128 * PARAMS.N * PARAMS.r * 2;

const SEPARATOR = '$';
const ALGORITHM = 'scrypt';

function derive(
  password: string,
  salt: Buffer,
  N: number,
  r: number,
  p: number,
  keyLength: number,
): Promise<Buffer> {
  // Normalised so that a password typed with a different Unicode composition —
  // common with accented characters — still matches the stored hash.
  return scryptAsync(password.normalize('NFKC'), salt, keyLength, {
    N,
    r,
    p,
    maxmem: MAX_MEMORY,
  });
}

/**
 * Returns a self-describing hash:
 *   scrypt$N$r$p$<salt base64url>$<key base64url>
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(PARAMS.saltLength);
  const key = await derive(password, salt, PARAMS.N, PARAMS.r, PARAMS.p, PARAMS.keyLength);

  return [
    ALGORITHM,
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString('base64url'),
    key.toString('base64url'),
  ].join(SEPARATOR);
}

/**
 * Constant-time verification. Returns `false` for malformed hashes rather than
 * throwing, so a corrupted row cannot turn into a 500 on the login endpoint.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(SEPARATOR);
  if (parts.length !== 6) return false;

  const [algorithm, rawN, rawR, rawP, rawSalt, rawKey] = parts as [
    string,
    string,
    string,
    string,
    string,
    string,
  ];

  if (algorithm !== ALGORITHM) return false;

  const N = Number(rawN);
  const r = Number(rawR);
  const p = Number(rawP);
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) return false;
  // Guard against a tampered row demanding an unreasonable amount of memory.
  if (N > PARAMS.N * 4 || r > 32 || p > 16) return false;

  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(rawSalt, 'base64url');
    expected = Buffer.from(rawKey, 'base64url');
  } catch {
    return false;
  }

  if (salt.length === 0 || expected.length === 0) return false;

  const actual = await derive(password, salt, N, r, p, expected.length);

  return timingSafeEqual(actual, expected);
}

/**
 * Whether a stored hash was produced with weaker parameters than the current
 * ones. Lets the login handler transparently upgrade a password it has just
 * verified in plaintext.
 */
export function needsRehash(stored: string): boolean {
  const [algorithm, rawN] = stored.split(SEPARATOR);
  return algorithm !== ALGORITHM || Number(rawN) < PARAMS.N;
}
