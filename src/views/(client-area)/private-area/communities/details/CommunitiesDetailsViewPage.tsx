import { getTranslations } from 'next-intl/server';
import { ArrowRightIcon, Building2Icon, MegaphoneIcon } from 'lucide-react';

import {
  getClientCommunities,
  getCommunityAnnouncements,
  getCommunityConfig,
} from '@/actions/client-portal/communities-actions';
import { getCommunityIncidents } from '@/actions/client-portal/community-incidents-actions';
import { getCommunityAccessSummary } from '@/actions/client-portal/community-locks-actions';

import { Link } from '@/i18n/navigation';

import Badge from '@/components/ui/buttons/Badge';
import SettingsSection from '@/components/ui/sections/SettingsSection';
import CommunityAccessOverview from '@/views/(client-area)/private-area/communities/details/components/CommunityAccessOverview';
import CommunityAnnouncementsBoard from '@/views/(client-area)/private-area/communities/details/components/CommunityAnnouncementsBoard';
import CommunityDashboard from '@/views/(client-area)/private-area/communities/details/components/CommunityDashboard';

import { INCIDENT_STATUS_ORDER } from '@/utils/communityFormatUtils';
import { formatServiceAddress } from '@/utils/addressFormatUtils';

import type { AnyHref } from '@/i18n/navigation';

import '@/styles/04-components/client-area/community-common.scss';
import '@/styles/04-components/client-area/community-home.scss';

/**
 * Cuántas incidencias se traen para los recuentos y los gráficos.
 *
 * Es un tope, no una página: aquí no se listan incidencias, se cuentan. Cien cubre de sobra el histórico de
 * una comunidad y evita traerse miles para dibujar tres gráficos. Si una comunidad las supera, los gráficos
 * hablan de las cien últimas — y eso lo dice la propia pantalla, en vez de callarlo.
 */
const INCIDENTS_LIMIT = 100;

/**
 * Los estados que cuentan como «abierta» para la tarjeta de arriba.
 *
 * Resuelta no está: una incidencia resuelta ya no necesita a nadie, aunque no se haya cerrado formalmente.
 * Contarla como abierta hinchaba la cifra que precisamente se mira para saber si hay trabajo pendiente.
 */
const OPEN_STATUSES = INCIDENT_STATUS_ORDER.filter((status) =>
  ['NUEVA', 'EN_CURSO', 'ESPERANDO_TERCERO'].includes(status),
);

interface CommunityHomeViewPageProps {
  serviceId: string;
  locale: string;
}

/**
 * La portada de una comunidad: lo que está pasando en el edificio, de un vistazo.
 *
 * Antes esta ruta redirigía a la lista de vecinos, con el argumento de que un resumen duplicaría las tarjetas
 * del selector. Duplicaba dos cifras —unidades y vecinos— y a cambio dejaba fuera todo lo demás: el tablón,
 * las incidencias y el registro de accesos vivían cada uno en su pestaña, así que para saber cómo va la
 * comunidad había que visitar cuatro pantallas y acordarse de lo que decía cada una.
 *
 * Las cinco llamadas van **en paralelo**: son independientes entre sí y el tiempo de la pantalla es el de la
 * más lenta, no la suma. Ninguna tumba la página si falla — un tablón que no carga deja la portada sin
 * tablón, no sin portada—, porque aquí cada bloque se lee por separado.
 * @param {CommunityHomeViewPageProps} props - Comunidad activa y locale
 * @returns {Promise<JSX.Element>} La portada de la comunidad renderizada
 */
export default async function CommunitiesDetailsViewPage({
  serviceId,
  locale,
}: CommunityHomeViewPageProps) {
  const t = await getTranslations('Views.ClientArea.Communities.Home');
  const tCommunities = await getTranslations('Views.ClientArea.Communities');

  const [communities, config, announcements, incidents, accessSummaries] = await Promise.all([
    getClientCommunities(),
    getCommunityConfig(serviceId),
    getCommunityAnnouncements(serviceId),
    getCommunityIncidents({ clientServiceId: serviceId, limit: INCIDENTS_LIMIT }),
    getCommunityAccessSummary(serviceId),
  ]);

  const community = (communities.data ?? []).find((item) => item.serviceId === serviceId);
  const board = announcements.data ?? [];
  const items = incidents.data?.items ?? [];
  const summaries = accessSummaries.data ?? [];

  const liveAnnouncements = board.filter((announcement) => announcement.isVisible).length;
  const openIncidents = items.filter((incident) =>
    OPEN_STATUSES.includes(incident.status),
  ).length;

  /*
   * El total lo dice la paginación, no la longitud de la lista.
   *
   * Son distintos en cuanto una comunidad pasa de `INCIDENTS_LIMIT`, y la tarjeta tiene que decir cuántas hay
   * de verdad aunque los gráficos hablen solo de las que se han traído.
   */
  const totalIncidents = incidents.data?.pagination?.totalItems ?? items.length;
  const isTruncated = totalIncidents > items.length;

  return (
    <>
      <header className="community-home__header">
        <span className="community-home__header-icon">
          <Building2Icon aria-hidden="true" />
        </span>

        <div className="community-home__header-text">
          <h1 className="community-home__header-title">
            {formatServiceAddress(community?.address) ?? t('title')}
          </h1>
          <p className="community-home__header-description">{t('descriptionPlain')}</p>
        </div>

        {community && <Badge variant="neutral" text={community.serviceCode} />}
      </header>

      {/* Las cuatro cifras que se miran al entrar, en el orden en que se preguntan. */}
      <dl className="community-home__stats">
        <div className="community-home__stat">
          <dt>{tCommunities('unitsCount')}</dt>
          <dd>{community?.units ?? 0}</dd>
        </div>

        <div className="community-home__stat">
          <dt>{tCommunities('residentsCount')}</dt>
          <dd>
            {config.data?.activeResidents ?? community?.residents ?? 0}
            {/* Con el tope del contrato al lado, la cifra dice además cuánto margen queda. */}
            {config.data?.maxResidents ? (
              <span className="community-home__stat-of">
                {t('ofMax', { max: config.data.maxResidents })}
              </span>
            ) : null}
          </dd>
        </div>

        <div className="community-home__stat">
          <dt>{t('openIncidents')}</dt>
          <dd>{openIncidents}</dd>
        </div>

        <div className="community-home__stat">
          <dt>{t('liveAnnouncements')}</dt>
          <dd>{liveAnnouncements}</dd>
        </div>
      </dl>

      {/*
        Cada bloque es una `SettingsSection` del sistema de diseño, que es la tarjeta que admite icono y
        descripción. Antes eran `<section>` con tres clases propias por bloque, repintando lo que la tarjeta
        ya hace — y con un tamaño de título distinto al de las demás pantallas del portal.
      */}
      <SettingsSection title={t('boardTitle')} description={t('boardHint')} icon={MegaphoneIcon}>
        <CommunityAnnouncementsBoard serviceId={serviceId} announcements={board} locale={locale} />
      </SettingsSection>

      <SettingsSection
        title={t('chartsTitle')}
        description={isTruncated ? t('chartsHintTruncated', { shown: items.length }) : t('chartsHint')}
      >
        <CommunityDashboard incidents={items} accessSummaries={summaries} locale={locale} />

        <Link
          href={`/private-area/communities/${serviceId}/incidents` as AnyHref}
          className="community-home__more"
        >
          {t('incidentsMore')}
          <ArrowRightIcon aria-hidden="true" />
        </Link>
      </SettingsSection>

      {/*
        El registro de accesos solo existe con llaveros contratados: sin ellos la API responde 403 y el menú
        lateral tampoco ofrece la sección, así que aquí se omite en vez de enseñar un bloque vacío.
      */}
      {community?.keyringEnabled && (
        <SettingsSection title={t('accessTitle')} description={t('accessHint')}>
          <CommunityAccessOverview serviceId={serviceId} summaries={summaries} locale={locale} />
        </SettingsSection>
      )}
    </>
  );
}
