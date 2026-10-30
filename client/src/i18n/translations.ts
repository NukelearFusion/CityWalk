import type { Interest, RouteCategory } from '@/types/domain';
import type { StopCategory } from '@/types/itinerary';

/**
 * Translation catalogue.
 *
 * English is the source language, as in the design mockups; `pl` must declare
 * exactly the same keys, which TypeScript enforces through the `Translations`
 * type below. A missing or misspelled key is a compile error, not a blank
 * label at runtime.
 */

interface InterestCopy {
  /** Card title in the wizard ("Sightseeing & Culture"). */
  title: string;
  /** Chip and summary label ("Sightseeing"). */
  short: string;
  /** Card subtitle ("Landmarks, architecture, museums"). */
  hint: string;
}

const en = {
  common: {
    appName: 'Trasa',
    retry: 'Try again',
    loading: 'Loading…',
    errorTitle: 'Something went wrong',
    errorBody: 'We could not load the data. Check your connection and try again.',
    notFoundTitle: 'Not found',
    notFoundBody: 'This page does not exist or has been removed.',
    back: 'Back',
    seeAll: 'See all',
    chooseCity: 'Choose a city',
    close: 'Close',
  },
  tabs: {
    home: 'Home',
    explore: 'Explore',
    myRoute: 'My Route',
    saved: 'Saved',
  },
  footer: {
    tagline: 'Walking routes built around your time and budget.',
    mapCredit: 'Map data © OpenStreetMap contributors',
  },
  home: {
    title: 'Plan your perfect city walk.',
    subtitle:
      "Tell us what you want to see, eat or do, and we'll build a route that fits your time and budget.",
    createTitle: 'Create your route',
    stepCity: 'City',
    stepInterests: 'What are you into?',
    stepInterestsEmpty: 'Pick your interests',
    stepBudget: 'Budget',
    stepBudgetEmpty: 'Set your budget',
    stepTime: 'Time',
    stepTimeEmpty: 'Optional',
    result: 'Your personalized walking route',
    generate: 'Generate Route',
    startWithInterest: 'Start with an interest',
    popular: 'Popular routes',
    popularCaption: 'Ready-made examples',
    example: 'Example',
    emptyBody: 'No route has been published so far.',
  },
  interests: {
    SIGHTSEEING: {
      title: 'Sightseeing & Culture',
      short: 'Sightseeing',
      hint: 'Landmarks, architecture, museums',
    },
    FOOD: { title: 'Food & Drinks', short: 'Food & Cafés', hint: 'Local cuisine, cafés, bakeries' },
    ENTERTAINMENT: {
      title: 'Entertainment & Activities',
      short: 'Entertainment',
      hint: 'Interactive fun, leisure, nightlife',
    },
    NATURE: {
      title: 'Nature & Relaxation',
      short: 'Nature',
      hint: 'Parks, scenic spots, easy walks',
    },
    MIXED: { title: 'Mixed Experience', short: 'Mixed', hint: 'A balanced blend of your picks' },
  } satisfies Record<Interest, InterestCopy>,
  explore: {
    title: 'Explore',
    subtitle: 'Browse cities and ready-made routes, or search for one.',
    citiesTitle: 'Cities',
    routesTitle: 'Routes',
  },
  cities: {
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
    placeholder: 'Route name or city',
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
    eyebrow: 'Route · %{city}',
    statDuration: 'duration',
    statWalking: 'walking',
    statStops: 'stops',
    statCost: 'est. cost',
    descriptionTitle: 'About this route',
    mapTitle: 'Route map',
    stopsTitle: 'Stops',
    startRoute: 'Start Route',
    startingPoint: 'Starting point',
    emptyStops: 'This route has no stops defined yet.',
    free: 'Free',
    stopCounter: 'Stop %{position} of %{total}',
    itinerary: 'Itinerary',
    recenter: 'Show the whole route',
    walk: '%{minutes} min walk',
    next: 'Next:',
    lastStop: 'This is the last stop',
    openInMaps: 'Open in Maps',
    nextStop: 'Next stop',
    finish: 'Finish',
    backToRoute: 'Back to route',
    whyTitle: "Why it's in your route",
    details: 'Stop details',
  },
  stopCategories: {
    SIGHTSEEING: 'Sightseeing',
    FOOD: 'Food',
    ENTERTAINMENT: 'Entertainment',
    NATURE: 'Nature',
  } satisfies Record<StopCategory, string>,
  plan: {
    stepOf: 'Step %{step} of 4 · %{city}',
    cityTitle: 'Where are you walking?',
    citySubtitle: 'Routes are built from places in this city.',
    interestsTitle: 'What do you feel like today?',
    interestsSubtitle: 'Pick as many as you like.',
    selected: '%{count} selected: %{list}',
    noneSelected: 'Nothing picked — we will mix a bit of everything.',
    continue: 'Continue',
    budgetTitle: "What's your budget?",
    budgetSubtitle: 'Covers tickets, activities, food and drinks. Walking is free.',
    tiers: {
      FREEISH: { title: 'Free-ish', range: '0 – 30 zł' },
      BUDGET: { title: 'Budget', range: '30 – 100 zł' },
      MODERATE: { title: 'Moderate', range: '100 – 250 zł' },
      PREMIUM: { title: 'Premium', range: '250+ zł' },
    },
    customAmount: 'Custom amount (optional)',
    perPerson: 'Per person',
    wholeGroup: 'Whole group',
    people: 'People',
    fewerPeople: 'Fewer people',
    morePeople: 'More people',
    summaryPerson: 'Plan summary: about %{amount} per person for a route of %{interests}.',
    summaryGroup:
      'Plan summary: about %{amount} for %{people} people (%{each} each) for a route of %{interests}.',
    everything: 'a bit of everything',
    timeTitle: 'How much time do you have?',
    timeSubtitle: 'Optional — the walk, visits included, will fit into it.',
    noLimit: 'No limit',
    noLimitHint: 'Take your time',
    hours: '%{value} h',
    hoursHint: 'Walk and visits',
    generate: 'Generate Route',
    generating: 'Building your route…',
    notEnough:
      "There aren't enough places for this choice. Try a higher budget, more interests or more time.",
    unavailable: 'The route could not be built right now. Check your connection and try again.',
    eyebrow: 'Your route · %{city}',
    change: 'Change preferences',
    titleOf: '%{parts} of %{city}',
    titleParts: {
      SIGHTSEEING: 'Sights',
      FOOD: 'Flavours',
      ENTERTAINMENT: 'Good Times',
      NATURE: 'Green Corners',
    },
    titleMixed: 'The Best',
    reason: 'You picked %{interests}. This stop covers %{kind}, inside your %{budget} budget.',
  },
  myRoute: {
    emptyTitle: 'No route yet',
    emptyBody: 'Build a walk from your interests and budget — it will appear here.',
    cta: 'Create your route',
  },
  saved: {
    emptyTitle: 'Nothing saved yet',
    emptyBody: 'Routes you save will be kept here.',
  },
  units: {
    minutesShort: '%{value} min',
    hoursShort: '%{value} h',
    hoursMinutesShort: '%{hours} h %{minutes} min',
    kilometersShort: '%{value} km',
    metersShort: '%{value} m',
    currency: '%{value} zł',
    approxCurrency: '~%{value} zł',
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
  } satisfies Record<RouteCategory, string>,
};

/**
 * Shape every locale must satisfy.
 *
 * Derived from the English catalogue without `as const`, so the fields are
 * typed as `string` rather than as their literal values — otherwise no other
 * language could ever satisfy it.
 */
export type Translations = typeof en;

const pl: Translations = {
  common: {
    appName: 'Trasa',
    retry: 'Spróbuj ponownie',
    loading: 'Ładowanie…',
    errorTitle: 'Coś poszło nie tak',
    errorBody: 'Nie udało się pobrać danych. Sprawdź połączenie i spróbuj ponownie.',
    notFoundTitle: 'Nie znaleziono',
    notFoundBody: 'Ta strona nie istnieje lub została usunięta.',
    back: 'Wstecz',
    seeAll: 'Zobacz wszystkie',
    chooseCity: 'Wybierz miasto',
    close: 'Zamknij',
  },
  tabs: {
    home: 'Start',
    explore: 'Odkrywaj',
    myRoute: 'Moja trasa',
    saved: 'Zapisane',
  },
  footer: {
    tagline: 'Trasy spacerowe dopasowane do Twojego czasu i budżetu.',
    mapCredit: 'Dane mapy © współtwórcy OpenStreetMap',
  },
  home: {
    title: 'Zaplanuj idealny spacer po mieście.',
    subtitle:
      'Powiedz, co chcesz zobaczyć, zjeść lub zrobić, a ułożymy trasę dopasowaną do Twojego czasu i budżetu.',
    createTitle: 'Utwórz trasę',
    stepCity: 'Miasto',
    stepInterests: 'Co Cię interesuje?',
    stepInterestsEmpty: 'Wybierz zainteresowania',
    stepBudget: 'Budżet',
    stepBudgetEmpty: 'Ustal budżet',
    stepTime: 'Czas',
    stepTimeEmpty: 'Opcjonalnie',
    result: 'Twoja spersonalizowana trasa',
    generate: 'Utwórz trasę',
    startWithInterest: 'Zacznij od zainteresowania',
    popular: 'Popularne trasy',
    popularCaption: 'Gotowe przykłady',
    example: 'Przykład',
    emptyBody: 'Nie opublikowano jeszcze żadnej trasy.',
  },
  interests: {
    SIGHTSEEING: {
      title: 'Zwiedzanie i kultura',
      short: 'Zwiedzanie',
      hint: 'Zabytki, architektura, muzea',
    },
    FOOD: {
      title: 'Jedzenie i napoje',
      short: 'Kawiarnie',
      hint: 'Kuchnia lokalna, kawiarnie, piekarnie',
    },
    ENTERTAINMENT: {
      title: 'Rozrywka i aktywności',
      short: 'Rozrywka',
      hint: 'Atrakcje, wypoczynek, życie nocne',
    },
    NATURE: { title: 'Natura i relaks', short: 'Natura', hint: 'Parki, widoki, spokojne spacery' },
    MIXED: { title: 'Wszystkiego po trochu', short: 'Mieszane', hint: 'Zrównoważone połączenie' },
  },
  explore: {
    title: 'Odkrywaj',
    subtitle: 'Przeglądaj miasta i gotowe trasy albo wyszukaj trasę.',
    citiesTitle: 'Miasta',
    routesTitle: 'Trasy',
  },
  cities: {
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
    placeholder: 'Nazwa trasy lub miasto',
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
    eyebrow: 'Trasa · %{city}',
    statDuration: 'czas',
    statWalking: 'pieszo',
    statStops: 'punkty',
    statCost: 'koszt',
    descriptionTitle: 'O trasie',
    mapTitle: 'Mapa trasy',
    stopsTitle: 'Punkty',
    startRoute: 'Rozpocznij trasę',
    startingPoint: 'Punkt startowy',
    emptyStops: 'Ta trasa nie ma jeszcze zdefiniowanych punktów.',
    free: 'Bezpłatnie',
    stopCounter: 'Punkt %{position} z %{total}',
    itinerary: 'Plan trasy',
    recenter: 'Pokaż całą trasę',
    walk: '%{minutes} min pieszo',
    next: 'Dalej:',
    lastStop: 'To ostatni punkt',
    openInMaps: 'Otwórz w Mapach',
    nextStop: 'Następny punkt',
    finish: 'Zakończ',
    backToRoute: 'Wróć do trasy',
    whyTitle: 'Dlaczego jest na trasie',
    details: 'Szczegóły punktu',
  },
  stopCategories: {
    SIGHTSEEING: 'Zwiedzanie',
    FOOD: 'Jedzenie',
    ENTERTAINMENT: 'Rozrywka',
    NATURE: 'Natura',
  },
  plan: {
    stepOf: 'Krok %{step} z 4 · %{city}',
    cityTitle: 'Gdzie chcesz spacerować?',
    citySubtitle: 'Trasa powstanie z miejsc w tym mieście.',
    interestsTitle: 'Na co masz dziś ochotę?',
    interestsSubtitle: 'Wybierz dowolnie wiele.',
    selected: 'Wybrano %{count}: %{list}',
    noneSelected: 'Nic nie wybrano — połączymy wszystkiego po trochu.',
    continue: 'Dalej',
    budgetTitle: 'Jaki masz budżet?',
    budgetSubtitle: 'Obejmuje bilety, atrakcje, jedzenie i napoje. Spacer jest za darmo.',
    tiers: {
      FREEISH: { title: 'Prawie za darmo', range: '0 – 30 zł' },
      BUDGET: { title: 'Oszczędnie', range: '30 – 100 zł' },
      MODERATE: { title: 'Umiarkowanie', range: '100 – 250 zł' },
      PREMIUM: { title: 'Premium', range: '250+ zł' },
    },
    customAmount: 'Własna kwota (opcjonalnie)',
    perPerson: 'Na osobę',
    wholeGroup: 'Cała grupa',
    people: 'Osoby',
    fewerPeople: 'Mniej osób',
    morePeople: 'Więcej osób',
    summaryPerson: 'Podsumowanie: około %{amount} na osobę za trasę: %{interests}.',
    summaryGroup:
      'Podsumowanie: około %{amount} dla %{people} osób (%{each} na osobę) za trasę: %{interests}.',
    everything: 'wszystkiego po trochu',
    timeTitle: 'Ile masz czasu?',
    timeSubtitle: 'Opcjonalnie — spacer razem ze zwiedzaniem się w nim zmieści.',
    noLimit: 'Bez limitu',
    noLimitHint: 'Bez pośpiechu',
    hours: '%{value} h',
    hoursHint: 'Spacer i zwiedzanie',
    generate: 'Utwórz trasę',
    generating: 'Układamy trasę…',
    notEnough: 'Za mało miejsc dla tego wyboru. Zwiększ budżet, dodaj zainteresowania albo czas.',
    unavailable: 'Nie udało się teraz ułożyć trasy. Sprawdź połączenie i spróbuj ponownie.',
    eyebrow: 'Twoja trasa · %{city}',
    change: 'Zmień preferencje',
    titleOf: '%{parts}: %{city}',
    titleParts: {
      SIGHTSEEING: 'Zabytki',
      FOOD: 'Smaki',
      ENTERTAINMENT: 'Rozrywka',
      NATURE: 'Zieleń',
    },
    titleMixed: 'Najlepsze miejsca',
    reason: 'Wybrano: %{interests}. Ten punkt to %{kind} i mieści się w budżecie %{budget}.',
  },
  myRoute: {
    emptyTitle: 'Brak trasy',
    emptyBody: 'Ułóż spacer według zainteresowań i budżetu — pojawi się tutaj.',
    cta: 'Utwórz trasę',
  },
  saved: {
    emptyTitle: 'Nic jeszcze nie zapisano',
    emptyBody: 'Tutaj znajdziesz zapisane trasy.',
  },
  units: {
    minutesShort: '%{value} min',
    hoursShort: '%{value} h',
    hoursMinutesShort: '%{hours} h %{minutes} min',
    kilometersShort: '%{value} km',
    metersShort: '%{value} m',
    currency: '%{value} zł',
    approxCurrency: '~%{value} zł',
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
  },
};

export const catalogues = { en, pl } as const;

export type Locale = keyof typeof catalogues;

export const LOCALES = Object.keys(catalogues) as Locale[];

/** The interface is designed in English; Polish is available but not forced by the device. */
export const DEFAULT_LOCALE: Locale = 'en';
