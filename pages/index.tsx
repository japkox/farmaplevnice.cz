import { Hero } from '../components/home/Hero';
import { Services } from '../components/home/Services';
import { About } from '../components/home/About';

export default function Home() {
  return (
    <div className="min-h-screen">
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











