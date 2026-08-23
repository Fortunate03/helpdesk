/**
 * Reference numbers are random rather than sequential. A counter-based reference
 * lets anyone read ICT-2026-00001 and walk upwards through every request in the
 * system on the public tracker, which exposes volume and activity even though the
 * tracker itself shows no personal detail.
 *
 * Crockford Base32: no I, L, O or U. That removes the characters people misread when
 * copying a code off a screen, and stops a reference accidentally spelling a word.
 * 12 characters from a 32-character alphabet is 32^12, about 1.2 x 10^18 possibilities.
 */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export const REFERENCE_LENGTH = 12;
export const REFERENCE_PATTERN = new RegExp(`^[${ALPHABET}]{${REFERENCE_LENGTH}}$`);

export function generateReference() {
  const bytes = new Uint8Array(REFERENCE_LENGTH);
  crypto.getRandomValues(bytes);

  // 256 is an exact multiple of 32, so the remainder introduces no bias.
  let reference = "";
  for (const byte of bytes) reference += ALPHABET[byte % ALPHABET.length];

  return reference;
}

/**
 * Accepts what someone actually types: lower case, spaces or dashes they added
 * themselves, and the letters Crockford treats as interchangeable with digits.
 */
export function normalizeReference(input: string) {
  return input
    .trim()
    .toUpperCase()
    .replace(/[\s-]/g, "")
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1");
}

export function isValidReference(value: string) {
  return REFERENCE_PATTERN.test(value);
}
