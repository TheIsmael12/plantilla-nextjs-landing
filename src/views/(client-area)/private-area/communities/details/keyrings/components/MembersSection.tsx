'use client';

import { useEffect, useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';
import { KeyRoundIcon, UserPlusIcon } from 'lucide-react';

import { getKeyringMembers } from '@/actions/client-portal/community-lock-credentials-actions';

import Badge from '@/components/ui/buttons/Badge';
import Button from '@/components/ui/buttons/Button';

import AssignKeysModal from '@/views/(client-area)/private-area/communities/details/keyrings/components/AssignKeysModal';
import MemberDetailModal from '@/views/(client-area)/private-area/communities/details/keyrings/components/MemberDetailModal';

import type {
  LockGroup,
  PortalResident,
  ResidentInvitation,
} from '@/types/client-portal/community';

import '@/styles/04-components/client-area/community-common.scss';

/**
 * Una persona del llavero, con los llaveros que tiene.
 * @interface MemberRow
 * @property {string} id - Pertenencia o invitación
 * @property {'membership' | 'invitation'} kind - De cuál de las dos es el identificador
 * @property {string} name - Nombre, o el correo si aún no lo ha dado
 * @property {string | null} unitCode - Su vivienda
 * @property {string[]} keyrings - Los llaveros que tiene, por nombre
 */
interface MemberRow {
  id: string;
  kind: 'membership' | 'invitation';
  name: string;
  unitCode: string | null;
  keyrings: string[];
}

interface MembersSectionProps {
  serviceId: string;
  keyrings: LockGroup[];
  residents: PortalResident[];
  invitations: ResidentInvitation[];
}

/**
 * Los miembros del llavero: **quién tiene qué llavero**.
 *
 * Va por llaveros y no por llaves, que es la corrección que ordena toda esta pantalla. Una llave —el PIN de
 * alguien, su móvil— no es un acceso: es con qué se identifica esa persona, es **una sola** por clase y le
 * vale para todo lo suyo. Lo que abre puertas es pertenecer a un llavero. Mientras esto se listó por llaves,
 * el mismo vecino salía dos veces —una por su app y otra por su PIN— como si tuviera dos accesos distintos
 * al mismo sitio, y darle uno nuevo preguntaba un tipo de llave que ya no se elige en ningún sitio.
 *
 * Por eso aquí no hay tipo, ni validez, ni «conceder llave»: **el más solo mete a alguien en un llavero**.
 * Todo lo demás lo decide el llavero, que es donde se puede ver y cambiar una vez para todos.
 * @param {MembersSectionProps} props - Comunidad, llaveros, vecinos e invitaciones
 * @returns {JSX.Element} La sección renderizada
 */
export default function MembersSection({
  serviceId,
  keyrings,
  residents,
  invitations,
}: MembersSectionProps) {
  const t = useTranslations('Views.ClientArea.Communities.Keyrings.Members');

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState<string | null>(null);
  const [byMember, setByMember] = useState<Map<string, string[]>>(new Map());
  const [reloadKey, setReloadKey] = useState(0);

  /*
   * Quién tiene cada llavero, preguntado llavero a llavero.
   *
   * Se pregunta y no se deduce de las llaves porque una llave ya no dice a qué llavero pertenece: es el
   * medio con el que alguien se identifica y le vale para todos los suyos. La única fuente de «quién tiene
   * esto» son los miembros de cada llavero, y son pocos —uno por portal, garaje o zona común—, así que
   * caben en una tanda de peticiones en paralelo.
   */
  useEffect(() => {
    if (keyrings.length === 0) return;

    let cancelled = false;

    void (async () => {
      const responses = await Promise.all(
        keyrings.map((keyring) => getKeyringMembers(serviceId, keyring.id)),
      );

      if (cancelled) return;

      const map = new Map<string, string[]>();

      for (const response of responses) {
        for (const member of response.data ?? []) {
          const own = map.get(member.residentMembershipId) ?? [];
          own.push(member.keyringName);
          map.set(member.residentMembershipId, own);
        }
      }

      setByMember(map);
    })();

    return () => {
      cancelled = true;
    };
  }, [serviceId, keyrings, reloadKey]);

  const rows: MemberRow[] = useMemo(() => {
    const fromResidents: MemberRow[] = residents.map((resident) => ({
      id: resident.membershipId,
      kind: 'membership',
      name: resident.name || resident.email,
      unitCode: resident.communityUnitCode ?? null,
      keyrings: byMember.get(resident.membershipId) ?? [],
    }));

    const fromInvitations: MemberRow[] = invitations.map((invitation) => ({
      id: invitation.id,
      kind: 'invitation',
      name: invitation.name || invitation.email,
      unitCode: invitation.communityUnitCode ?? null,
      // Una invitación no tiene llaveros todavía: tiene planificados, que nacen el día que acepte.
      keyrings: [],
    }));

    /*
     * Primero quien no tiene ninguno.
     *
     * Es la lista de trabajo pendiente: en un edificio recién dado de alta, lo que hay que ver de un vistazo
     * es a quién le falta, no quién ya está resuelto.
     */
    return [...fromResidents, ...fromInvitations].sort(
      (left, right) => left.keyrings.length - right.keyrings.length,
    );
  }, [residents, invitations, byMember]);

  const withoutKeys = rows.filter((row) => row.keyrings.length === 0).length;

  return (
    <>
      <div className="community-toolbar">
        <p className="community-form__help">{t('description')}</p>

        <div className="community-toolbar__actions">
          <Button
            title="grantKeys"
            variant="primary"
            disabled={keyrings.length === 0}
            onClick={() => setIsAssignOpen(true)}
          >
            <UserPlusIcon />
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="community-empty">{t('empty')}</p>
      ) : (
        <div className="community-table__scroll">
          <table className="community-table">
            <thead>
              <tr>
                <th>{t('nameColumn')}</th>
                <th>{t('unitColumn')}</th>
                <th>{t('keyringsColumn')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.kind}-${row.id}`}>
                  <td>
                    <strong>{row.name}</strong>
                    {row.kind === 'invitation' && (
                      <Badge variant="warning" text={t('pendingInvitation')} />
                    )}
                  </td>
                  <td>{row.unitCode ?? <span className="community-table__muted">—</span>}</td>
                  <td>
                    {row.keyrings.length === 0 ? (
                      <span className="community-table__muted">{t('noKeyrings')}</span>
                    ) : (
                      row.keyrings.join(' · ')
                    )}
                  </td>
                  <td>
                    {/*
                      La ficha solo de quien ya es vecino: una invitación todavía no tiene llaveros que
                      gestionar, solo planificados, y esos se ven al repartir.
                    */}
                    {row.kind === 'membership' && (
                      <Button variant="outline" title="view" onClick={() => setDetailTarget(row.id)}>
                        <KeyRoundIcon />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* El trabajo que queda, dicho con un número: en un edificio nuevo es a lo que se viene. */}
      {withoutKeys > 0 && (
        <p className="community-form__help">{t('withoutKeyrings', { count: withoutKeys })}</p>
      )}

      {isAssignOpen && (
        <AssignKeysModal
          serviceId={serviceId}
          keyrings={keyrings}
          residents={residents}
          invitations={invitations}
          onClose={() => {
            setIsAssignOpen(false);
            setReloadKey((key) => key + 1);
          }}
        />
      )}

      {detailTarget && (
        <MemberDetailModal
          serviceId={serviceId}
          residentMembershipId={detailTarget}
          keyrings={keyrings}
          onClose={() => {
            setDetailTarget(null);
            setReloadKey((key) => key + 1);
          }}
        />
      )}
    </>
  );
}
