import { globalStyles } from "@/styles/global"
import { AppProps } from "next/app"

import { Header } from "@/components";
import { Container } from "@/styles/pages/app";
import { CartContextProvider } from "@/context/CartContext";

globalStyles()

export default function App({ Component, pageProps }: AppProps) { 
  return (
    <CartContextProvider>
    <Container>
      <Header />
      <Component {...pageProps} />
    </Container>  
    </CartContextProvider>
  )
}

