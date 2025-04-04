export function Hero() {
  return (
    <div 
      className="h-[600px] bg-cover bg-center relative min-h-screen"
      style={{
        backgroundImage: `url(${'/hero.jpg'})`,
      }}
    >

      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
      <div className="relative h-full flex items-center justify-center text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Farma Plevnice s.r.o.
          </h1>
          <p className="text-xl text-white mb-8">
            Tradice, kvalita a udržitelné zemědělství
          </p>
          <a href="/shop" className="inline-block bg-green-700 text-white px-8 py-3 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors">
            Prohlédněte si naše produkty
          </a>
        </div>
      </div>
    </div>
  );
}