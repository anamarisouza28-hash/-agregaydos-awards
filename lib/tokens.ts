import { randomBytes } from 'crypto';

// 24 caracteres aleatórios (144 bits): impossível de adivinhar.
export function newToken() {
  return randomBytes(18).toString('base64url');
}
