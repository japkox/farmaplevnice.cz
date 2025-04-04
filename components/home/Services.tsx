import { Sprout, Tractor, ShoppingBasket } from 'lucide-react';

const services = [
  {
    icon: Sprout,
    title: 'Rostlinná výroba',
    description: 'Specializujeme se na pěstování obilovin, olejnin a dalších plodin s důrazem na udržitelné zemědělské postupy a vysokou kvalitu produkce.'
  },
  {
    icon: Tractor,
    title: 'Zemědělské služby',
    description: 'Poskytujeme komplexní zemědělské služby včetně orby, setí, sklizně a přepravy. Využíváme moderní techniku a postupy pro maximální efektivitu.'
  },
  {
    icon: ShoppingBasket,
    title: 'Prodej zemědělských produktů',
    description: 'Nabízíme k prodeji obilí, brambory a senážní i slámové balíky z vlastní produkce. Vše pěstujeme s důrazem na kvalitu, udržitelnost a poctivý přístup k zemědělství.'
  }
];

export function Services() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Naše služby</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <service.icon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-center text-gray-900 mb-4">{service.title}</h3>
              <p className="text-gray-700 text-center">{service.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <a href="/contact" className="inline-block bg-green-700 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors">
          Kontaktujte nás
        </a>
      </div>
    </div>
  );
}