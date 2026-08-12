'use client';

import { useState, useTransition, type CSSProperties } from 'react';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CalendarClockIcon, PencilIcon, PinIcon, PlusIcon, Trash2Icon } from 'lucide-react';

import {
  createCommunityAnnouncement,
  removeCommunityAnnouncement,
  updateCommunityAnnouncement,
} from '@/actions/client-portal/communities-actions';
import { HTTPStatus } from '@/constants/httpStatus';
import { notifyResponse } from '@/utils/toastUtils';
import { formatCommunityDateTime } from '@/utils/communityFormatUtils';

import Badge from '@/components/ui/buttons/Badge';
import Button from '@/components/ui/buttons/Button';
import IconButton from '@/components/ui/buttons/IconButton';
import ColorPicker from '@/components/ui/inputs/ColorPicker';
import DatePicker from '@/components/ui/inputs/DatePicker';
import Input from '@/components/ui/inputs/Input';
import ModalComponent from '@/components/ui/modals/ModalComponent';
import Textarea from '@/components/ui/inputs/Textarea';
import Toggle from '@/components/ui/inputs/Toggle';

import type { PortalCommunityAnnouncement } from '@/types/client-portal/community';
import type { FetchResponse } from '@/types/responses';

import '@/styles/04-components/client-area/community-home.scss';
import '@/styles/04-components/client-area/community-common.scss';
import '@/styles/04-components/ui/forms/form-row.scss';

interface CommunityAnnouncementsBoardProps {
  serviceId: string;
  announcements: PortalCommunityAnnouncement[];
  locale: string;
}

interface AnnouncementFormValues {
  title: string;
  body: string;
  publishedAt: Date | null;
  expiresAt: Date | null;
  pinned: boolean;
  color: string | null;
}

const EMPTY_FORM: AnnouncementFormValues = {
  title: '',
  body: '',
  publishedAt: null,
  expiresAt: null,
  pinned: false,
  color: null,
};

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
 * El tablón de anuncios de la comunidad, tal y como lo ve y lo edita su dueño.
 *
 * Publicar, corregir y retirar avisos vive aquí desde el propio portal (revisado: antes solo lo
 * escribía personal interno). Se enseñan también los avisos que un vecino no ve todavía o ya no ve —
 * la pregunta que trae a alguien a esta pantalla es «¿qué están leyendo mis vecinos?», y para
 * responderla hay que poder distinguir lo publicado de lo programado.
 *
 * El color de cada aviso es libre (hexadecimal) y se usa solo como franja lateral, no como fondo: un
 * aviso con fondo de color propio deja de ser legible en cuanto alguien elige un tono fuerte, y el
 * texto no está bajo nuestro control.
 * @param {CommunityAnnouncementsBoardProps} props - Comunidad, los avisos ya cargados y el locale
 * @returns {JSX.Element} El tablón renderizado
 */
export default function CommunityAnnouncementsBoard({
  serviceId,
  announcements,
  locale,
}: CommunityAnnouncementsBoardProps) {
  const t = useTranslations('Views.ClientArea.Communities.Home');
  const tErrors = useTranslations('Common.Errors');

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formTarget, setFormTarget] = useState<PortalCommunityAnnouncement | 'new' | null>(null);
  const [formValues, setFormValues] = useState<AnnouncementFormValues>(EMPTY_FORM);
  const [removeTarget, setRemoveTarget] = useState<PortalCommunityAnnouncement | null>(null);

  const openCreate = () => {
    setFormValues(EMPTY_FORM);
    setFormTarget('new');
  };

  const openEdit = (announcement: PortalCommunityAnnouncement) => {
    setFormValues({
      title: announcement.title,
      body: announcement.body,
      publishedAt: new Date(announcement.publishedAt),
      expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt) : null,
      pinned: announcement.pinned,
      color: announcement.color ?? null,
    });
    setFormTarget(announcement);
  };

  const run = (action: () => Promise<FetchResponse<unknown>>, onDone?: () => void) => {
    startTransition(async () => {
      const response = await action();
      notifyResponse(response, tErrors('unexpectedError'));

      if (response.status === HTTPStatus.OK || response.status === HTTPStatus.CREATED) {
        onDone?.();
        router.refresh();
      }
    });
  };

  const handleSubmit = () => {
    const dto = {
      title: formValues.title,
      body: formValues.body,
      publishedAt: formValues.publishedAt?.toISOString(),
      expiresAt: formValues.expiresAt ? formValues.expiresAt.toISOString() : '',
      pinned: formValues.pinned,
      color: formValues.color ?? '',
    };

    if (formTarget === 'new') {
      run(() => createCommunityAnnouncement(serviceId, dto), () => setFormTarget(null));
      return;
    }

    if (formTarget) {
      run(
        () => updateCommunityAnnouncement(serviceId, formTarget.id, dto),
        () => setFormTarget(null),
      );
    }
  };

  const handleRemoveConfirm = () => {
    if (!removeTarget) return;
    const target = removeTarget;
    setRemoveTarget(null);

    run(() => removeCommunityAnnouncement(serviceId, target.id));
  };

  return (
    <div className="community-board-manager">
      <div className="community-board-manager__actions">
        <Button title="publish" variant="primary" onClick={openCreate}>
          <PlusIcon />
        </Button>
      </div>

      {announcements.length === 0 ? (
        <p className="community-home__empty">{t('boardEmpty')}</p>
      ) : (
        <ul className="community-board">
          {announcements.map((announcement) => {
            const state = announcementState(announcement);

            return (
              <li
                key={announcement.id}
                className={`community-board__item community-board__item--${state}`}
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

                  <div className="community-board__head-actions">
                    {/* Solo se etiqueta lo que no está vivo: en un tablón, «publicado» es lo normal. */}
                    {state !== 'live' && (
                      <Badge
                        variant={state === 'scheduled' ? 'info' : 'neutral'}
                        text={state === 'scheduled' ? t('scheduled') : t('expired')}
                      />
                    )}

                    <IconButton
                      size="sm"
                      variant="neutral"
                      ariaLabel="edit"
                      onClick={() => openEdit(announcement)}
                    >
                      <PencilIcon />
                    </IconButton>
                    <IconButton
                      size="sm"
                      variant="error"
                      ariaLabel="delete"
                      onClick={() => setRemoveTarget(announcement)}
                    >
                      <Trash2Icon />
                    </IconButton>
                  </div>
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
      )}

      {formTarget && (
        <ModalComponent
          title={formTarget === 'new' ? t('publishTitle') : t('editAnnouncementTitle')}
          isOpen
          isLoading={isPending}
          onClose={() => setFormTarget(null)}
          onCancel={() => setFormTarget(null)}
          onConfirm={handleSubmit}
          confirmText="save"
          isLoadingText="saving"
          confirmDisabled={!formValues.title.trim() || !formValues.body.trim()}
        >
          <div className="community-form">
            <Input
              id="announcement-title"
              name="title"
              label={t('titleLabel')}
              noTranslate
              placeholder={t('titlePlaceholder')}
              className="input__full"
              value={formValues.title}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, title: event.target.value }))
              }
            />

            <Textarea
              id="announcement-body"
              name="body"
              label={t('bodyLabel')}
              noTranslate
              placeholder={t('bodyPlaceholder')}
              className="input__full"
              rows={4}
              value={formValues.body}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, body: event.target.value }))
              }
            />

            <div className="form-row form-row--cols-2">
              <div className="community-form__field">
                <DatePicker
                  id="announcement-published-at"
                  name="publishedAt"
                  label={t('publishedAtLabel')}
                  value={formValues.publishedAt}
                  onChange={(date) => setFormValues((prev) => ({ ...prev, publishedAt: date }))}
                  maxDate={formValues.expiresAt ?? undefined}
                  clearable
                  className="date-picker__full"
                />
                <span className="community-form__help">{t('publishedAtHelp')}</span>
              </div>

              <div className="community-form__field">
                <DatePicker
                  id="announcement-expires-at"
                  name="expiresAt"
                  label={t('expiresAtLabel')}
                  value={formValues.expiresAt}
                  onChange={(date) => setFormValues((prev) => ({ ...prev, expiresAt: date }))}
                  minDate={formValues.publishedAt ?? undefined}
                  disablePast
                  clearable
                  className="date-picker__full"
                />
                <span className="community-form__help">{t('expiresAtHelp')}</span>
              </div>
            </div>

            <ColorPicker
              id="announcement-color"
              name="color"
              label={t('colorLabel')}
              value={formValues.color}
              onChange={(color) => setFormValues((prev) => ({ ...prev, color }))}
            />

            <Toggle
              id="announcement-pinned"
              name="pinned"
              label={t('pinnedLabel')}
              checked={formValues.pinned}
              onChange={(checked) => setFormValues((prev) => ({ ...prev, pinned: checked }))}
            />
          </div>
        </ModalComponent>
      )}

      {removeTarget && (
        <ModalComponent
          title={t('removeConfirmTitle')}
          isOpen
          isLoading={isPending}
          onClose={() => setRemoveTarget(null)}
          onCancel={() => setRemoveTarget(null)}
          onConfirm={handleRemoveConfirm}
          confirmVariant="error"
          confirmText="delete"
          isLoadingText="deleting"
        >
          <p>{t('removeConfirmDescription')}</p>
        </ModalComponent>
      )}
    </div>
  );
}
