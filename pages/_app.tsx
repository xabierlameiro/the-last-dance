import '../styles/globals.css';
import '@xabierlameiro/code-hike/dist/index.css';
import Script from 'next/script';
import { DialogProvider } from '@/context/dialog';
import { IntlProvider } from 'react-intl';
import { useRouter } from 'next/router';
import { messages } from '../src/intl/translations';
import type { AppProps } from 'next/app';

type locales = 'en' | 'es' | 'gl';

const App = ({ Component, pageProps }: AppProps) => {
    const { locale = 'en' } = useRouter();
    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA}`}
            />
            <Script id="ga-script" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${process.env.NEXT_PUBLIC_GA}');    
                  
                  `}
            </Script>

            <IntlProvider
                locale={locale}
                messages={messages[locale as locales]}
                defaultLocale="en"
                onError={(err) => {
                    // if  Missing locale data for locale: "gl" in Intl.NumberFormat ignore it
                    if (err.message.includes('Missing locale data for locale: "gl"')) {
                        return;
                    }
                }}
            >
                <DialogProvider>
                    <Component {...pageProps} />
                </DialogProvider>
            </IntlProvider>
        </>
    );
};

export default App;
