import '../styles/ch-styles.css';
import '../styles/globals.css';
import '@xabierlameiro/code-hike/dist/index.css';
import { DialogProvider } from '@/context/dialog';
import { Analytics } from '@vercel/analytics/react';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <DialogProvider>
            <Component {...pageProps} />
            <Analytics />
        </DialogProvider>
    );
}
