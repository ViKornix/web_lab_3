import {subtle} from 'crypto';
import {bufferToHex} from '@modules/auth/utils/crypto';

export async function hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder();

    return bufferToHex(await subtle.digest('SHA-256', encoder.encode(token)));
}
