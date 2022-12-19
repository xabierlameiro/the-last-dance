import '../styles/ch-styles.css';
import '../styles/globals.css';
import '@code-hike/mdx/dist/index.css';
import { Analytics } from '@vercel/analytics/react';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Component {...pageProps} />
            <Analytics />
        </>
    );
}
