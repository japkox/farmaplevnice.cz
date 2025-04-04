import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-green-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Farma Plevnice s.r.o.</h3>
            <p className="text-green-200">
              IČO: 28098684<br />
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Odkazy</h3>
            <ul className="space-y-2">
              <li><Link href="/shop" className="text-green-200 hover:text-white">Obchod</Link></li>
              <li><Link href="/contact" className="text-green-200 hover:text-white">Kontakt</Link></li>
              <li><Link href="/gallery" className="text-green-200 hover:text-white">Galerie</Link></li>
              <li><Link href="/terms" className="text-green-200 hover:text-white">Obchodní podmínky</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontaktní údaje</h3>
            <ul className="space-y-2 text-green-200">
              <li>Plevnice 4</li>
              <li>393 01 Pelhřimov</li>
              <li>Tel: +420 731 460 298</li>
              <li>E-mail: farmaplevnice@seznam.cz</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-green-800 text-center text-green-200">
          <p>&copy; {new Date().getFullYear()} Farma Plevnice s.r.o. Všechna práva vyhrazena.</p>
        </div>
      </div>
    </footer>
  );
}