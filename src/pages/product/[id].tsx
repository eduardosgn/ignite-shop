import { stripe } from '@/lib/stripe';
import {
    ImageContainer,
    ProductContainer,
    ProductDetails,
} from '@/styles/pages/product';
import { GetStaticPaths, GetStaticProps } from 'next';
import Stripe from 'stripe';
import Image from 'next/image';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useState } from 'react';
import Head from 'next/head';

interface ProductProps {
    product: {
        id: string;
        name: string;
        imageUrl: string;
        price: string;
        description: string;
        defaultPriceId: string;
    };
}

export default function Product({ product }: ProductProps) {
    const { isFallback } = useRouter();

    const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] =
        useState(false);

    async function handleBuyProduct() {
        try {
            setIsCreatingCheckoutSession(true);

            const res = await axios.post('/api/checkout', {
                priceId: product.defaultPriceId,
            });

            const { checkoutUrl } = res.data;

            // enviando para um local externo
            window.location.href = checkoutUrl;
        } catch (err) {
            // Conectar com uma ferramenta de observabilidade (Datadog / Sentry)

            setIsCreatingCheckoutSession(false);

            alert('Falha ao redirecionar ao checkout');
        }
    }

    if (isFallback) {
        return (
            <ProductContainer>
                <h1>Loading...</h1>
            </ProductContainer>
        );
    }

    return (
        <>
            <Head>
                <title>{product.name} | Ignite Shop</title>
            </Head>

            <ProductContainer>
                <ImageContainer>
                    <Image
                        src={product.imageUrl}
                        alt=""
                        width={520}
                        height={480}
                    />
                </ImageContainer>
                <ProductDetails>
                    <h1>{product.name}</h1>
                    <span>{product.price}</span>

                    <p>{product.description}</p>

                    <button
                        disabled={isCreatingCheckoutSession}
                        onClick={handleBuyProduct}
                    >
                        Comprar agora
                    </button>
                </ProductDetails>
            </ProductContainer>
        </>
    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [
            { params: { id: 'prod_Noxn8VyZq2Ag86' } },
            { params: { id: 'prod_NoxmLcJloYmOaW' } },
            { params: { id: 'prod_NoxmLpK1pgDCzm' } },
            { params: { id: 'prod_Noxl9vdHb8YZsI' } },
        ],
        fallback: true,
    };
};

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({
    params,
}) => {
    const productId = params?.id!;

    const product = await stripe.products.retrieve(productId, {
        expand: ['default_price'],
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
                    currency: 'BRL',
                }).format(price.unit_amount ? price.unit_amount / 100 : 0),
                description: product.description,
                defaultPriceId: price.id,
            },
        },
        revalidate: 60 * 60 * 1, // 1 hora
    };
};
