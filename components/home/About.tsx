import aboutImage from '/public/about.jpg';
import Image from 'next/image';

export function About() {
  return (
    <div className="bg-green-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">O nás</h2>
            <p className="text-gray-700 mb-4">
              Farma Plevnice s.r.o. je rodinný podnik s dlouholetou tradicí v zemědělství. 
              Věnujeme se rostlinné výrobě, poskytování zemědělských služeb a chovu skotu.
            </p>
            <p className="text-gray-700 mb-6">
              Naším cílem je udržitelné hospodaření s důrazem na ochranu životního prostředí 
              a produkci kvalitních zemědělských produktů.
            </p>
          </div>
          <div className="flex justify-center">
            <Image
              src={aboutImage}
              alt="Farma"
              className="rounded-lg shadow-lg w-80 h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}