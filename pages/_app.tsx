import '../styles/globals.css'
import type { AppProps } from "next/app"
import { AuthProvider } from "../context/AuthContext"
import { CartProvider } from "../context/CartContext"
import { Navigation } from '../components/Navigation'
import { Footer } from '../components/Footer'
import { Toaster } from 'react-hot-toast'


export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <Navigation />
        <Component {...pageProps} />
        <Footer />
        <Toaster position="bottom-right" />
      </CartProvider>
    </AuthProvider>
  )
}
