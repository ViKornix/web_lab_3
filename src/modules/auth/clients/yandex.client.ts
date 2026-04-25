import {BadGatewayException, BadRequestException, Injectable} from '@nestjs/common';
import axios, {AxiosError} from 'axios';

export type OAuthTokensResponse = {
    access_token: string;
    refresh_token?: string;
    token_type?: string;
    expires_in?: number;
};

export type YandexUserResponse = {
    id: string;
    login?: string;
    default_phone?: {
        id?: number;
        number?: string;
    };
};

@Injectable()
export class YandexClient {
    private readonly authorizeUrl = 'https://oauth.yandex.ru/authorize';
    private readonly tokenUrl = 'https://oauth.yandex.ru/token';
    private readonly userInfoUrl = 'https://login.yandex.ru/info';

    getAuthorizationUrl(state: string) {
        const clientId = process.env.YANDEX_OAUTH_CLIENT_ID;
        const redirectUri = process.env.YANDEX_OAUTH_REDIRECT_URI;

        if (!clientId || !redirectUri) {
            throw new BadRequestException('Yandex OAuth не настроен');
        }

        const url = new URL(this.authorizeUrl);
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('client_id', clientId);
        url.searchParams.set('redirect_uri', redirectUri);
        url.searchParams.set('state', state);
        url.searchParams.set('scope', process.env.YANDEX_OAUTH_SCOPE ?? 'login:phone');

        return url.toString();
    }

    async exchangeCode(code: string): Promise<OAuthTokensResponse> {
        const clientId = process.env.YANDEX_OAUTH_CLIENT_ID;
        const clientSecret = process.env.YANDEX_OAUTH_CLIENT_SECRET;
        const redirectUri = process.env.YANDEX_OAUTH_REDIRECT_URI;

        if (!clientId || !clientSecret || !redirectUri) {
            throw new BadRequestException('Yandex OAuth не настроен');
        }

        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
        });

        try {
            const response = await axios.post<OAuthTokensResponse>(
                this.tokenUrl,
                body,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                },
            );

            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new BadGatewayException(
                    `Не удалось обменять OAuth-код Яндекса: ${error.response?.status ?? error.code ?? 'ошибка запроса'}`,
                );
            }

            throw error;
        }
    }

    async fetchUser(accessToken: string): Promise<YandexUserResponse> {
        try {
            const response = await axios.get<YandexUserResponse>(
                this.userInfoUrl,
                {
                    headers: {
                        Authorization: `OAuth ${accessToken}`,
                    },
                },
            );

            return response.data;
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new BadGatewayException(
                    `Не удалось получить профиль пользователя Яндекса: ${error.response?.status ?? error.code ?? 'ошибка запроса'}`,
                );
            }

            throw error;
        }
    }
}
