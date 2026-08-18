import ResidentInvitationViewPage from '@/views/(resident)/invitation/ResidentInvitationViewPage';

interface ResidentInvitationPageProps {
    params: Promise<{ locale: string; token: string }>;
}

/**
 * Página de invitación a una comunidad de vecinos, a la que llega el enlace del correo enviado desde
 * `plantilla-nestjs` (`ResidentsService.sendInvitationEmail`).
 * @param {ResidentInvitationPageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<JSX.Element>} La vista de invitación renderizada
 */
export default async function ResidentInvitationPage({ params }: ResidentInvitationPageProps) {
    const { token } = await params;

    return <ResidentInvitationViewPage token={token} />;
}
