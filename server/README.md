# CityWalk — API

Serwer REST dla aplikacji z trasami spacerowymi po miastach. Monorepo npm:

```
apps/api/         # Express 5 + Prisma + PostgreSQL
packages/shared/  # schematy Zod, typy DTO, stałe i obliczenia geograficzne
```

Aplikacja (Android, iOS, web) znajduje się w katalogu `../client`.

## Wymagania

- Node.js 20.11+
- Docker Desktop (baza PostgreSQL 16 z `docker-compose.yml`)

## Uruchomienie lokalne

```bash
npm install
cp apps/api/.env.example apps/api/.env   # i ustaw własny JWT_SECRET
npm run db:up                            # PostgreSQL na porcie 5433
npm run db:migrate                       # migracje
npm run db:seed                          # administrator + 3 miasta z trasami
npm run dev                              # API na http://localhost:4000
```

Sprawdzenie: `http://localhost:4000/health` zwraca `{"status":"ok"}`.

Bez skonfigurowanego SMTP kody logowania administratora są wypisywane w konsoli serwera.
Konto administratora z seeda wymaga zmiany hasła przy pierwszym logowaniu.

## Endpointy

Publiczne (`/api/v1`):

| Metoda | Ścieżka               | Opis                                                      |
| ------ | --------------------- | --------------------------------------------------------- |
| GET    | `/cities`             | lista miast z liczbą opublikowanych tras                  |
| GET    | `/cities/:slug`       | jedno miasto                                              |
| GET    | `/routes`             | trasy: `q`, `city`, `category`, czas, dystans, sortowanie |
| GET    | `/routes/featured`    | trasy polecane na stronę główną                           |
| GET    | `/routes/:slug`       | szczegóły trasy z punktami i zdjęciami                    |
| POST   | `/auth/register`      | rejestracja podróżnika                                    |
| POST   | `/auth/login`         | logowanie (administrator: drugi krok kodem e-mail)        |
| GET    | `/auth/me`            | bieżące konto                                             |
| PUT    | `/favorites/:routeId` | dodanie trasy do ulubionych                               |
| DELETE | `/favorites/:routeId` | usunięcie z ulubionych                                    |

Administracyjne: `/api/v1/admin/cities`, `/admin/routes` (wraz z punktami trasy, publikacją i zmianą kolejności), `/admin/admins`.

Przesyłanie zdjęć (wymagania 4.1.32–4.1.33) nie jest jeszcze zaimplementowane, choć zależności `multer` i `cloudinary` są już dodane.

## Kontrola jakości

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```
