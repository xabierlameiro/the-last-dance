import '../styles/ch-styles.css';
import '../styles/globals.css';
import '@xabierlameiro/code-hike/dist/index.css';
import { DialogProvider } from '@/context/dialog';
import type { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <DialogProvider>
            <Component {...pageProps} />
            <Analytics />
        </DialogProvider>
    );
}
