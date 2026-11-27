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
