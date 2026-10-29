# Публикация: Render (API + база) и Netlify (веб-версия)

Конфиги уже в репозитории: `render.yaml` и `netlify.toml` в корне.
Оба сервиса берут код из **GitHub**, поэтому сначала нужен репозиторий.

## 0. GitHub

Создать пустой репозиторий (лучше приватный) и отправить код:

```bash
git remote add origin https://github.com/<логин>/citywalk.git
git push -u origin main
```

## 1. Render — API и PostgreSQL

1. https://dashboard.render.com → **New → Blueprint** → выбрать репозиторий.
   Render прочитает `render.yaml` и создаст базу `citywalk-db` и сервис `citywalk-api`.
2. Заполнить переменные, которые он спросит:

   | Переменная | Значение |
   | --- | --- |
   | `CORS_ORIGINS` | адрес сайта Netlify, например `https://citywalk.netlify.app` (можно поправить после шага 2) |
   | `RECOVERY_EMAIL` | ваша почта для кодов суперадмина |
   | `SMTP_HOST` / `SMTP_USER` / `SMTP_PASSWORD` | для Gmail: `smtp.gmail.com`, ваш адрес, **пароль приложения** (не пароль аккаунта) |
   | `SMTP_FROM` | например `CityWalk <ваш адрес>` |

   Без SMTP сервер в production **не запустится** — это защита: коды входа админа отправляются по почте.
3. После деплоя проверить: `https://citywalk-api-qke1.onrender.com/health` → `{"status":"ok"}`.
4. **Залить демо-данные** (в production сид их не создаёт). В Render: база → **Connect → External Database URL**, скопировать и выполнить локально:

   ```bash
   cd server
   DATABASE_URL="<External Database URL>" npm run db:seed
   ```

## 2. Netlify — веб-версия

1. https://app.netlify.com → **Add new site → Import an existing project** → GitHub → репозиторий.
   Настройки сборки подтянутся из `netlify.toml` (папка `client`, команда `npx expo export --platform web`, публикация `dist`).
2. **Deploy**. Адрес API (`EXPO_PUBLIC_API_URL`) уже задан в `netlify.toml`, вручную добавлять не нужно.
3. Адрес сайта вписать в `CORS_ORIGINS` на Render (если отличается) → Render перезапустится.

## 3. Телефон с публичным API

В `client/.env`: `EXPO_PUBLIC_API_URL=https://citywalk-api-qke1.onrender.com/api/v1`, затем `npx expo start -c`.
Телефону больше не нужна та же Wi-Fi сеть, что и компьютеру.

## Ограничения бесплатных тарифов

- **Render free** засыпает после ~15 минут без запросов; первый запрос после сна идёт ~1 минуту.
  Перед показом откройте `/health`, чтобы «разбудить» сервер.
- **Бесплатная база Render** живёт ограниченный срок (сейчас около 30 дней) — проверьте условия в панели.
- Карта в веб-версии не показывается (только на телефоне).
