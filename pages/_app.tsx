import '../styles/ch-styles.css';
import '../styles/globals.css';
import '@xabierlameiro/code-hike/dist/index.css';
import { Analytics } from '@vercel/analytics/react';
import { DialogProvider } from '@/context/dialog';
import { IntlProvider } from 'react-intl';
import { useRouter } from 'next/router';
import { messages } from '../src/intl/translations';
import type { AppProps } from 'next/app';

type locales = 'en' | 'es' | 'gl';

export default function App({ Component, pageProps }: AppProps) {
    const { locale = 'en' } = useRouter();
    return (
        <IntlProvider locale={locale} messages={messages[locale as locales]}>
            <DialogProvider>
                <Component {...pageProps} />
                <Analytics />
            </DialogProvider>
        </IntlProvider>
    );
}
