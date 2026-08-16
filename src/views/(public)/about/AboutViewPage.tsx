import AboutHero from '@/components/ui/about/AboutHero';
import AboutStory from '@/components/ui/about/AboutStory';
import AboutApproach from '@/components/ui/about/AboutApproach';
import AboutValues from '@/components/ui/about/AboutValues';
import AboutCta from '@/components/ui/about/AboutCta';

/**
 * Página "Sobre nosotros": hero, nuestra historia (`AboutStory`, por qué
 * nace Imora y quién está detrás — contenido confirmado por los fundadores,
 * no inventado), cómo trabajamos, ventajas de trabajar con Imora y la banda
 * de cierre con zonas de cobertura, datos de contacto y llamada a la
 * acción.
 *
 * Sin `AboutCertifications`: las ISO 9001/14001/45001/27001 que mostraba
 * eran placeholder, no reales (`requisitos-seo.md` §1) — quitada hasta que
 * la empresa las obtenga de verdad. El componente y sus traducciones
 * (`About.certifications`) se dejan sin borrar para reactivarlo entonces.
 * @returns {JSX.Element} La página de About renderizada
 */
export default function AboutViewPage() {
  return (
    <main className="about">
      <AboutHero />
      <AboutStory />
      <AboutApproach />
      <AboutValues />
      <AboutCta />
    </main>
  );
}
