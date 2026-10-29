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
];

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
