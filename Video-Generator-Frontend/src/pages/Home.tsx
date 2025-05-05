import { Navbar } from '../components/navbar';
import { HeroSection } from '../components/hero-section';
import { FeaturesSection } from '../components/features-section';
import { DemoSection } from '../components/demo-section';
import { CtaSection } from '../components/cta-section';
import { Footer } from '../components/footer';

export function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <DemoSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}