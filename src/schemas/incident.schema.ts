import * as Yup from 'yup';

// Mensajes como claves de `Validations` (no texto ya traducido): `Input`,
// `Textarea` y `Select` los resuelven internamente contra ese namespace.
//
// Los límites replican los del `PortalCreateIncidentDto` del backend
// (1-255 el título, 1-5000 la descripción) para que un envío que la API
// rechazaría con 400 no llegue a salir del navegador.
export const createIncidentSchema = () =>
  Yup.object({
    title: Yup.string()
      .trim()
      .max(255, 'incident.titleMaxLength')
      .required('incident.titleRequired'),

    description: Yup.string()
      .trim()
      .max(5000, 'incident.descriptionMaxLength')
      .required('incident.descriptionRequired'),

    type: Yup.string().required('incident.typeRequired'),

    priority: Yup.string(),

    clientServiceId: Yup.string(),
  });

export const createIncidentCommentSchema = () =>
  Yup.object({
    body: Yup.string()
      .trim()
      .max(5000, 'incident.commentMaxLength')
      .required('incident.commentRequired'),
  });
