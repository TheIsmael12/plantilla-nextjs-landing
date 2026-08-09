import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import BlogPostBody from './BlogPostBody';

const sampleBody = `Elegir una empresa de limpieza para tu comunidad no es solo cuestión de precio. Repasamos los criterios que de verdad marcan la diferencia.

## Por qué importa elegir bien

Un mal servicio de limpieza genera quejas constantes, rotación de personal y, a menudo, sobrecostes ocultos. Estos son los factores clave a evaluar:

- Personal propio frente a subcontratado
- Seguro de responsabilidad civil vigente
- Protocolos de calidad documentados
- Disponibilidad de sustituciones garantizadas

## Certificaciones a comprobar

Busca siempre proveedores certificados.

### ISO 9001 y 14001

Estas certificaciones acreditan la gestión de calidad y el respeto ambiental de los procesos de limpieza.

> Un proveedor sin certificaciones no es necesariamente malo, pero sí es una señal de alerta que conviene investigar más.

## Preguntas antes de firmar

1. ¿Qué ocurre si un conserje falta por baja?
2. ¿Cómo se gestionan las incidencias fuera de horario?
3. ¿El presupuesto es cerrado o puede variar?

Más información en [nuestra página de servicios](https://example.com/services).
`;

const meta = {
  title: 'Components/UI/Blog/BlogPostBody',
  component: BlogPostBody,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    body: sampleBody,
  },
} satisfies Meta<typeof BlogPostBody>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ShortBody: Story = {
  name: 'Cuerpo corto sin encabezados',
  args: {
    body: 'Un párrafo simple, sin encabezados ni listas, para comprobar que el espaciado no se rompe con contenido mínimo.',
  },
};
