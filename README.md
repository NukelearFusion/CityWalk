# CityWalk — пешеходные маршруты по городам

Дипломный проект: REST API и приложение для туристов (Android, iOS и веб из одного кода).

## Где что лежит

```
Diplomka/
├── README.md                 ← этот файл
├── server/                   ← СЕРВЕР (backend)
│   ├── apps/api/             ← REST API: Express 5 + Prisma
│   │   ├── src/
│   │   │   ├── modules/      ← эндпоинты: auth, cities, routes, favorites, admins
│   │   │   ├── middleware/   ← авторизация, валидация, ошибки, rate limit
│   │   │   ├── lib/          ← пароли, токены, почта, логгер, БД
│   │   │   └── config/       ← переменные окружения, политика безопасности
│   │   ├── prisma/           ← схема БД, миграции, seed с демо-данными
│   │   └── .env              ← локальные настройки (не в git)
│   ├── packages/shared/      ← общие типы, схемы Zod, формулы дистанции и времени
│   └── docker-compose.yml    ← база PostgreSQL
│
├── client/                   ← ПРИЛОЖЕНИЕ (frontend): Android, iOS и веб
│   ├── src/
│   │   ├── app/              ← экраны (expo-router): главная, города, поиск, маршрут
│   │   ├── components/       ← карточки, карта, фильтры, UI-элементы
│   │   ├── api/              ← работа с сервером + тестовые данные
│   │   ├── i18n/             ← переводы PL / EN
│   │   └── theme/            ← цвета, отступы, шрифты
│   ├── assets/               ← иконки и заставка
│   └── .env                  ← адрес API (не в git)
│
├── docs/                     ← ДОКУМЕНТЫ
│   ├── Wymagania funkcjonalne.xlsx    ← требования 4.1.1–4.1.35
│   ├── Diagram przypadków użycia.png  ← диаграмма прецедентов
│   ├── DEMO.md                        ← как запустить и что показывать
│   ├── DEPLOY.md                      ← публикация на Render и Netlify
│   └── ОТВЕТЫ_ПРЕПОДАВАТЕЛЮ.md        ← ответы на вопросы по проекту
│
├── render.yaml / netlify.toml ← настройки хостинга
└── _backup/                  ← архивы исходников (не в git)
```

**Веб-версия — это не отдельный проект.** Тот же код из `client/` работает в браузере
(`npm run web`, http://localhost:8081). Отличие одно: карта маршрута показывается только на телефоне.

## Быстрый запуск

```bash
# 1. Docker Desktop должен быть запущен
cd server
npm run db:up        # база
npm run dev          # API → http://localhost:4000

# 2. во втором терминале
cd client
npm start            # QR-код для Expo Go (SDK 57) или клавиша w — браузер
```

Подробно — в [docs/DEMO.md](docs/DEMO.md).
