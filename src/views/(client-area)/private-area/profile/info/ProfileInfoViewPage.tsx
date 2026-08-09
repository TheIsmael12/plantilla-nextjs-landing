import { getClientProfile } from '@/actions/client-portal/profile-actions';

import PersonalDataSection from '@/components/ui/client-area/PersonalDataSection';

/**
 * Vista de `/private-area/profile`: datos personales de solo lectura (`GET client/me`).
 * @returns {Promise<JSX.Element | null>} La sección de datos personales, o `null` si no se pudo obtener el perfil
 */
export default async function ProfileInfoViewPage() {
    const response = await getClientProfile();

    return response.data ? <PersonalDataSection profile={response.data} /> : null;
}
