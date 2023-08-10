import { GetStaticProps } from "next";
import { stripe } from "@/lib/stripe";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import Stripe from "stripe";

import { HomeContainer, Product } from "@/styles/pages/home";
import { useKeenSlider } from "keen-slider/react";

import { ProductProps } from "@/context/CartContext"
import { useCart } from '@/hooks/useCart'
import { MouseEvent, useCallback } from 'react'
import { CartButton } from '@/components/CartButton'

import "keen-slider/keen-slider.min.css";

interface HomeProps {
  products: ProductProps[]
}

export default function Home({ products }: HomeProps) {
  const { addToCart, checkIfItemAlreadyExists } = useCart()

  const [sliderRef] = useKeenSlider({
    slides: {
      perView: 3,
      spacing: 48,
    }
  })
  const handleAddToCart = useCallback(
    (event: MouseEvent<HTMLButtonElement>, product: ProductProps) => {
      event.preventDefault()
      addToCart(product)
    },
    [addToCart],
  )

  return (
    <>
      <Head>
        <title>Home | Ignite Shop</title>
      </Head>

      <HomeContainer ref={sliderRef} className="keen-slider">
        {/* <pre>{JSON.stringify(products)}</pre> */}
        {products.map(product => {
          return(
            <Link
            key={product.id}
            href={`/product/${product.id}`}
            prefetch={false}
            passHref
          >
            <Product className="keen-slider__slide">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={520}
                height={480}
              />

              <footer>
                <strong>{product.name}</strong>
                <span>{product.price}</span>

                <CartButton
                    color="green"
                    // size="large"
                    type="button"
                    disabled={checkIfItemAlreadyExists(product.id)}
                    onClick={(evt) => handleAddToCart(evt, product)}
                  />

              </footer>

            </Product>
          </Link>
          )
        })}
      

      </HomeContainer>
    </>
   
  )
}


export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({
    expand: ['data.default_price'],
  })

  const products: Omit<ProductProps, 'description'>[] = response.data.map(
    (product) => {
      const price = product.default_price as Stripe.Price
      const unitAmount = (price.unit_amount ?? 0) / 100
      const hasFormattedPrice = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(unitAmount)

      return {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: hasFormattedPrice,
        numberPrice: unitAmount,
        defaultPriceId: price.id,
      }
    },
  )

  return {
    props: {
      products,
    } as HomeProps,
    revalidate: 60 * 60 * 2 
  }
}
