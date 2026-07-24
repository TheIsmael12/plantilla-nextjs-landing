import AboutHero from '@/components/ui/about/AboutHero';
import AboutApproach from '@/components/ui/about/AboutApproach';
import AboutCertifications from '@/components/ui/about/AboutCertifications';
import AboutValues from '@/components/ui/about/AboutValues';
import AboutCta from '@/components/ui/about/AboutCta';

/**
 * Página "Sobre nosotros": hero, cómo trabajamos, certificaciones ISO,
 * ventajas de trabajar con Imora y la banda de cierre con zonas de
 * cobertura, datos de contacto y llamada a la acción.
 * @returns {JSX.Element} La página de About renderizada
 */
export default function AboutViewPage() {
  return (
    <main className="about">
      <AboutHero />
      <AboutApproach />
      <AboutCertifications />
      <AboutValues />
      <AboutCta />
    </main>
  );
}
