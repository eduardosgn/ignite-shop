import { stripe } from '@/lib/stripe';
import Head from 'next/head';
import { ImageContainer, SuccessContainer } from '@/styles/pages/success';
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Stripe from 'stripe';

interface SuccessProps {
    customerName: string;
    product: {
        name: string;
        imageUrl: string;
    };
}

function Success({ customerName, product }: SuccessProps) {
    const lowerCaseName = customerName.toLowerCase();
    const formattedCustomerName =
        lowerCaseName[0].toUpperCase() + lowerCaseName.slice(1);

    return (
        <>
            <Head>
                <title>Compra feita com sucesso! | Ignite Shop</title>
                <meta name="robots" content="noindex" />
            </Head>

            <SuccessContainer>
                <h1>Compra efetuada com sucesso!</h1>

                <ImageContainer>
                    <Image
                        src={product.imageUrl}
                        width={120}
                        height={110}
                        alt={product.name}
                    />
                </ImageContainer>

                <p>
                    Uhuul, <strong>{formattedCustomerName}</strong> sua{' '}
                    <strong>{product.name}</strong> já está a caminho da sua
                    casa.
                </p>

                <Link href="/"></Link>
            </SuccessContainer>
        </>
    );
}

export default Success;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    if (!query.sessionId) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    const sessionId = String(query.session_id);

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items', 'line_items.data.price.product'],
    });

    const customerName = session.customer_details?.name;
    const product = session.line_items?.data[0].price
        ?.product as Stripe.Product;

    return {
        props: {
            customerName,
            product: {
                name: product.name,
                imageUrl: product.images[0],
            },
        },
    };
};
