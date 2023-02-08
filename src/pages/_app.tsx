import React from 'react';
import '../../styles/globals.css';
import '@xabierlameiro/code-hike/dist/index.css';
import Script from 'next/script';
import { IntlProvider } from 'react-intl';
import { useRouter } from 'next/router';
import { messages } from '../intl/translations';
import type { AppProps } from 'next/app';
import Notification from '@/components/Notification';
import Layout from '@/components/Layout';

type locales = 'en' | 'es' | 'gl';

const App = ({ Component, pageProps }: AppProps) => {
    const { locale = 'en' } = useRouter();

    return (
        <>
            {process.env.NODE_ENV === 'production' && (
                <>
                    <Script
                        defer
                        id="gtag-manager"
                        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA}`}
                        strategy="afterInteractive"
                    />

                    <Script id="ga-script" strategy="afterInteractive">
                        {`
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${process.env.NEXT_PUBLIC_GA}');    
                        
                        `}
                    </Script>
                </>
            )}

            <IntlProvider
                locale={locale}
                messages={messages[locale as locales]}
                onError={(err) => {
                    // if  Missing locale data for locale: "gl" in Intl.NumberFormat ignore it
                    if (err.message.includes('Missing locale data for locale: "gl"')) {
                        return;
                    }
                }}
            >
                <Notification
                    title="Cookies"
                    message="This website uses cookies to improve the user experience, more information on the legal information path."
                />
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </IntlProvider>
        </>
    );
};

export default App;
