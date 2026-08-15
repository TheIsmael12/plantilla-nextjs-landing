import PropertyManagersHero from '@/components/ui/property-managers/PropertyManagersHero';
import PropertyManagersServices from '@/components/ui/property-managers/PropertyManagersServices';
import PropertyManagersBenefits from '@/components/ui/property-managers/PropertyManagersBenefits';
import PropertyManagersFaq from '@/components/ui/property-managers/PropertyManagersFaq';
import PropertyManagersCta from '@/components/ui/property-managers/PropertyManagersCta';

/**
 * Landing dirigida a administradores de fincas (requisitos-seo.md §6): hero con la propuesta
 * de "un solo proveedor para toda tu cartera", los 6 servicios que puede concentrar en Imora
 * (`PropertyManagersServices`), los beneficios de hacerlo frente a coordinar varios
 * proveedores por comunidad, un FAQ propio del segmento (`PropertyManagersFaq`, dudas de
 * facturación por cartera y gestión multi-finca que no son las de un presidente de comunidad
 * individual) y cierre con llamada a la acción propia del segmento.
 *
 * Segmento separado de "Sobre nosotros" a propósito: un administrador de fincas busca algo
 * distinto de un presidente de comunidad (gestionar varias fincas a la vez, reducir el número
 * de proveedores con los que coordina, no solo "conocer la empresa"), así que necesita su
 * propia intención de búsqueda y su propia página, no un párrafo dentro de otra.
 * @returns {JSX.Element} La página renderizada
 */
export default function PropertyManagersViewPage() {
  return (
    <main className="about">
      <PropertyManagersHero />
      <PropertyManagersServices />
      <PropertyManagersBenefits />
      <PropertyManagersFaq />
      <PropertyManagersCta />
    </main>
  );
}
