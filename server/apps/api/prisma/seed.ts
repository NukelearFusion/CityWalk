import { PrismaClient, type Prisma } from '@prisma/client';
import { estimateWalkingMinutes, pathLength } from '@citywalk/shared';

/**
 * Database seed.
 *
 * Creates demonstration content outside production. Safe to run repeatedly:
 * existing cities and routes are left untouched.
 *
 * Accounts are deliberately not created here. The first administrator is set up
 * with `npm run admin:create`, which asks for the password interactively, so no
 * credential ever lives in the repository or in a seed file.
 */
const prisma = new PrismaClient();

const isProduction = process.env['NODE_ENV'] === 'production';

async function reportAdministratorState(): Promise<void> {
  const superAdmins = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });

  if (superAdmins === 0) {
    console.warn('No super administrator yet. Create one with: npm run admin:create');
  }
}

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
  category: Prisma.RouteCreateInput['category'];
  stops: StopSeed[];
}

const CITIES: {
  slug: string;
  name: string;
  country: string;
  description: string;
  centerLatitude: number;
  centerLongitude: number;
  routes: RouteSeed[];
}[] = [
  {
    slug: 'krakow',
    name: 'Kraków',
    country: 'Polska',
    description:
      'Dawna stolica Polski, miasto królów i studentów. Zabytkowe centrum wpisane na listę UNESCO można obejść pieszo w jeden dzień.',
    centerLatitude: 50.0614,
    centerLongitude: 19.9366,
    routes: [
      {
        slug: 'krakow-droga-krolewska',
        name: 'Droga Królewska',
        summary: 'Od Barbakanu przez Rynek aż na Wawel — trasa koronacyjna polskich królów.',
        description:
          'Klasyczna trasa przez Stare Miasto, którą od XIV wieku podążały orszaki koronacyjne. Prowadzi przez najważniejsze zabytki Krakowa i kończy się na Wzgórzu Wawelskim.',
        category: 'HISTORICAL',
        stops: [
          {
            name: 'Barbakan',
            description:
              'Gotycka budowla obronna z 1499 roku, jedna z trzech zachowanych w Europie.',
            latitude: 50.0654,
            longitude: 19.9415,
          },
          {
            name: 'Brama Floriańska',
            description: 'Jedyna zachowana brama miejska średniowiecznego Krakowa.',
            latitude: 50.0648,
            longitude: 19.9411,
          },
          {
            name: 'Rynek Główny',
            description: 'Największy średniowieczny rynek Europy o powierzchni czterech hektarów.',
            latitude: 50.0617,
            longitude: 19.9373,
          },
          {
            name: 'Kościół Mariacki',
            description: 'Bazylika z ołtarzem Wita Stwosza. Co godzinę rozbrzmiewa stąd hejnał.',
            latitude: 50.0617,
            longitude: 19.9394,
          },
          {
            name: 'Collegium Maius',
            description:
              'Najstarszy budynek Uniwersytetu Jagiellońskiego. Studiował tu Mikołaj Kopernik.',
            latitude: 50.0614,
            longitude: 19.9327,
          },
          {
            name: 'Wawel',
            description: 'Zamek królewski i katedra na wapiennym wzgórzu nad Wisłą.',
            latitude: 50.054,
            longitude: 19.9354,
          },
        ],
      },
    ],
  },
  {
    slug: 'wroclaw',
    name: 'Wrocław',
    country: 'Polska',
    description: 'Miasto stu mostów i krasnali, rozłożone na dwunastu wyspach Odry.',
    centerLatitude: 51.1099,
    centerLongitude: 17.0322,
    routes: [
      {
        slug: 'wroclaw-rynek-ostrow',
        name: 'Rynek i Ostrów Tumski',
        summary: 'Od kolorowych kamienic Rynku do najstarszej części miasta.',
        description:
          'Trasa przez wrocławską starówkę, zakończona na Ostrowie Tumskim, gdzie o zmierzchu latarnik zapala gazowe latarnie.',
        category: 'ARCHITECTURE',
        stops: [
          {
            name: 'Rynek',
            description: 'Jeden z największych rynków Europy z gotyckim ratuszem.',
            latitude: 51.1099,
            longitude: 17.0322,
          },
          {
            name: 'Aula Leopoldina',
            description: 'Barokowa sala Uniwersytetu Wrocławskiego z 1732 roku.',
            latitude: 51.114,
            longitude: 17.0333,
          },
          {
            name: 'Hala Targowa',
            description: 'Czynna od 1908 roku hala z żelbetowymi łukami.',
            latitude: 51.1132,
            longitude: 17.0424,
          },
          {
            name: 'Most Tumski',
            description: 'Zielony most zakochanych łączący Wyspę Piasek z Ostrowem Tumskim.',
            latitude: 51.114,
            longitude: 17.0446,
          },
          {
            name: 'Katedra św. Jana Chrzciciela',
            description: 'Gotycka katedra z tarasem widokowym na wieży.',
            latitude: 51.1145,
            longitude: 17.0455,
          },
        ],
      },
    ],
  },
  {
    slug: 'gdansk',
    name: 'Gdańsk',
    country: 'Polska',
    description: 'Hanzeatycki port nad Motławą z odbudowaną Drogą Królewską.',
    centerLatitude: 54.3489,
    centerLongitude: 18.6533,
    routes: [
      {
        slug: 'gdansk-glowne-miasto',
        name: 'Główne Miasto nad Motławą',
        summary: 'Długi Targ, Żuraw i nabrzeże dawnego portu hanzeatyckiego.',
        description:
          'Trasa przez odbudowane po wojnie Główne Miasto, zakończona spacerem wzdłuż Motławy.',
        category: 'HISTORICAL',
        stops: [
          {
            name: 'Brama Wyżynna',
            description: 'Renesansowa brama z 1588 roku, początek Drogi Królewskiej.',
            latitude: 54.3487,
            longitude: 18.6467,
          },
          {
            name: 'Fontanna Neptuna',
            description: 'Symbol miasta od 1633 roku.',
            latitude: 54.3489,
            longitude: 18.6529,
          },
          {
            name: 'Bazylika Mariacka',
            description: 'Największy ceglany kościół świata, mieści około 25 tysięcy osób.',
            latitude: 54.3497,
            longitude: 18.6531,
          },
          {
            name: 'Długi Targ',
            description: 'Reprezentacyjny plac z Dworem Artusa.',
            latitude: 54.3489,
            longitude: 18.6533,
          },
          {
            name: 'Żuraw',
            description: 'Największy średniowieczny dźwig portowy Europy.',
            latitude: 54.3502,
            longitude: 18.6573,
          },
        ],
      },
    ],
  },
  {
    slug: 'poznan',
    name: 'Poznań',
    country: 'Polska',
    description:
      'Stolica Wielkopolski i jedno z najstarszych polskich miast. Ostrów Tumski, renesansowy ratusz z koziołkami i Dzielnica Cesarska leżą w zasięgu krótkiego spaceru.',
    centerLatitude: 52.4064,
    centerLongitude: 16.9252,
    routes: [
      {
        slug: 'poznan-stary-rynek-ostrow-tumski',
        name: 'Od Starego Rynku na Ostrów Tumski',
        summary: 'Ratusz z koziołkami, Fara, Zamek Królewski i kolebka państwa polskiego.',
        description:
          'Spacer przez średniowieczne serce Poznania: od Starego Rynku przez Wzgórze Przemysła aż na Ostrów Tumski, gdzie stoi najstarsza katedra w Polsce.',
        category: 'HISTORICAL',
        stops: [
          {
            name: 'Ratusz',
            description:
              'Renesansowy ratusz na Starym Rynku. Codziennie o 12:00 na wieży trykają się koziołki.',
            latitude: 52.4083,
            longitude: 16.9343,
          },
          {
            name: 'Fara Poznańska',
            description: 'Barokowa świątynia z bogato zdobionym wnętrzem i zabytkowymi organami.',
            latitude: 52.4069,
            longitude: 16.9321,
          },
          {
            name: 'Zamek Królewski',
            description: 'Odbudowany zamek na Wzgórzu Przemysła, dziś Muzeum Sztuk Użytkowych.',
            latitude: 52.4096,
            longitude: 16.93,
          },
          {
            name: 'Most Biskupa Jordana',
            description: 'Kładka nad Cybiną łącząca Śródkę z Ostrowem Tumskim.',
            latitude: 52.4116,
            longitude: 16.9454,
          },
          {
            name: 'Katedra Poznańska',
            description:
              'Najstarsza katedra w Polsce. W Złotej Kaplicy upamiętniono pierwszych Piastów.',
            latitude: 52.4115,
            longitude: 16.9478,
          },
          {
            name: 'Brama Poznania',
            description: 'Centrum interpretacji dziejów Ostrowa Tumskiego i początków państwa.',
            latitude: 52.412,
            longitude: 16.953,
          },
        ],
      },
      {
        slug: 'poznan-jezioro-maltanskie',
        name: 'Wokół Jeziora Maltańskiego',
        summary: 'Zielony szlak wzdłuż toru regatowego aż do Nowego Zoo.',
        description:
          'Spokojna trasa nad sztucznym jeziorem, na którym rozgrywane są regaty. Prowadzi obok term i całorocznego stoku narciarskiego do jednego z największych ogrodów zoologicznych w Polsce.',
        category: 'NATURE',
        stops: [
          {
            name: 'Rondo Śródka',
            description: 'Punkt startowy przy kolorowym muralu na Śródce.',
            latitude: 52.4105,
            longitude: 16.9555,
          },
          {
            name: 'Zachodni brzeg Malty',
            description: 'Początek promenady wokół jeziora i toru regatowego.',
            latitude: 52.4045,
            longitude: 16.9655,
          },
          {
            name: 'Termy Maltańskie',
            description: 'Kompleks basenów sportowych i rekreacyjnych nad jeziorem.',
            latitude: 52.399,
            longitude: 16.9855,
          },
          {
            name: 'Malta Ski',
            description: 'Całoroczny stok narciarski z torem saneczkowym.',
            latitude: 52.4,
            longitude: 16.996,
          },
          {
            name: 'Nowe Zoo',
            description: 'Rozległy ogród zoologiczny w lesie, z wybiegami w naturalnym otoczeniu.',
            latitude: 52.3985,
            longitude: 17.009,
          },
        ],
      },
      {
        slug: 'poznan-dzielnica-cesarska',
        name: 'Dzielnica Cesarska',
        summary: 'Monumentalna zabudowa z początku XX wieku wokół Zamku Cesarskiego.',
        description:
          'Reprezentacyjna dzielnica wzniesiona za czasów pruskich. Trasa łączy Zamek Cesarski, gmachy uniwersytetu i operę z klasycystyczną Biblioteką Raczyńskich.',
        category: 'ARCHITECTURE',
        stops: [
          {
            name: 'Zamek Cesarski',
            description:
              'Ostatnia rezydencja cesarska zbudowana w Europie (1910), dziś Centrum Kultury Zamek.',
            latitude: 52.4078,
            longitude: 16.9195,
          },
          {
            name: 'Pomnik Poznańskiego Czerwca 1956',
            description: 'Dwa krzyże upamiętniające ofiary pierwszego wielkiego protestu w PRL.',
            latitude: 52.4072,
            longitude: 16.918,
          },
          {
            name: 'Collegium Minus',
            description: 'Neorenesansowy gmach, siedziba władz Uniwersytetu im. Adama Mickiewicza.',
            latitude: 52.4086,
            longitude: 16.9175,
          },
          {
            name: 'Teatr Wielki',
            description: 'Gmach opery im. Stanisława Moniuszki z 1910 roku.',
            latitude: 52.408,
            longitude: 16.923,
          },
          {
            name: 'Biblioteka Raczyńskich',
            description:
              'Klasycystyczny gmach przy placu Wolności, jedna z najstarszych bibliotek publicznych.',
            latitude: 52.4077,
            longitude: 16.93,
          },
        ],
      },
      {
        slug: 'poznan-szlak-kultury',
        name: 'Szlak teatrów i muzeów',
        summary: 'Od Starego Browaru do muzeów na Starym Rynku.',
        description:
          'Kulturalne oblicze Poznania: dawny browar zamieniony w centrum sztuki, teatr zbudowany ze składek mieszkańców i najważniejsze miejskie galerie.',
        category: 'CULTURE',
        stops: [
          {
            name: 'Stary Browar',
            description: 'Dawny browar przekształcony w centrum handlu, sztuki i biznesu.',
            latitude: 52.4019,
            longitude: 16.9264,
          },
          {
            name: 'Teatr Polski',
            description:
              'Teatr z 1875 roku zbudowany ze składek, z napisem „Naród sobie” na fasadzie.',
            latitude: 52.4064,
            longitude: 16.9257,
          },
          {
            name: 'Muzeum Narodowe',
            description: 'Galeria Malarstwa i Rzeźby z kolekcją sztuki polskiej i europejskiej.',
            latitude: 52.4079,
            longitude: 16.9318,
          },
          {
            name: 'Galeria Miejska Arsenał',
            description: 'Galeria sztuki współczesnej w samym środku Starego Rynku.',
            latitude: 52.4086,
            longitude: 16.9333,
          },
          {
            name: 'Muzeum Instrumentów Muzycznych',
            description:
              'Kolekcja instrumentów z różnych epok i kontynentów w kamienicach przy rynku.',
            latitude: 52.4089,
            longitude: 16.9345,
          },
        ],
      },
      {
        slug: 'poznan-smaki-poznania',
        name: 'Smaki Poznania',
        summary: 'Targi, rogale świętomarcińskie i pyry z gzikiem.',
        description:
          'Kulinarna trasa od secesyjnych Jeżyc do Starego Rynku. Po drodze lokalne targowiska i pokaz wypieku słynnego rogala świętomarcińskiego.',
        category: 'FOOD',
        stops: [
          {
            name: 'Rynek Jeżycki',
            description: 'Targowisko otoczone secesyjnymi kamienicami Jeżyc.',
            latitude: 52.4108,
            longitude: 16.9007,
          },
          {
            name: 'Plac Wielkopolski',
            description: 'Miejski targ z warzywami, owocami i lokalnymi produktami.',
            latitude: 52.4103,
            longitude: 16.929,
          },
          {
            name: 'Rogalowe Muzeum Poznania',
            description: 'Pokazy wypieku rogala świętomarcińskiego z degustacją.',
            latitude: 52.4087,
            longitude: 16.935,
          },
          {
            name: 'Stary Rynek',
            description: 'Lokale z kuchnią wielkopolską — warto spróbować pyr z gzikiem.',
            latitude: 52.4084,
            longitude: 16.9335,
          },
        ],
      },
    ],
  },
];

type StopCategory = 'SIGHTSEEING' | 'FOOD' | 'ENTERTAINMENT' | 'NATURE';

interface StopDetails {
  category: StopCategory;
  /** Approximate per-person cost in złoty (regular ticket or a typical spend). */
  costPln: number;
  visitMinutes: number;
  address?: string;
}

/**
 * Planner metadata per stop, keyed by stop name.
 *
 * Costs are estimates for demonstration — regular adult tickets or a typical
 * spend — and must be checked before the data is presented as current.
 */
const STOP_DETAILS: Record<string, StopDetails> = {
  // Kraków
  Barbakan: { category: 'SIGHTSEEING', costPln: 18, visitMinutes: 30, address: 'ul. Basztowa' },
  'Brama Floriańska': {
    category: 'SIGHTSEEING',
    costPln: 0,
    visitMinutes: 15,
    address: 'ul. Floriańska',
  },
  'Rynek Główny': {
    category: 'SIGHTSEEING',
    costPln: 0,
    visitMinutes: 40,
    address: 'Rynek Główny',
  },
  'Kościół Mariacki': {
    category: 'SIGHTSEEING',
    costPln: 20,
    visitMinutes: 40,
    address: 'pl. Mariacki 5',
  },
  'Collegium Maius': {
    category: 'SIGHTSEEING',
    costPln: 25,
    visitMinutes: 50,
    address: 'ul. Jagiellońska 15',
  },
  Wawel: { category: 'SIGHTSEEING', costPln: 45, visitMinutes: 90, address: 'Wawel 5' },
  // Wrocław
  Rynek: { category: 'SIGHTSEEING', costPln: 0, visitMinutes: 40, address: 'Rynek' },
  'Aula Leopoldina': {
    category: 'SIGHTSEEING',
    costPln: 25,
    visitMinutes: 40,
    address: 'pl. Uniwersytecki 1',
  },
  'Hala Targowa': { category: 'FOOD', costPln: 30, visitMinutes: 40, address: 'ul. Piaskowa 17' },
  'Most Tumski': { category: 'SIGHTSEEING', costPln: 0, visitMinutes: 10, address: 'Most Tumski' },
  'Katedra św. Jana Chrzciciela': {
    category: 'SIGHTSEEING',
    costPln: 15,
    visitMinutes: 40,
    address: 'pl. Katedralny 18',
  },
  // Gdańsk
  'Brama Wyżynna': {
    category: 'SIGHTSEEING',
    costPln: 0,
    visitMinutes: 10,
    address: 'Wały Jagiellońskie',
  },
  'Fontanna Neptuna': {
    category: 'SIGHTSEEING',
    costPln: 0,
    visitMinutes: 10,
    address: 'Długi Targ',
  },
  'Bazylika Mariacka': {
    category: 'SIGHTSEEING',
    costPln: 16,
    visitMinutes: 45,
    address: 'ul. Podkramarska 5',
  },
  'Długi Targ': { category: 'FOOD', costPln: 45, visitMinutes: 60, address: 'Długi Targ' },
  Żuraw: { category: 'SIGHTSEEING', costPln: 20, visitMinutes: 40, address: 'ul. Szeroka 67/68' },
  // Poznań
  Ratusz: {
    category: 'SIGHTSEEING',
    costPln: 25,
    visitMinutes: 45,
    address: 'Stary Rynek 1, Poznań',
  },
  'Fara Poznańska': {
    category: 'SIGHTSEEING',
    costPln: 0,
    visitMinutes: 30,
    address: 'ul. Gołębia 1, Poznań',
  },
  'Zamek Królewski': {
    category: 'SIGHTSEEING',
    costPln: 25,
    visitMinutes: 60,
    address: 'Góra Przemysła 1, Poznań',
  },
  'Most Biskupa Jordana': {
    category: 'NATURE',
    costPln: 0,
    visitMinutes: 15,
    address: 'Ostrów Tumski, Poznań',
  },
  'Katedra Poznańska': {
    category: 'SIGHTSEEING',
    costPln: 15,
    visitMinutes: 50,
    address: 'Ostrów Tumski 17, Poznań',
  },
  'Brama Poznania': {
    category: 'ENTERTAINMENT',
    costPln: 25,
    visitMinutes: 75,
    address: 'ul. Gdańska 2, Poznań',
  },
  'Rondo Śródka': {
    category: 'SIGHTSEEING',
    costPln: 0,
    visitMinutes: 15,
    address: 'Rondo Śródka, Poznań',
  },
  'Zachodni brzeg Malty': {
    category: 'NATURE',
    costPln: 0,
    visitMinutes: 40,
    address: 'ul. Baraniaka, Poznań',
  },
  'Termy Maltańskie': {
    category: 'ENTERTAINMENT',
    costPln: 60,
    visitMinutes: 120,
    address: 'ul. Termalna 1, Poznań',
  },
  'Malta Ski': {
    category: 'ENTERTAINMENT',
    costPln: 40,
    visitMinutes: 60,
    address: 'ul. Wiankowa 2, Poznań',
  },
  'Nowe Zoo': {
    category: 'NATURE',
    costPln: 35,
    visitMinutes: 120,
    address: 'ul. Krańcowa 81, Poznań',
  },
  'Zamek Cesarski': {
    category: 'SIGHTSEEING',
    costPln: 0,
    visitMinutes: 40,
    address: 'ul. Święty Marcin 80/82, Poznań',
  },
  'Pomnik Poznańskiego Czerwca 1956': {
    category: 'SIGHTSEEING',
    costPln: 0,
    visitMinutes: 15,
    address: 'pl. Mickiewicza, Poznań',
  },
  'Collegium Minus': {
    category: 'SIGHTSEEING',
    costPln: 0,
    visitMinutes: 15,
    address: 'ul. Wieniawskiego 1, Poznań',
  },
  'Teatr Wielki': {
    category: 'ENTERTAINMENT',
    costPln: 0,
    visitMinutes: 15,
    address: 'ul. Fredry 9, Poznań',
  },
  'Biblioteka Raczyńskich': {
    category: 'SIGHTSEEING',
    costPln: 0,
    visitMinutes: 20,
    address: 'pl. Wolności 19, Poznań',
  },
  'Stary Browar': {
    category: 'ENTERTAINMENT',
    costPln: 0,
    visitMinutes: 60,
    address: 'ul. Półwiejska 42, Poznań',
  },
  'Teatr Polski': {
    category: 'ENTERTAINMENT',
    costPln: 0,
    visitMinutes: 15,
    address: 'ul. 27 Grudnia 8/10, Poznań',
  },
  'Muzeum Narodowe': {
    category: 'SIGHTSEEING',
    costPln: 20,
    visitMinutes: 75,
    address: 'Al. Marcinkowskiego 9, Poznań',
  },
  'Galeria Miejska Arsenał': {
    category: 'ENTERTAINMENT',
    costPln: 10,
    visitMinutes: 40,
    address: 'Stary Rynek 6, Poznań',
  },
  'Muzeum Instrumentów Muzycznych': {
    category: 'SIGHTSEEING',
    costPln: 15,
    visitMinutes: 45,
    address: 'Stary Rynek 45, Poznań',
  },
  'Rynek Jeżycki': {
    category: 'FOOD',
    costPln: 20,
    visitMinutes: 30,
    address: 'Rynek Jeżycki, Poznań',
  },
  'Plac Wielkopolski': {
    category: 'FOOD',
    costPln: 20,
    visitMinutes: 30,
    address: 'pl. Wielkopolski, Poznań',
  },
  'Rogalowe Muzeum Poznania': {
    category: 'FOOD',
    costPln: 40,
    visitMinutes: 60,
    address: 'Stary Rynek 41, Poznań',
  },
  'Stary Rynek': {
    category: 'FOOD',
    costPln: 45,
    visitMinutes: 60,
    address: 'Stary Rynek, Poznań',
  },
};

/**
 * Brings planner metadata up to date on every seeded stop and refreshes each
 * route's cost. Runs on every seed, so existing databases receive the data
 * too; stops are matched by name and only these four fields are written.
 */
async function seedStopDetails(): Promise<void> {
  for (const [name, details] of Object.entries(STOP_DETAILS)) {
    await prisma.routeStop.updateMany({
      where: { name },
      data: {
        category: details.category,
        costPln: details.costPln,
        visitMinutes: details.visitMinutes,
        address: details.address ?? '',
      },
    });
  }

  const routes = await prisma.route.findMany({
    select: { id: true, stops: { select: { costPln: true } } },
  });
  for (const route of routes) {
    await prisma.route.update({
      where: { id: route.id },
      data: { costPln: route.stops.reduce((sum, stop) => sum + stop.costPln, 0) },
    });
  }
}

async function seedContent(): Promise<void> {
  for (const citySeed of CITIES) {
    const city = await prisma.city.upsert({
      where: { slug: citySeed.slug },
      update: {},
      create: {
        slug: citySeed.slug,
        name: citySeed.name,
        country: citySeed.country,
        description: citySeed.description,
        centerLatitude: citySeed.centerLatitude,
        centerLongitude: citySeed.centerLongitude,
      },
    });

    for (const routeSeed of citySeed.routes) {
      const existing = await prisma.route.findUnique({
        where: { slug: routeSeed.slug },
        select: { id: true },
      });

      if (existing) continue;

      const distanceMeters = pathLength(routeSeed.stops);

      await prisma.route.create({
        data: {
          slug: routeSeed.slug,
          cityId: city.id,
          name: routeSeed.name,
          summary: routeSeed.summary,
          description: routeSeed.description,
          category: routeSeed.category,
          status: 'PUBLISHED',
          publishedAt: new Date(),
          distanceMeters,
          durationMinutes: estimateWalkingMinutes(distanceMeters, routeSeed.stops.length),
          stopCount: routeSeed.stops.length,
          stops: {
            create: routeSeed.stops.map((stop, index) => ({
              position: index + 1,
              name: stop.name,
              description: stop.description,
              latitude: stop.latitude,
              longitude: stop.longitude,
            })),
          },
        },
      });
    }
  }

  await seedStopDetails();

  console.warn(`Demonstration content ready: ${CITIES.length} cities`);
}

async function main(): Promise<void> {
  if (isProduction) {
    console.warn('Production environment — demonstration content skipped');
  } else {
    await seedContent();
  }

  await reportAdministratorState();
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
