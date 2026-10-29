import { estimateWalkingMinutes, pathLength } from '@/lib/geo';
import type { City, RouteDetail, RouteStop } from '@/types/domain';

/**
 * Development fixtures.
 *
 * Coordinates are real, so the map renders a plausible walk through each city.
 * Distance and duration are computed from the geometry by the same functions
 * the backend uses, which keeps the mock and the production data consistent.
 */

interface StopSeed {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
}

interface RouteSeed {
  slug: string;
  name: string;
  summary: string;
  description: string;
  category: RouteDetail['category'];
  citySlug: string;
  publishedAt: string;
  stops: StopSeed[];
}

const CITY_SEEDS: Omit<City, 'routeCount'>[] = [
  {
    id: 'city_krakow',
    slug: 'krakow',
    name: 'Kraków',
    country: 'Polska',
    description:
      'Dawna stolica Polski, miasto królów i studentów. Zabytkowe centrum wpisane na listę UNESCO można obejść pieszo w jeden dzień.',
    coverImageUrl: null,
    centerLatitude: 50.0614,
    centerLongitude: 19.9366,
    defaultZoom: 14,
  },
  {
    id: 'city_wroclaw',
    slug: 'wroclaw',
    name: 'Wrocław',
    country: 'Polska',
    description:
      'Miasto stu mostów i krasnali, rozłożone na dwunastu wyspach Odry. Kolorowe kamienice Rynku sąsiadują z ceglaną Ostrowem Tumskim.',
    coverImageUrl: null,
    centerLatitude: 51.1099,
    centerLongitude: 17.0322,
    defaultZoom: 14,
  },
  {
    id: 'city_gdansk',
    slug: 'gdansk',
    name: 'Gdańsk',
    country: 'Polska',
    description:
      'Hanzeatycki port nad Motławą, z odbudowaną Drogą Królewską i historią Solidarności zapisaną w stoczni.',
    coverImageUrl: null,
    centerLatitude: 54.3489,
    centerLongitude: 18.6533,
    defaultZoom: 14,
  },
];

const ROUTE_SEEDS: RouteSeed[] = [
  {
    slug: 'krakow-droga-krolewska',
    name: 'Droga Królewska',
    summary: 'Od Barbakanu przez Rynek aż na Wawel — trasa koronacyjna polskich królów.',
    description:
      'Klasyczna trasa przez Stare Miasto, którą od XIV wieku podążały orszaki koronacyjne. Prowadzi przez najważniejsze zabytki Krakowa i kończy się na Wzgórzu Wawelskim. Trasa jest płaska, na końcu czeka łagodne podejście pod zamek.',
    category: 'HISTORICAL',
    citySlug: 'krakow',
    publishedAt: '2026-03-14T10:00:00.000Z',
    stops: [
      {
        name: 'Barbakan',
        description:
          'Gotycka budowla obronna z 1499 roku, jedna z trzech zachowanych w Europie. Mury mają ponad trzy metry grubości.',
        latitude: 50.0654,
        longitude: 19.9415,
      },
      {
        name: 'Brama Floriańska',
        description:
          'Jedyna zachowana brama miejska średniowiecznego Krakowa i początek Drogi Królewskiej.',
        latitude: 50.0648,
        longitude: 19.9411,
      },
      {
        name: 'Rynek Główny',
        description:
          'Największy średniowieczny rynek Europy o powierzchni czterech hektarów. Układ ulic nie zmienił się od 1257 roku.',
        latitude: 50.0617,
        longitude: 19.9373,
      },
      {
        name: 'Kościół Mariacki',
        description:
          'Bazylika z ołtarzem Wita Stwosza. Z wyższej wieży co godzinę rozbrzmiewa hejnał, urwany w połowie taktu.',
        latitude: 50.0617,
        longitude: 19.9394,
      },
      {
        name: 'Sukiennice',
        description:
          'Renesansowa hala targowa w środku Rynku, do dziś pełniąca funkcję handlową. Na piętrze galeria sztuki polskiej.',
        latitude: 50.0616,
        longitude: 19.9373,
      },
      {
        name: 'Collegium Maius',
        description:
          'Najstarszy budynek Uniwersytetu Jagiellońskiego. Studiował tu Mikołaj Kopernik, w muzeum stoją jego instrumenty.',
        latitude: 50.0614,
        longitude: 19.9327,
      },
      {
        name: 'Wawel',
        description:
          'Zamek królewski i katedra na wapiennym wzgórzu nad Wisłą. Miejsce koronacji i pochówku polskich władców.',
        latitude: 50.054,
        longitude: 19.9354,
      },
    ],
  },
  {
    slug: 'krakow-kazimierz',
    name: 'Kazimierz i Podgórze',
    summary: 'Dawna dzielnica żydowska, dziś centrum nocnego życia miasta.',
    description:
      'Spacer po Kazimierzu, przez most nad Wisłą aż do Podgórza. Trasa łączy synagogi, klimatyczne podwórka i miejsca pamięci po getcie krakowskim.',
    category: 'CULTURE',
    citySlug: 'krakow',
    publishedAt: '2026-04-02T10:00:00.000Z',
    stops: [
      {
        name: 'Plac Nowy',
        description:
          'Serce Kazimierza z okrągłą halą targową. Wieczorami plac wypełniają stoliki okolicznych barów.',
        latitude: 50.0513,
        longitude: 19.9448,
      },
      {
        name: 'Synagoga Stara',
        description:
          'Najstarsza zachowana synagoga w Polsce, wzniesiona na przełomie XV i XVI wieku. Obecnie muzeum.',
        latitude: 50.0515,
        longitude: 19.9457,
      },
      {
        name: 'Ulica Szeroka',
        description:
          'Właściwie plac, a nie ulica — historyczne centrum żydowskiego Kazimierza otoczone czterema synagogami.',
        latitude: 50.0519,
        longitude: 19.9462,
      },
      {
        name: 'Most Bernatka',
        description:
          'Kładka pieszo-rowerowa nad Wisłą, obwieszona kłódkami i akrobatycznymi rzeźbami.',
        latitude: 50.0484,
        longitude: 19.9497,
      },
      {
        name: 'Plac Bohaterów Getta',
        description:
          'Miejsce pamięci z siedemdziesięcioma żeliwnymi krzesłami, symbolizującymi wywózki z getta.',
        latitude: 50.0463,
        longitude: 19.9525,
      },
    ],
  },
  {
    slug: 'wroclaw-rynek-ostrow',
    name: 'Rynek i Ostrów Tumski',
    summary: 'Od kolorowych kamienic Rynku do najstarszej części miasta.',
    description:
      'Trasa prowadzi przez wrocławską starówkę i kończy się na Ostrowie Tumskim, gdzie o zmierzchu latarnik zapala gazowe latarnie. Po drodze warto liczyć krasnale — jest ich w mieście ponad sześćset.',
    category: 'ARCHITECTURE',
    citySlug: 'wroclaw',
    publishedAt: '2026-02-20T10:00:00.000Z',
    stops: [
      {
        name: 'Rynek',
        description:
          'Jeden z największych rynków Europy z gotyckim ratuszem, otoczony pierzejami kolorowych kamienic.',
        latitude: 51.1099,
        longitude: 17.0322,
      },
      {
        name: 'Aula Leopoldina',
        description:
          'Barokowa sala Uniwersytetu Wrocławskiego z 1732 roku — freski, złocenia i rzeźby na całym sklepieniu.',
        latitude: 51.114,
        longitude: 17.0333,
      },
      {
        name: 'Hala Targowa',
        description:
          'Czynna od 1908 roku hala z żelbetowymi łukami. Na parterze warzywa, na antresoli kwiaty i rękodzieło.',
        latitude: 51.1132,
        longitude: 17.0424,
      },
      {
        name: 'Most Tumski',
        description:
          'Zielony most zakochanych łączący Wyspę Piasek z Ostrowem Tumskim.',
        latitude: 51.114,
        longitude: 17.0446,
      },
      {
        name: 'Katedra św. Jana Chrzciciela',
        description:
          'Gotycka katedra z tarasem widokowym na wieży. Najstarsza część Wrocławia, początki sięgają X wieku.',
        latitude: 51.1145,
        longitude: 17.0455,
      },
    ],
  },
  {
    slug: 'wroclaw-zielony-wroclaw',
    name: 'Zielony Wrocław',
    summary: 'Park Szczytnicki, Hala Stulecia i ogród japoński.',
    description:
      'Spokojniejsza trasa poza centrum, prowadząca przez największy park miasta do Hali Stulecia wpisanej na listę UNESCO.',
    category: 'NATURE',
    citySlug: 'wroclaw',
    publishedAt: '2026-05-08T10:00:00.000Z',
    stops: [
      {
        name: 'Ogród Japoński',
        description:
          'Założony w 1913 roku ogród z mostkami, wodospadem i karpiami koi. Wstęp sezonowy.',
        latitude: 51.1074,
        longitude: 17.0762,
      },
      {
        name: 'Park Szczytnicki',
        description:
          'Ponad sto hektarów starodrzewu, jeden z najstarszych parków miejskich w Polsce.',
        latitude: 51.1096,
        longitude: 17.0781,
      },
      {
        name: 'Hala Stulecia',
        description:
          'Żelbetowa kopuła z 1913 roku o rozpiętości 65 metrów, przełomowa konstrukcja w skali świata.',
        latitude: 51.1069,
        longitude: 17.0772,
      },
      {
        name: 'Pergola i fontanna',
        description:
          'Półkolista pergola z multimedialną fontanną, wieczorem pokazy światła i muzyki.',
        latitude: 51.1063,
        longitude: 17.0785,
      },
    ],
  },
  {
    slug: 'gdansk-droga-krolewska',
    name: 'Główne Miasto nad Motławą',
    summary: 'Długi Targ, Żuraw i nabrzeże dawnego portu hanzeatyckiego.',
    description:
      'Trasa przez odbudowane po wojnie Główne Miasto. Kończy się spacerem wzdłuż Motławy, skąd odpływają tramwaje wodne na Westerplatte.',
    category: 'HISTORICAL',
    citySlug: 'gdansk',
    publishedAt: '2026-01-30T10:00:00.000Z',
    stops: [
      {
        name: 'Brama Wyżynna',
        description: 'Renesansowa brama z 1588 roku, historyczny początek Drogi Królewskiej.',
        latitude: 54.3487,
        longitude: 18.6467,
      },
      {
        name: 'Fontanna Neptuna',
        description:
          'Symbol miasta od 1633 roku. Legenda mówi, że to Neptun stworzył gdańską goldwasser.',
        latitude: 54.3489,
        longitude: 18.6529,
      },
      {
        name: 'Bazylika Mariacka',
        description:
          'Największy ceglany kościół świata, mieści około 25 tysięcy osób. Z wieży rozciąga się widok na deltę Wisły.',
        latitude: 54.3497,
        longitude: 18.6531,
      },
      {
        name: 'Długi Targ',
        description:
          'Reprezentacyjny plac z Dworem Artusa i pierzeją najbogatszych kamienic kupieckich.',
        latitude: 54.3489,
        longitude: 18.6533,
      },
      {
        name: 'Brama Zielona',
        description:
          'Dawna rezydencja królewska zamykająca Długi Targ od strony Motławy.',
        latitude: 54.3487,
        longitude: 18.656,
      },
      {
        name: 'Żuraw',
        description:
          'Największy średniowieczny dźwig portowy Europy, napędzany kołami deptakowymi. Podnosił ładunki o masie czterech ton.',
        latitude: 54.3502,
        longitude: 18.6573,
      },
    ],
  },
];

/** Builds the full stop list with positions and identifiers. */
function buildStops(routeSlug: string, seeds: StopSeed[]): RouteStop[] {
  return seeds.map((seed, index) => ({
    id: `${routeSlug}__stop_${index + 1}`,
    position: index + 1,
    name: seed.name,
    description: seed.description,
    latitude: seed.latitude,
    longitude: seed.longitude,
    imageUrl: null,
  }));
}

const citiesBySlug = new Map(CITY_SEEDS.map((city) => [city.slug, city]));

export const MOCK_ROUTES: RouteDetail[] = ROUTE_SEEDS.map((seed) => {
  const city = citiesBySlug.get(seed.citySlug);
  if (!city) {
    throw new Error(`Mock route "${seed.slug}" references unknown city "${seed.citySlug}"`);
  }

  const stops = buildStops(seed.slug, seed.stops);
  const distanceMeters = pathLength(stops);

  return {
    id: `route_${seed.slug}`,
    slug: seed.slug,
    name: seed.name,
    summary: seed.summary,
    description: seed.description,
    category: seed.category,
    status: 'PUBLISHED',
    coverImageUrl: null,
    city: { id: city.id, slug: city.slug, name: city.name },
    stats: {
      distanceMeters,
      durationMinutes: estimateWalkingMinutes(distanceMeters, stops.length),
      stopCount: stops.length,
    },
    stops,
    images: [],
    startingPoint: stops[0] ?? null,
    publishedAt: seed.publishedAt,
  };
});

export const MOCK_CITIES: City[] = CITY_SEEDS.map((city) => ({
  ...city,
  routeCount: MOCK_ROUTES.filter((route) => route.city.slug === city.slug).length,
}));
