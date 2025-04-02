import { Hero } from '../components/home/Hero';
import { Services } from '../components/home/Services';
import { About } from '../components/home/About';
import { Head } from '../components/layout/Head';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Head
        title="Farma Plevnice – Domácí produkty přímo od farmáře"
        description="Nakupujte kvalitní domácí produkty z ekologického zemědělství z pohodlí domova."
      />
      <main>
        <div className="relative">
          <Hero />
          <Services />
          <About />
        </div>
      </main>
    </div>
  );
}