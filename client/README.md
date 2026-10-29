# CityWalk — mobile app

Aplikacja mobilna z gotowymi trasami spacerowymi po miastach.
React Native (Expo), iOS + Android, jeden kod źródłowy.

## Wymagania

- Node.js 20+
- Telefon z aplikacją **Expo Go** ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)) — telefon i komputer muszą być w tej samej sieci Wi-Fi
- Opcjonalnie: Android Studio, jeśli chcesz uruchamiać na emulatorze

## Uruchomienie

```bash
npm install
npm start
```

Zeskanuj kod QR z terminala: aparatem (iOS) lub z poziomu Expo Go (Android).

Dodatkowe komendy:

```bash
npm run android     # otwiera od razu na podłączonym urządzeniu / emulatorze
npm run web         # podgląd w przeglądarce (bez mapy)
npm run typecheck   # kontrola typów
npm run lint
```

## Struktura projektu

```
src/
├── app/                  # ekrany — routing plikowy (expo-router)
│   ├── (tabs)/           # dolna nawigacja: start, miasta, szukaj
│   ├── city/[slug].tsx   # trasy w wybranym mieście
│   └── route/[slug].tsx  # szczegóły trasy: opis, statystyki, mapa, punkty
├── api/                  # warstwa danych: REST API lub dane testowe
├── components/           # komponenty współdzielone
│   └── ui/               # prymitywy: Text, Card, Chip, Button, Screen
├── theme/                # tokeny designu — kolory, odstępy, typografia
├── i18n/                 # tłumaczenia PL / EN
├── lib/                  # obliczenia geograficzne, formatowanie
└── types/                # model domenowy (kontrakt z API)
```

### Zasady, które trzymają projekt w ryzach

- **Żaden ekran nie zawiera na sztywno koloru ani wartości w pikselach.** Wszystko pochodzi z `src/theme/tokens.ts`, dzięki czemu odstępy i kontrasty są spójne, a tryb ciemny działa bez dodatkowej pracy.
- **Teksty nie są wpisywane w komponentach.** Katalog `src/i18n` wymusza komplet kluczy w każdym języku — brakujące tłumaczenie to błąd kompilacji, a nie pusta etykieta w aplikacji.
- **Ekrany nie wiedzą, skąd pochodzą dane.** Korzystają z hooków w `src/api/queries.ts`; podmiana danych testowych na prawdziwe API nie wymaga zmian w żadnym ekranie.

## Dane

Domyślnie aplikacja korzysta z danych testowych (`src/api/mock-data.ts`) — trzy miasta i pięć tras z prawdziwymi współrzędnymi. Dystans i czas przejścia są wyliczane z geometrii trasy, tymi samymi wzorami co po stronie serwera.

Aby podłączyć backend (`../server`), skopiuj `.env.example` do `.env` i ustaw `EXPO_PUBLIC_API_URL`, np. `http://192.168.0.10:4000/api/v1` (adres komputera w sieci LAN, nie `localhost`). Po zmianie `.env` uruchom `npx expo start -c`, aby wyczyścić pamięć podręczną bundlera. Ekrany korzystają wtedy z prawdziwego API — warstwa `src/api/client.ts` obsługuje oba źródła.

Podgląd w przeglądarce (`npm run web`) działa na porcie 8081, więc ten adres musi być dodany do `CORS_ORIGINS` w `server/apps/api/.env`.

## Mapa

Mapy działają przez `react-native-maps`: na iOS Apple Maps (bez klucza), na Androidzie Google Maps.

W Expo Go mapa działa od razu. Klucz Google Maps API będzie potrzebny dopiero przy budowaniu samodzielnej aplikacji na Androida — należy go wtedy dodać w `app.json` w sekcji `android.config.googleMaps.apiKey`.

## Budowanie aplikacji

Do zbudowania plików instalacyjnych służy EAS Build — buduje w chmurze, więc **iOS można zbudować także z komputera z Windows**:

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview   # plik .apk do instalacji
eas build --platform ios                         # wymaga konta Apple Developer
```
