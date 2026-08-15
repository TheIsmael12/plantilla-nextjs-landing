import ExpansionMapSection from '@/components/ui/home/ExpansionMapSection';
import FeatureMosaicSection from '@/components/ui/home/FeatureMosaicSection';
import FutureVideoSection from '@/components/ui/home/FutureVideoSection';
import HeroNativeAds from '@/components/ui/home/HeroNativeAds';
import HomeCtaPrimary from '@/components/ui/home/HomeCtaPrimary';
import ServicesCarouselSectionLazy from '@/components/ui/home/ServicesCarouselSectionLazy';
import WhoWeHelpSection from '@/components/ui/home/WhoWeHelpSection';
import ReviewsSectionLazy from '@/components/ui/home/ReviewsSectionLazy';
import TrustBarSection from '@/components/ui/home/TrustBarSection';

/**
 * Página de inicio: hero, cinta de confianza, cobertura, vídeo, servicios, a quién ayudamos
 * ({@link WhoWeHelpSection}), mosaico de ventajas, reseñas de clientes y la llamada a la acción
 * de cierre ({@link HomeCtaPrimary}), en ese orden para llevar de la promesa a la prueba social
 * y terminar siempre en la conversión.
 * @returns {JSX.Element} La página de inicio renderizada
 */
export default function HomeViewPage() {
  return (
    <main className="home">
      <HeroNativeAds />
      <TrustBarSection />
      <ExpansionMapSection />
      <FutureVideoSection />
      <ServicesCarouselSectionLazy />
      <WhoWeHelpSection />
      <FeatureMosaicSection />
      <ReviewsSectionLazy />
      <HomeCtaPrimary />
    </main>
  );
}
