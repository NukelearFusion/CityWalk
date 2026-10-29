import type { RouteCategory } from '@/types/domain';

/**
 * Translation catalogue.
 *
 * Polish is the source language; `en` must declare exactly the same keys, which
 * TypeScript enforces through the `Translations` type below. A missing or
 * misspelled key is a compile error, not a blank label at runtime.
 */

const pl = {
  common: {
    appName: 'CityWalk',
    retry: 'Spróbuj ponownie',
    loading: 'Ładowanie…',
    errorTitle: 'Coś poszło nie tak',
    errorBody: 'Nie udało się pobrać danych. Sprawdź połączenie i spróbuj ponownie.',
    notFoundTitle: 'Nie znaleziono',
    notFoundBody: 'Ta strona nie istnieje lub została usunięta.',
    back: 'Wstecz',
    seeAll: 'Zobacz wszystkie',
  },
  tabs: {
    home: 'Start',
    cities: 'Miasta',
    search: 'Szukaj',
  },
  home: {
    greeting: 'Odkrywaj miasta pieszo',
    subtitle: 'Gotowe trasy spacerowe — bez planowania, po prostu ruszaj.',
    featured: 'Polecane trasy',
    browseCities: 'Miasta',
    emptyTitle: 'Brak tras',
    emptyBody: 'Nie opublikowano jeszcze żadnej trasy.',
  },
  cities: {
    title: 'Miasta',
    subtitle: 'Wybierz miasto, aby zobaczyć dostępne trasy.',
    routeCount: {
      one: '%{count} trasa',
      few: '%{count} trasy',
      many: '%{count} tras',
    },
    emptyTitle: 'Brak miast',
    emptyBody: 'Żadne miasto nie zostało jeszcze dodane.',
  },
  city: {
    routesTitle: 'Trasy w mieście',
    emptyTitle: 'Brak tras',
    emptyBody: 'W tym mieście nie ma jeszcze dostępnych tras.',
  },
  search: {
    title: 'Szukaj tras',
    placeholder: 'Nazwa trasy lub miasto',
    filters: 'Filtry',
    clear: 'Wyczyść',
    resultCount: {
      one: '%{count} wynik',
      few: '%{count} wyniki',
      many: '%{count} wyników',
    },
    emptyTitle: 'Brak wyników',
    emptyBody: 'Żadna trasa nie pasuje do wybranych kryteriów. Spróbuj poluzować filtry.',
    duration: 'Czas trwania',
    distance: 'Dystans',
    category: 'Kategoria',
    anyDuration: 'Dowolny',
    anyDistance: 'Dowolny',
    anyCategory: 'Wszystkie',
    upTo: 'do %{value}',
  },
  route: {
    stopsTitle: 'Punkty na trasie',
    descriptionTitle: 'O trasie',
    startingPoint: 'Punkt startowy',
    mapTitle: 'Mapa trasy',
    openMap: 'Otwórz mapę',
    stopCounter: 'Punkt %{position} z %{total}',
    emptyStops: 'Ta trasa nie ma jeszcze zdefiniowanych punktów.',
  },
  units: {
    minutesShort: '%{value} min',
    hoursShort: '%{value} h',
    hoursMinutesShort: '%{hours} h %{minutes} min',
    kilometersShort: '%{value} km',
    metersShort: '%{value} m',
    stops: {
      one: '%{count} punkt',
      few: '%{count} punkty',
      many: '%{count} punktów',
    },
  },
  categories: {
    HISTORICAL: 'Historyczna',
    NATURE: 'Przyroda',
    ARCHITECTURE: 'Architektura',
    CULTURE: 'Kultura',
    FOOD: 'Kulinarna',
  } satisfies Record<RouteCategory, string>,
};

/**
 * Shape every locale must satisfy.
 *
 * Derived from the Polish catalogue without `as const`, so the fields are typed
 * as `string` rather than as their literal values — otherwise no other language
 * could ever satisfy it.
 */
export type Translations = typeof pl;

const en: Translations = {
  common: {
    appName: 'CityWalk',
    retry: 'Try again',
    loading: 'Loading…',
    errorTitle: 'Something went wrong',
    errorBody: 'We could not load the data. Check your connection and try again.',
    notFoundTitle: 'Not found',
    notFoundBody: 'This page does not exist or has been removed.',
    back: 'Back',
    seeAll: 'See all',
  },
  tabs: {
    home: 'Home',
    cities: 'Cities',
    search: 'Search',
  },
  home: {
    greeting: 'Explore cities on foot',
    subtitle: 'Ready-made walking routes — no planning, just go.',
    featured: 'Featured routes',
    browseCities: 'Cities',
    emptyTitle: 'No routes yet',
    emptyBody: 'No route has been published so far.',
  },
  cities: {
    title: 'Cities',
    subtitle: 'Pick a city to see the routes available there.',
    routeCount: {
      one: '%{count} route',
      few: '%{count} routes',
      many: '%{count} routes',
    },
    emptyTitle: 'No cities',
    emptyBody: 'No city has been added yet.',
  },
  city: {
    routesTitle: 'Routes in this city',
    emptyTitle: 'No routes',
    emptyBody: 'There are no routes available in this city yet.',
  },
  search: {
    title: 'Search routes',
    placeholder: 'Route name or city',
    filters: 'Filters',
    clear: 'Clear',
    resultCount: {
      one: '%{count} result',
      few: '%{count} results',
      many: '%{count} results',
    },
    emptyTitle: 'No results',
    emptyBody: 'No route matches the selected criteria. Try relaxing the filters.',
    duration: 'Duration',
    distance: 'Distance',
    category: 'Category',
    anyDuration: 'Any',
    anyDistance: 'Any',
    anyCategory: 'All',
    upTo: 'up to %{value}',
  },
  route: {
    stopsTitle: 'Stops along the route',
    descriptionTitle: 'About this route',
    startingPoint: 'Starting point',
    mapTitle: 'Route map',
    openMap: 'Open map',
    stopCounter: 'Stop %{position} of %{total}',
    emptyStops: 'This route has no stops defined yet.',
  },
  units: {
    minutesShort: '%{value} min',
    hoursShort: '%{value} h',
    hoursMinutesShort: '%{hours} h %{minutes} min',
    kilometersShort: '%{value} km',
    metersShort: '%{value} m',
    stops: {
      one: '%{count} stop',
      few: '%{count} stops',
      many: '%{count} stops',
    },
  },
  categories: {
    HISTORICAL: 'Historical',
    NATURE: 'Nature',
    ARCHITECTURE: 'Architecture',
    CULTURE: 'Culture',
    FOOD: 'Food',
  },
};

export const catalogues = { pl, en } as const;

export type Locale = keyof typeof catalogues;

export const LOCALES = Object.keys(catalogues) as Locale[];

export const DEFAULT_LOCALE: Locale = 'pl';
