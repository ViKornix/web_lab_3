# TwoSpace

`TwoSpace` — backend-сервис на `NestJS` для хранения личной коллекции фильмов. В проекте реализованы:

- аутентификация по номеру телефона и паролю;
- вход через `Yandex OAuth`;
- восстановление пароля;
- защищённые CRUD-операции для фильмов;
- хранение данных в `PostgreSQL` через `Sequelize`.

## Стек

- `Node.js`
- `NestJS`
- `PostgreSQL`
- `Sequelize`
- `Docker Compose`

## Запуск через Docker

```bash
docker compose up --build
```

В `docker-compose.yml` контейнер приложения запускается на порту `4200`.


## Основные API-эндпоинты

- `POST /auth/register` - регистрация пользователя
- `POST /auth/login` - вход в систему
- `POST /auth/refresh` - обновление access и refresh токенов
- `POST /auth/forgot-password` - запуск восстановления пароля
- `POST /auth/reset-password` - завершение восстановления пароля
- `GET /auth/whoami` - получение данных текущего пользователя
- `POST /auth/logout` - выход из текущей сессии
- `POST /auth/logout-all` - выход из всех сессий
- `GET /auth/oauth/yandex` - начало OAuth-авторизации через Яндекс
- `GET /movies` - получение списка фильмов с пагинацией
- `GET /movies/:id` - получение фильма по идентификатору
- `POST /movies` - создание записи о фильме
- `PUT /movies/:id` - полная замена записи о фильме
- `PATCH /movies/:id` - частичное обновление записи о фильме
- `DELETE /movies/:id` - удаление записи о фильме

## Переменные окружения

Пример файла: [`.env.example`](./.env.example)

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=two_space
DB_DIALECT=postgres
DB_LOGGING=false

PORT=3000
NODE_ENV=development
AUTH_COOKIE_SECURE=false
AUTH_OAUTH_SUCCESS_REDIRECT=

YANDEX_OAUTH_CLIENT_ID=
YANDEX_OAUTH_CLIENT_SECRET=
YANDEX_OAUTH_REDIRECT_URI=http://localhost:3000/auth/oauth/yandex/callback
YANDEX_OAUTH_SCOPE=login:default_phone

JWT_SECRET=change_me
```
