import type { CSSProperties } from 'react';

import { getTranslations } from 'next-intl/server';
import { CalendarClockIcon, PinIcon } from 'lucide-react';

import { formatCommunityDateTime } from '@/utils/communityFormatUtils';

import Badge from '@/components/ui/buttons/Badge';

import type { PortalCommunityAnnouncement } from '@/types/client-portal/community';

import '@/styles/04-components/client-area/community-home.scss';

interface CommunityAnnouncementsBoardProps {
  announcements: PortalCommunityAnnouncement[];
  locale: string;
}

/**
 * En qué estado está un aviso, que es lo que decide su etiqueta.
 *
 * Son tres y no dos porque «no visible» junta dos cosas que no se parecen: uno que **todavía** no ha salido
 * y otro que **ya** salió. Al dueño de la comunidad le importan de forma distinta —uno hay que esperarlo y el
 * otro se puede olvidar—, así que se distinguen por la fecha de publicación.
 * @param {PortalCommunityAnnouncement} announcement - El aviso
 * @returns {"live" | "scheduled" | "expired"} Su estado
 */
function announcementState(
  announcement: PortalCommunityAnnouncement,
): 'live' | 'scheduled' | 'expired' {
  if (announcement.isVisible) return 'live';

  return new Date(announcement.publishedAt) > new Date() ? 'scheduled' : 'expired';
}

/**
 * El tablón de anuncios de la comunidad, tal y como lo ve su dueño.
 *
 * De solo lectura, igual que el endpoint: el tablón lo escribe personal interno. Aquí se ve **qué hay
 * puesto**, y por eso se enseñan también los avisos que un vecino no ve todavía o ya no ve — la pregunta que
 * trae a alguien a esta pantalla es «¿qué están leyendo mis vecinos?», y para responderla hay que poder
 * distinguir lo publicado de lo programado.
 *
 * El color de cada aviso lo elige quien lo publica y llega en hexadecimal. Se usa solo como franja lateral,
 * no como fondo: un aviso con fondo de color propio deja de ser legible en cuanto alguien elige un tono
 * fuerte, y el texto no está bajo nuestro control.
 * @param {CommunityAnnouncementsBoardProps} props - Los avisos ya cargados y el locale
 * @returns {Promise<JSX.Element>} El tablón renderizado
 */
export default async function CommunityAnnouncementsBoard({
  announcements,
  locale,
}: CommunityAnnouncementsBoardProps) {
  const t = await getTranslations('Views.ClientArea.Communities.Home');

  if (announcements.length === 0) {
    return <p className="community-home__empty">{t('boardEmpty')}</p>;
  }

  return (
    <ul className="community-board">
      {announcements.map((announcement) => {
        const state = announcementState(announcement);

        return (
          <li
            key={announcement.id}
            className={`community-board__item community-board__item--${state}`}
            /*
             * El color va por variable y no en una clase: es un valor libre que elige quien publica, así que
             * no hay una lista de clases que lo cubra. Sin color, la franja se queda con la del tema.
             */
            style={
              announcement.color
                ? ({ '--announcement-color': announcement.color } as CSSProperties)
                : undefined
            }
          >
            <div className="community-board__head">
              <h3 className="community-board__title">
                {announcement.pinned && (
                  <PinIcon aria-label={t('pinned')} className="community-board__pin" />
                )}
                {announcement.title}
              </h3>

              {/* Solo se etiqueta lo que no está vivo: en un tablón, «publicado» es lo normal. */}
              {state !== 'live' && (
                <Badge
                  variant={state === 'scheduled' ? 'info' : 'neutral'}
                  text={state === 'scheduled' ? t('scheduled') : t('expired')}
                />
              )}
            </div>

            <p className="community-board__body">{announcement.body}</p>

            <p className="community-board__meta">
              <CalendarClockIcon aria-hidden="true" />
              {t('publishedAt', {
                date: formatCommunityDateTime(announcement.publishedAt, locale, '—'),
              })}
              {announcement.expiresAt
                ? ` · ${t('expiresAt', {
                    date: formatCommunityDateTime(announcement.expiresAt, locale, '—'),
                  })}`
                : ''}
              {announcement.createdByName ? ` · ${announcement.createdByName}` : ''}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
