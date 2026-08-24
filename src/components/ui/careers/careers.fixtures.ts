/**
 * Datos de ejemplo compartidos por las historias de empleo.
 *
 * Están en un fichero aparte porque cinco historias necesitan la misma oferta y las mismas facetas, y
 * duplicarlas en cada una hacía que un cambio en el tipo obligara a tocar cinco ficheros. No se usa en
 * producción: solo lo importan los `.stories.tsx`.
 */

/** Ciudades con ofertas, tal como las devuelve el endpoint de facetas. */
export const CITY_FACETS: PublicJobFacet[] = [
    { slug: 'madrid', name: 'Madrid', count: 4 },
    { slug: 'getafe', name: 'Getafe', count: 2 },
    { slug: 'alcorcon', name: 'Alcorcón', count: 1 },
    { slug: 'leganes', name: 'Leganés', count: 1 },
];

/**
 * Ciudades del catálogo, tal como las devuelve `GET /public/careers/locations`.
 *
 * Aparte de {@link CITY_FACETS} porque no son lo mismo: una faceta lleva su número de ofertas y sale de
 * las vigentes; esto es el catálogo de la empresa, y es lo que alimenta el selector del formulario.
 */
export const CITY_LOCATIONS: PublicJobLocation[] = [
    { slug: 'madrid', name: 'Madrid', province: 'Madrid', country: 'ES' },
    { slug: 'getafe', name: 'Getafe', province: 'Madrid', country: 'ES' },
    { slug: 'alcorcon', name: 'Alcorcón', province: 'Madrid', country: 'ES' },
    { slug: 'leganes', name: 'Leganés', province: 'Madrid', country: 'ES' },
];

/** Todas las facetas del buscador. */
export const JOB_FILTERS: PublicJobFilters = {
    cities: CITY_FACETS,
    categories: [
        { slug: 'conserjeria', name: 'Conserjería', count: 3 },
        { slug: 'limpieza', name: 'Limpieza', count: 2 },
        { slug: 'seguridad', name: 'Seguridad', count: 1 },
    ],
    contractTypes: [
        { slug: 'indefinido', name: 'Indefinido', count: 4 },
        { slug: 'temporal', name: 'Temporal', count: 2 },
    ],
    workModes: [
        { slug: 'ON_SITE', name: 'ON_SITE', count: 5 },
        { slug: 'HYBRID', name: 'HYBRID', count: 1 },
    ],
    experienceLevels: [
        { slug: 'NONE', name: 'NONE', count: 2 },
        { slug: 'UP_TO_1', name: 'UP_TO_1', count: 3 },
        { slug: 'FROM_1_TO_3', name: 'FROM_1_TO_3', count: 1 },
    ],
    totalJobs: 6,
};

/** Una oferta del listado, con salario público y destacada. */
export const JOB_LIST_ITEM: PublicJobListItem = {
    jobCode: 'EMP-000001',
    slug: 'conserje-en-getafe-emp-000001',
    title: 'Conserje en Getafe',
    summary: 'Turno de mañana en una comunidad de 120 viviendas, con incorporación inmediata.',
    categoryName: 'Conserjería',
    categorySlug: 'conserjeria',
    contractTypeName: 'Indefinido',
    contractTypeSlug: 'indefinido',
    scheduleName: 'Jornada completa',
    workMode: 'ON_SITE',
    experienceLevel: 'UP_TO_1',
    locations: [
        {
            name: 'Getafe',
            slug: 'getafe',
            province: 'Madrid',
            region: 'Comunidad de Madrid',
            country: 'ES',
            zoneSlug: 'getafe',
        },
    ],
    salary: { min: '18000.00', max: '21000.00', currency: 'EUR', period: 'YEAR' },
    isFeatured: true,
    acceptingApplications: true,
    publishedAt: '2026-08-18T08:00:00.000Z',
    expiresAt: '2026-11-30T08:00:00.000Z',
};

/** La misma oferta, con todo lo que la ficha necesita además del listado. */
export const JOB_DETAIL: PublicJobDetail = {
    ...JOB_LIST_ITEM,
    description: [
        'Buscamos a alguien para el control de accesos y la atención a los vecinos de una comunidad grande en Getafe.',
        '',
        'El puesto es estable y con formación pagada desde el primer día.',
    ].join('\n'),
    responsibilities: [
        '- Control de accesos y atención en portería',
        '- Aviso de incidencias a la comunidad',
    ].join('\n'),
    requirements: '- Experiencia de al menos un año en atención al público',
    niceToHave: '- Certificado de manipulación de piscinas',
    benefits: ['Formación pagada', 'Seguro médico', 'Uniforme y equipo'],
    vacancies: 2,
    metaTitle: 'Trabajo de conserje en Getafe',
    metaDescription: 'Oferta estable de conserje en Getafe, turno de mañana y formación pagada.',
    applyUrl: null,
    employmentType: 'FULL_TIME',
    alternateSlugs: { en: 'concierge-in-getafe-emp-000001' },
};

/**
 * Varias ofertas para el listado, con los casos que cambian cómo se pinta la tarjeta: destacada, sin
 * salario, en pausa y remota.
 */
export const JOB_LIST: PublicJobListItem[] = [
    JOB_LIST_ITEM,
    {
        ...JOB_LIST_ITEM,
        jobCode: 'EMP-000002',
        slug: 'limpieza-en-alcorcon-emp-000002',
        title: 'Limpieza en Alcorcón',
        summary: 'Refuerzo de mañana para zonas comunes durante la temporada de piscinas.',
        categoryName: 'Limpieza',
        categorySlug: 'limpieza',
        contractTypeName: 'Temporal',
        contractTypeSlug: 'temporal',
        scheduleName: 'Parcial de mañana',
        experienceLevel: 'NONE',
        locations: [
            { name: 'Alcorcón', slug: 'alcorcon', province: 'Madrid', country: 'ES' },
        ],
        salary: null,
        isFeatured: false,
    },
    {
        ...JOB_LIST_ITEM,
        jobCode: 'EMP-000003',
        slug: 'vigilante-en-leganes-emp-000003',
        title: 'Vigilante en Leganés',
        summary: 'Turno de noche en un residencial con control de accesos.',
        categoryName: 'Seguridad',
        categorySlug: 'seguridad',
        experienceLevel: 'FROM_1_TO_3',
        locations: [{ name: 'Leganés', slug: 'leganes', province: 'Madrid', country: 'ES' }],
        salary: { min: '20000.00', max: null, currency: 'EUR', period: 'YEAR' },
        isFeatured: false,
        acceptingApplications: false,
    },
    {
        ...JOB_LIST_ITEM,
        jobCode: 'EMP-000004',
        slug: 'coordinacion-remota-emp-000004',
        title: 'Coordinación de servicios (remoto)',
        summary: 'Planificación de rutas y equipos desde casa, con una visita mensual a la oficina.',
        workMode: 'REMOTE',
        experienceLevel: 'FROM_3_TO_5',
        locations: [{ name: 'Madrid', slug: 'madrid', province: 'Madrid', country: 'ES' }],
        salary: { min: '26000.00', max: '30000.00', currency: 'EUR', period: 'YEAR' },
        isFeatured: false,
    },
];
