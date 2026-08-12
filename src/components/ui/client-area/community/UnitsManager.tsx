'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PlusIcon, UploadIcon } from 'lucide-react';

import {
  createCommunityUnit,
  deleteCommunityUnit,
  importCommunityUnits,
  updateCommunityUnit,
} from '@/actions/client-portal/community-units-actions';
import { getUnitResidents } from '@/actions/client-portal/community-residents-actions';
import { HTTPStatus } from '@/constants/httpStatus';
import { notifyResponse } from '@/utils/toastUtils';

import Button from '@/components/ui/buttons/Button';
import Input from '@/components/ui/inputs/Input';
import ModalComponent from '@/components/ui/modals/ModalComponent';
import Select from '@/components/ui/inputs/Select';
import Toggle from '@/components/ui/inputs/Toggle';
import PeoplePeekModal from '@/components/ui/client-area/community/PeoplePeekModal';
import UnitsTable from '@/components/ui/client-area/community/UnitsTable';

import type {
  CommunityUnit,
  CommunityUnitType,
  PortalUnitImportRow,
} from '@/types/client-portal/community';
import type { FetchResponse, PaginatedResult } from '@/types/responses';

import '@/styles/04-components/ui/forms/form-row.scss';
import '@/styles/04-components/client-area/community-common.scss';

const UNIT_TYPES: CommunityUnitType[] = [
  'PORTAL',
  'VIVIENDA',
  'LOCAL',
  'GARAJE',
  'TRASTERO',
  'COMUN',
];

interface UnitFormState {
  code: string;
  block: string;
  floor: string;
  door: string;
  type: CommunityUnitType;
  isActive: boolean;
}

const EMPTY_FORM: UnitFormState = {
  code: '',
  block: '',
  floor: '',
  door: '',
  type: 'VIVIENDA',
  isActive: true,
};

/**
 * Parsea un CSV sencillo de unidades a las filas que espera la importación.
 * Se hace en el navegador (y no subiendo el fichero) porque el endpoint de
 * importación recibe JSON, no `multipart/form-data`: así el usuario además
 * puede revisar cuántas filas van a darse de alta antes de confirmar.
 * @param {string} content - Contenido del fichero CSV, con cabecera
 * @returns {{rows: PortalUnitImportRow[]; discarded: number}} Filas válidas y cuántas se descartaron por no tener código
 */
function parseUnitsCsv(content: string): { rows: PortalUnitImportRow[]; discarded: number } {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return { rows: [], discarded: 0 };

  const separator = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(separator).map((header) => header.trim().toLowerCase());

  const indexOf = (name: string) => headers.indexOf(name);
  const codeIndex = indexOf('code');
  const blockIndex = indexOf('block');
  const floorIndex = indexOf('floor');
  const doorIndex = indexOf('door');
  const typeIndex = indexOf('type');

  const rows: PortalUnitImportRow[] = [];
  let discarded = 0;

  for (const line of lines.slice(1)) {
    const cells = line.split(separator).map((cell) => cell.trim());
    const code = codeIndex >= 0 ? cells[codeIndex] : cells[0];

    if (!code) {
      discarded += 1;
      continue;
    }

    const rawType = typeIndex >= 0 ? cells[typeIndex]?.toUpperCase() : undefined;

    rows.push({
      code,
      block: blockIndex >= 0 ? cells[blockIndex] || undefined : undefined,
      floor: floorIndex >= 0 ? cells[floorIndex] || undefined : undefined,
      door: doorIndex >= 0 ? cells[doorIndex] || undefined : undefined,
      type: UNIT_TYPES.includes(rawType as CommunityUnitType)
        ? (rawType as CommunityUnitType)
        : undefined,
    });
  }

  return { rows, discarded };
}

interface UnitsManagerProps {
  serviceId: string;
  units: PaginatedResult<CommunityUnit>;
}

/**
 * Alta, edición, baja e importación CSV de las unidades del edificio.
 * @param {UnitsManagerProps} props - Comunidad activa y página actual de unidades ya cargada en servidor
 * @returns {JSX.Element} El listado de unidades con sus acciones
 */
export default function UnitsManager({ serviceId, units }: UnitsManagerProps) {
  const t = useTranslations('Views.ClientArea.Communities');

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<CommunityUnit | null>(null);
  const [deleting, setDeleting] = useState<CommunityUnit | null>(null);
  const [form, setForm] = useState<UnitFormState>(EMPTY_FORM);

  /** Unidad cuya lista de vecinos se está mirando (el ojo de la tabla). */
  const [peekedUnit, setPeekedUnit] = useState<CommunityUnit | null>(null);

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<PortalUnitImportRow[]>([]);
  const [discardedRows, setDiscardedRows] = useState(0);

  const run = (action: () => Promise<FetchResponse<unknown>>, onDone?: () => void) => {
    startTransition(async () => {
      const response = await action();
      notifyResponse(response, t('loadError'));

      if (
        response.status === HTTPStatus.OK ||
        response.status === HTTPStatus.CREATED ||
        response.status === HTTPStatus.NO_CONTENT
      ) {
        onDone?.();
        router.refresh();
      }
    });
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (unit: CommunityUnit) => {
    setEditing(unit);
    setForm({
      code: unit.code,
      block: unit.block ?? '',
      floor: unit.floor ?? '',
      door: unit.door ?? '',
      type: unit.type,
      isActive: unit.isActive,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = () => {
    const payload = {
      code: form.code,
      block: form.block || undefined,
      floor: form.floor || undefined,
      door: form.door || undefined,
      type: form.type,
      isActive: form.isActive,
    };

    run(
      () =>
        editing
          ? updateCommunityUnit(serviceId, editing.id, payload)
          : createCommunityUnit(serviceId, payload),
      closeForm,
    );
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    const { rows, discarded } = parseUnitsCsv(await file.text());
    setImportRows(rows);
    setDiscardedRows(discarded);
  };

  const closeImport = () => {
    setIsImportOpen(false);
    setImportRows([]);
    setDiscardedRows(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <div className="community-toolbar">
        <div />
        <div className="community-toolbar__actions">
          <Button title="import" variant="outline" onClick={() => setIsImportOpen(true)}>
            <UploadIcon />
          </Button>
          <Button title="create" variant="primary" onClick={openCreate}>
            <PlusIcon />
          </Button>
        </div>
      </div>

      <UnitsTable
        data={units}
        isActionPending={isPending}
        onEdit={openEdit}
        onDelete={setDeleting}
        onViewResidents={setPeekedUnit}
      />

      {/*
        `key` con el id de la unidad: el modal carga una sola vez al montarse, así que mirar otra unidad
        tiene que darle una identidad nueva para que vuelva a pedir la lista.
      */}
      {peekedUnit && (
        <PeoplePeekModal
          key={peekedUnit.id}
          title={t('Units.residentsTitle')}
          subtitle={peekedUnit.code}
          emptyMessage={t('Units.residentsEmpty')}
          onClose={() => setPeekedUnit(null)}
          load={async () => {
            const response = await getUnitResidents(serviceId, peekedUnit.id);

            return {
              status: response.status,
              message: response.message,
              data: response.data?.map((resident) => ({
                id: resident.membershipId,
                // Quien no ha aceptado la invitación todavía no tiene nombre: el correo lo identifica igual.
                name: resident.name ?? resident.email,
                detail: resident.name ? resident.email : undefined,
                badgeText: t(`ResidentRole.${resident.role}`),
                badgeVariant: 'info' as const,
              })),
            };
          }}
        />
      )}

      {isFormOpen && (
        <ModalComponent
          title={editing ? t('Units.editTitle') : t('Units.createTitle')}
          isOpen
          isLarge
          isLoading={isPending}
          onClose={closeForm}
          onCancel={closeForm}
          onConfirm={handleSubmit}
          confirmText="save"
          isLoadingText="saving"
          confirmDisabled={!form.code.trim()}
        >
          <div className="community-form">
            <Input
              id="unit-code"
              name="code"
              label={t('Units.codeLabel')}
              noTranslate
              className="input__full"
              value={form.code}
              maxLength={50}
              placeholder={t('Units.codePlaceholder')}
              onChange={(event) => setForm({ ...form, code: event.target.value })}
            />

            <div className="form-row form-row--cols-4">
              <Select
                name="type"
                label={t('Units.typeLabel')}
                noTranslate
                className="select__full"
                value={form.type}
                onChange={(value) =>
                  setForm({ ...form, type: value as CommunityUnitType })
                }
                options={UNIT_TYPES.map((type) => ({
                  value: type,
                  label: t(`UnitType.${type}`),
                }))}
              />

              <Input
                id="unit-block"
                name="block"
                label={t('Units.blockLabel')}
                noTranslate
                className="input__full"
                value={form.block}
                maxLength={50}
                placeholder={t('Units.blockPlaceholder')}
                onChange={(event) => setForm({ ...form, block: event.target.value })}
              />

              <Input
                id="unit-floor"
                name="floor"
                label={t('Units.floorLabel')}
                noTranslate
                className="input__full"
                value={form.floor}
                maxLength={20}
                placeholder={t('Units.floorPlaceholder')}
                onChange={(event) => setForm({ ...form, floor: event.target.value })}
              />

              <Input
                id="unit-door"
                name="door"
                label={t('Units.doorLabel')}
                noTranslate
                className="input__full"
                value={form.door}
                maxLength={20}
                placeholder={t('Units.doorPlaceholder')}
                onChange={(event) => setForm({ ...form, door: event.target.value })}
              />
            </div>

            <Toggle
              name="isActive"
              label={t('Units.activeLabel')}
              description={t('Units.activeHelp')}
              checked={form.isActive}
              onChange={(checked) => setForm({ ...form, isActive: checked })}
            />
          </div>
        </ModalComponent>
      )}

      {deleting && (
        <ModalComponent
          title={t('Units.deleteTitle')}
          isOpen
          isLoading={isPending}
          onClose={() => setDeleting(null)}
          onCancel={() => setDeleting(null)}
          onConfirm={() =>
            run(() => deleteCommunityUnit(serviceId, deleting.id), () => setDeleting(null))
          }
          confirmVariant="danger"
          confirmText="delete"
          isLoadingText="deleting"
        >
          <p>{t('Units.deleteDescription')}</p>
        </ModalComponent>
      )}

      {isImportOpen && (
        <ModalComponent
          title={t('Units.importTitle')}
          isOpen
          isLoading={isPending}
          onClose={closeImport}
          onCancel={closeImport}
          onConfirm={() =>
            run(() => importCommunityUnits(serviceId, importRows), closeImport)
          }
          confirmText="import"
          isLoadingText="importing"
          confirmDisabled={importRows.length === 0}
        >
          <div className="community-form">
            <p>{t('Units.importDescription')}</p>

            <div className="community-form__field">
              <label className="community-form__label" htmlFor="unit-csv">
                {t('Units.importFileLabel')}
              </label>
              <span className="community-form__help">{t('Units.importFileHelp')}</span>
              <input
                id="unit-csv"
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="community-form__input"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
            </div>

            {importRows.length > 0 ? (
              <p>{t('Units.importPreview', { count: importRows.length })}</p>
            ) : (
              <p className="community-form__help">{t('Units.importEmpty')}</p>
            )}

            {discardedRows > 0 && (
              <p className="community-form__error">
                {t('Units.importInvalidRows', { count: discardedRows })}
              </p>
            )}
          </div>
        </ModalComponent>
      )}
    </>
  );
}
