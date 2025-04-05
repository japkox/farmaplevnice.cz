import '../styles/globals.css'
import type { AppProps } from "next/app"
import { AuthProvider } from "../context/AuthContext"
import { CartProvider } from "../context/CartContext"
import { Navigation } from '../components/Navigation'
import { Footer } from '../components/Footer'
import { Toaster } from 'react-hot-toast'
import { Head} from '../components/layout/Head'


export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <Head
                title="Farma Plevnice"
                description="Nakupujte kvalitní produkty z ekologického zemědělství z pohodlí domova."
        />
        <Navigation />
        <Component {...pageProps} />
        <Footer />
        <Toaster position="bottom-right" />
      </CartProvider>
    </AuthProvider>
  )
}
