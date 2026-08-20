import { ENV } from '@/config/env';
import { getPathname, type AnyHref } from '@/i18n/navigation';

/**
 * Datos estructurados `JobPosting` de una oferta (requisitos-empleo.md, sección 5.1).
 *
 * Tres decisiones que no son estilo:
 *
 * - **`baseSalary` solo aparece si la oferta publica el importe.** Nunca un aproximado ni un cero: un dato
 *   estructurado que no coincide con lo que ve el usuario es motivo de penalización, no un detalle. Y no hay
 *   riesgo de colarlo, porque el backend tampoco devuelve el salario cuando no es público.
 * - **`validThrough` sale de la caducidad**, que en este módulo es obligatoria justo por esto: una oferta
 *   indexada sin fecha de fin, o ya vencida, es un aviso en Search Console.
 * - **Solo se emite en la ficha.** Marcar una lista de ofertas como si cada una fuera su propia página es
 *   exactamente lo que Google pide no hacer.
 *
 * Va sin `nonce`, igual que el resto del JSON-LD de la web: `application/ld+json` es un bloque de datos que
 * el navegador no ejecuta, así que la CSP de `script-src` no lo bloquea.
 * @param {JobPostingJsonLdProps} props - La oferta y el idioma de la página
 * @returns {JSX.Element} El `<script type="application/ld+json">`
 */
export default function JobPostingJsonLd({ job, locale }: JobPostingJsonLdProps) {
    const baseUrl = ENV.APP_URL.replace(/\/$/, '');
    // El pathname canónico y el slug van **por separado**: es lo único que permite a next-intl traducir
    // el segmento estático (`/empleo` en español) antes de sustituir el slug. Con la ruta ya montada como
    // cadena, devolvería `/careers/...` en español, que es un 404.
    const jobPath = getPathname({
        href: { pathname: '/careers/[slug]', params: { slug: job.slug } } as AnyHref,
        locale,
    });

    const jsonLd: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        identifier: {
            '@type': 'PropertyValue',
            name: ENV.APP_NAME,
            value: job.jobCode,
        },
        // La descripción se manda con los tres bloques juntos: es lo que un buscador de empleo enseña como
        // cuerpo de la oferta, y partirlo dejaría fuera los requisitos.
        description: [job.description, job.responsibilities, job.requirements]
            .filter(Boolean)
            .join('\n\n'),
        datePosted: job.publishedAt,
        validThrough: job.expiresAt,
        employmentType: job.employmentType,
        hiringOrganization: { '@id': `${baseUrl}/#organization` },
        jobLocation: job.locations.map((location) => ({
            '@type': 'Place',
            address: {
                '@type': 'PostalAddress',
                addressLocality: location.name,
                addressRegion: location.region ?? location.province,
                addressCountry: location.country,
                ...(location.postalCode ? { postalCode: location.postalCode } : {}),
            },
            ...(location.latitude && location.longitude
                ? {
                      geo: {
                          '@type': 'GeoCoordinates',
                          latitude: Number(location.latitude),
                          longitude: Number(location.longitude),
                      },
                  }
                : {}),
        })),
        experienceRequirements: job.experienceLevel,
        url: `${baseUrl}${jobPath}`,
        // `directApply` en `true` solo cuando se puede presentar aquí mismo: con una candidatura externa, el
        // formulario no existe y decir lo contrario sería falso.
        directApply: !job.applyUrl,
    };

    if (job.workMode === 'REMOTE') jsonLd.jobLocationType = 'TELECOMMUTE';

    if (job.salary) {
        jsonLd.baseSalary = {
            '@type': 'MonetaryAmount',
            currency: job.salary.currency,
            value: {
                '@type': 'QuantitativeValue',
                ...(job.salary.min ? { minValue: Number(job.salary.min) } : {}),
                ...(job.salary.max ? { maxValue: Number(job.salary.max) } : {}),
                unitText: job.salary.period,
            },
        };
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
