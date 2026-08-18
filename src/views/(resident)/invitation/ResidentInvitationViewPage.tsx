import { getTranslations } from 'next-intl/server';

import ResidentInvitationForm from '@/components/ui/auth/ResidentInvitationForm';

import { previewResidentInvitation } from '@/actions/auth/resident-auth-actions';
import { HTTPStatus } from '@/constants/httpStatus';

import '@/styles/04-components/auth/authForm.scss';

interface ResidentInvitationViewPageProps {
  token: string;
}

/**
 * Página de invitación a una comunidad de vecinos. Resuelve la previsualización en el servidor —el token es de
 * un solo uso y previsualizar no lo consume, así que no hay problema en hacerlo antes de pintar nada— y solo
 * pasa al formulario cliente si el token sigue siendo válido.
 * @param {ResidentInvitationViewPageProps} props - El token del enlace
 * @returns {Promise<JSX.Element>} La vista de invitación renderizada
 */
export default async function ResidentInvitationViewPage({ token }: ResidentInvitationViewPageProps) {
  const t = await getTranslations('Views.Auth.Resident.Invitation');
  const preview = await previewResidentInvitation(token);

  if (preview.status !== HTTPStatus.OK || !preview.data) {
    return (
      <div className="auth-form">
        <div className="auth-form__header">
          <h1 className="auth-form__title">{t('title')}</h1>
        </div>
        <p className="auth-form__error">{t('invalidToken')}</p>
      </div>
    );
  }

  return <ResidentInvitationForm token={token} invitation={preview.data} />;
}
