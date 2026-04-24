import {Response} from 'express';
import {AUTH_COOKIES} from '@modules/auth/auth.constants';
import {JWT_CONFIG} from '@modules/auth/auth.service';
import {TokenTypes} from '@entities/token.entity';
import {CookieOptions} from 'express';

function isSecureCookie() {
    return process.env.AUTH_COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
}

export function buildCookieOptions(maxAge?: number): CookieOptions {
    return {
        httpOnly: true,
        secure: isSecureCookie(),
        sameSite: 'lax',
        maxAge,
        path: '/',
    };
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie(
        AUTH_COOKIES[TokenTypes.REFRESH],
        refreshToken,
        buildCookieOptions(JWT_CONFIG.refresh.expiresAtTime),
    );

    res.cookie(
        AUTH_COOKIES[TokenTypes.ACCESS],
        accessToken,
        buildCookieOptions(JWT_CONFIG.access.expiresAtTime),
    );
}

export function setResetPasswordCookie(res: Response, resetToken: string) {
    res.cookie(
        AUTH_COOKIES[TokenTypes.RESET_PASSWORD],
        resetToken,
        buildCookieOptions(JWT_CONFIG.reset_password.expiresAtTime),
    );
}

export function clearAuthCookies(res: Response) {
    res.clearCookie(AUTH_COOKIES[TokenTypes.REFRESH], buildCookieOptions());
    res.clearCookie(AUTH_COOKIES[TokenTypes.ACCESS], buildCookieOptions());
}

export function clearResetPasswordCookie(res: Response) {
    res.clearCookie(AUTH_COOKIES[TokenTypes.RESET_PASSWORD], buildCookieOptions());
}
