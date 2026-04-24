import {TokenTypes} from '@entities/token.entity';

export const AUTH_COOKIES = {
    [TokenTypes.ACCESS]: `${TokenTypes.ACCESS}_token`,
    [TokenTypes.REFRESH]: `${TokenTypes.REFRESH}_token`,
    [TokenTypes.RESET_PASSWORD]: `${TokenTypes.RESET_PASSWORD}_token`,
    oauthState: 'oauth_state',
} as const;

export const AUTH_PROVIDERS = {
    YANDEX: 'yandex',
} as const;

export type AuthProvider = (typeof AUTH_PROVIDERS)[keyof typeof AUTH_PROVIDERS];
