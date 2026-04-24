import {subtle} from 'crypto';
import {bufferToHex} from '@modules/auth/utils/crypto';

export function generateSalt(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return bufferToHex(bytes);
}

export async function hashPassword(salt: string, password: string): Promise<string> {
    const encoder = new TextEncoder();
    const hashBuffer = await subtle.digest('SHA-512', encoder.encode(password + salt));

    return bufferToHex(hashBuffer);
}
