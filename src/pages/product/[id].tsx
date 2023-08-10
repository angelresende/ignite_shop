import { GetStaticPaths, GetStaticProps } from "next"
import { useRouter } from 'next/router'
import Image from "next/image";
import Head from "next/head";

import Stripe from "stripe";
import { stripe } from "../../lib/stripe";

import { useCart } from "../../hooks/useCart"
import { ProductProps } from "../../context/CartContext"

import { ImageContainer, ProductContainer, ProductDetails } from "../../styles/pages/product"

interface IProducts {
  product: ProductProps
}

export default function Product({ product }: IProducts) {
  const { isFallback } = useRouter();
  const { addToCart, checkIfItemAlreadyExists } = useCart();

  if (isFallback) {
    return <p>Loading...</p>
  }

  const itemAlreadyInCart = checkIfItemAlreadyExists(product.id)
  const buttonText = itemAlreadyInCart
    ? 'Produto já adicionado ao carrinho'
    : 'Adicionar produto na sacola'

  return (
    <>
      <Head>
        <title>{product.name} | Ignite Shop</title>
      </Head>

      <ProductContainer>
        <ImageContainer>
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={520}
            height={480}
          />
        </ImageContainer>

        <ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.price}</span>
          <p>{product.description}</p>

          <button
            type="button"
            onClick={() => addToCart(product)}
            disabled={itemAlreadyInCart}
          >
            {buttonText}
          </button>
        </ProductDetails>
      </ProductContainer>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { id: 'prod_ONoL5SbCS6o2fQ' } },
    ],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }) => {
  const productId = params?.id || ''

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price']
  });

  const price = product.default_price as Stripe.Price;

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(price.unit_amount! / 100),
        description: product.description,
        defaultPriceId: price.id
      }
    } as IProducts,
    revalidate: 60 * 60 * 1 
  }
}