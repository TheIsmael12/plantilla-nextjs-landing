import PropertyManagersHero from '@/components/ui/property-managers/PropertyManagersHero';
import PropertyManagersMath from '@/components/ui/property-managers/PropertyManagersMath';
import PropertyManagersServices from '@/components/ui/property-managers/PropertyManagersServices';
import PropertyManagersBenefits from '@/components/ui/property-managers/PropertyManagersBenefits';
import PropertyManagersComparison from '@/components/ui/property-managers/PropertyManagersComparison';
import PropertyManagersExample from '@/components/ui/property-managers/PropertyManagersExample';
import PropertyManagersProcess from '@/components/ui/property-managers/PropertyManagersProcess';
import PropertyManagersFaq from '@/components/ui/property-managers/PropertyManagersFaq';
import PropertyManagersCta from '@/components/ui/property-managers/PropertyManagersCta';

/**
 * Landing dirigida a administradores de fincas (requisitos-seo.md §6): hero con la propuesta
 * de "un solo proveedor para toda tu cartera", los 6 servicios que puede concentrar en Imora
 * (`PropertyManagersServices`), los beneficios de hacerlo frente a coordinar varios
 * proveedores por comunidad, el ciclo completo de trabajar con Imora gestionando una cartera
 * (`PropertyManagersProcess`: alta de finca, incidencias, facturación por comunidad, cómo
 * escala), un FAQ propio del segmento (`PropertyManagersFaq`, dudas de facturación por cartera
 * y gestión multi-finca que no son las de un presidente de comunidad individual) y cierre con
 * llamada a la acción propia del segmento.
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
      {/*
        La cuenta va inmediatamente después del hero, antes de los servicios.
        El hero abre con la solución —«un solo proveedor»— y hasta ahora nada planteaba el problema que
        resuelve. Aquí es donde el administrador ve su propio número, y desde donde entra al resto de la
        página sabiendo qué está comparando.
      */}
      <PropertyManagersMath />
      <PropertyManagersServices />
      <PropertyManagersBenefits />
      <PropertyManagersComparison />
      <PropertyManagersExample />
      <PropertyManagersProcess />
      <PropertyManagersFaq />
      <PropertyManagersCta />
    </main>
  );
}
