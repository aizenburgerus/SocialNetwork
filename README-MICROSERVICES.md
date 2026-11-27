# A-Network — микросервисная версия

Работа ведётся в ветке `microservices`; ветка `main` оставлена без изменений.

| Сервис | Порт | База |
|---|---:|---|
| AuthService | 5001 | auth_db |
| UserService | 5002 | users_db |
| PostService | 5003 | posts_db |
| MessagingService | 5004 | messages_db |
| RabbitMQ | 5672 / 15672 | — |

## Запуск

```bash
docker compose up --build
```

Проверки: `http://localhost:5001/health` ... `http://localhost:5004/health`.

RabbitMQ Management: http://localhost:15672 (логин `social_user`, пароль `local_dev_change_me`).

**Безопасность:** указанные в compose значения предназначены только для локального запуска. Перед публикацией/развёртыванием замени их на секреты из локального .env и не коммить .env.

Это начальный этап выделения сервисов. Перед подключением существующего frontend необходимы API-совместимый шлюз, события RabbitMQ, перенос данных и интеграционные тесты. Новые БД пока не содержат миграцию старых данных.


## RabbitMQ: событие регистрации пользователя

Реализован первый асинхронный сценарий между сервисами:

1. AuthService сохраняет пользователя в `auth_db`.
2. AuthService публикует событие `user.registered` в durable topic exchange `anetwork.events`.
3. UserService получает сообщение из durable queue `user-service.user-registered`.
4. UserService создаёт профиль в `users_db` через `INSERT ... ON CONFLICT`.
5. Сообщение подтверждается через ACK только после успешной записи в БД; при ошибке выполняется NACK с возвратом в очередь.

Формат события:

```json
{
  "eventId": "uuid",
  "eventType": "user.registered",
  "occurredAt": "ISO-8601",
  "payload": {
    "userId": 123,
    "username": "example",
    "email": "example@example.com"
  }
}
```

### Проверка сценария

1. Запустить `docker compose up --build`.
2. Дождаться состояния healthy у RabbitMQ и PostgreSQL.
3. Отправить POST `http://localhost:5001/auth/register` с JSON:

```json
{
  "username": "test_user",
  "email": "test@example.com",
  "password": "test_password_123"
}
```

4. Проверить ответ: `eventPublished: true`.
5. Открыть логи UserService: `docker compose logs -f user-service`. Должно появиться сообщение о создании профиля.
6. Проверить профиль через GET `http://localhost:5002/users/1` (ID взять из ответа регистрации).

Для локального теста используй уникальный email при каждой регистрации. Не используй демонстрационные пароли в публичном развёртывании.

Примечание: это первая интеграция RabbitMQ. Для промышленной надёжности следующим шагом стоит добавить transactional outbox в AuthService, чтобы событие не терялось при сбое брокера между записью пользователя и публикацией.
