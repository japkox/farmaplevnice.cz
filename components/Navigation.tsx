import logo from '/public/logo_outline.png';
import Image from "next/image";
import {useState, useEffect} from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X, User, Package, Settings, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, signOut, supabase } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        setIsAdmin(!!data?.is_admin);
      } catch (err) {
        console.error('Chyba při získávání admin statusu:', err);
      }
    }

    checkAdminStatus();
  }, [user, supabase]);

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  return (
    <nav className="bg-green-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold" onClick={closeAllMenus}>
            <Image src={logo} alt="Logo" className="h-10 w-10" />
            Farma Plevnice
            </Link> </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="hover:bg-green-700 px-3 py-2 rounded-md">Domů</Link>
              <Link href="/gallery" className="hover:bg-green-700 px-3 py-2 rounded-md">Galerie</Link>
              <Link href="/contact" className="hover:bg-green-700 px-3 py-2 rounded-md">Kontakt</Link>
              <Link href="/shop" className="hover:bg-green-700 px-3 py-2 rounded-md">E-shop</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/cart" className="hover:bg-green-700 p-2 rounded-md" onClick={closeAllMenus}>
                  <ShoppingCart className="h-6 w-6" />
                </Link>
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(!isProfileMenuOpen);
                      setIsMenuOpen(false);
                    }}
                    className="hover:bg-green-700 p-2 rounded-md"
                  >
                    <User className="h-6 w-6" />
                  </button>
                  
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={closeAllMenus}
                      >
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Nastavení
                        </div>
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={closeAllMenus}
                      >
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Historie objednávek
                        </div>
                      </Link>
                      {isAdmin && (
                        <Link
                        href="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={closeAllMenus}
                        >
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Dashboard
                          </div>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          signOut();
                          closeAllMenus();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                            <LogOut className="h-4 w-4" />
                            Odhlásit se
                          </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/auth"
                className="hover:bg-green-700 px-3 py-2 rounded-md flex items-center gap-2"
                onClick={closeAllMenus}
              >
                <User className="h-5 w-5" />
                Přihlásit se
              </Link>
            )}
            <div className="md:hidden">
              <button
                onClick={() => {
                  setIsMenuOpen(!isMenuOpen);
                  setIsProfileMenuOpen(false);
                }}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-green-700 focus:outline-none"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-green-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/" className="block hover:bg-green-700 px-3 py-2 rounded-md"onClick={closeAllMenus}>Domů</Link>
            <Link href="/contact" className="block hover:bg-green-700 px-3 py-2 rounded-md"onClick={closeAllMenus}>Kontakt</Link>
            <Link href="/shop" className="block hover:bg-green-700 px-3 py-2 rounded-md" onClick={closeAllMenus}>E-shop</Link>
            <Link href="/gallery" className="block hover:bg-green-700 px-3 py-2 rounded-md"onClick={closeAllMenus}>Galerie</Link>
          </div>
        </div>
      )}
    </nav>
  );
}