import { HomeContainer, Product } from '@/styles/pages/home';
import Image from 'next/image';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import { stripe } from '@/lib/stripe';
import { GetServerSideProps } from 'next';
import Stripe from 'stripe';

interface HomeProps {
    products: {
        id: string;
        name: string;
        imageUrl: string;
        price: number;
    }[];
}

export default function Home({ products }: HomeProps) {
    const [sliderRef] = useKeenSlider({
        slides: {
            perView: 2,
            spacing: 48,
        },
    });

    return (
        <HomeContainer ref={sliderRef} className="keen-slider">
            {products.map((product) => {
                return (
                    <Product key={product.id} className="keen-slider__slide">
                        <Image
                            src={product.imageUrl}
                            alt="Camiseta 01"
                            width={520}
                            height={480}
                            quality={100}
                            placeholder="blur"
                            blurDataURL={product.imageUrl}
                        />

                        <footer>
                            <strong>{product.name}</strong>
                            <span>{product.price}</span>
                        </footer>
                    </Product>
                );
            })}
        </HomeContainer>
    );
}

export const getServerSideProps: GetServerSideProps = async () => {
    const res = await stripe.products.list({
        expand: ['data.default_price'],
    });

    const products = res.data.map((product) => {
        const price = product.default_price as Stripe.Price;

        return {
            id: product.id,
            name: product.name,
            imageUrl: product.images[0],
            price: new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(price.unit_amount ? price.unit_amount / 100 : 0),
        };
    });

    return {
        props: {
            products,
        },
    };
};
