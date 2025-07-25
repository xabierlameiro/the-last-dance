import '../../styles/globals.css';
import '@code-hike/mdx/dist/index.css';
import Script from 'next/script';
import { IntlProvider } from 'react-intl';
import { useRouter } from 'next/router';
import { messages } from '../intl/translations';
import type { AppProps, NextWebVitalsMetric } from 'next/app';
import Notification from '@/components/Notification';
import Layout from '@/components/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';

type locales = 'en' | 'es' | 'gl';
declare global {
    interface Window {
        gtag: (event: string, name: string, obj: object) => void;
    }
}

export function reportWebVitals({ id, name, label, value }: NextWebVitalsMetric) {
    window.gtag?.('event', name, {
        event_category: label === 'web-vital' ? 'Web Vitals' : 'Next.js metric',
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        event_label: id,
        non_interaction: true,
    });
}

const App = ({ Component, pageProps }: AppProps) => {
    const { locale = 'en' } = useRouter();
    const isProduction = process.env.NEXT_PUBLIC_ENV === 'production';
    const hasNavigator = typeof navigator !== 'undefined';
    const isNotLighthouse = hasNavigator && !navigator?.userAgent.includes('Chrome-Lighthouse');

    const handleIntlError = (err: Error) => {
        // if Missing locale data for locale: "gl" in Intl.NumberFormat ignore it
        if (err.message.includes('Missing locale data for locale: "gl"')) {
            // Silently ignore this specific error
        }
    };

    return (
        <>
            {isProduction && isNotLighthouse && (
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
                onError={handleIntlError}
            >
                <ErrorBoundary>
                    <Notification
                        title="Cookies"
                        message="This website uses cookies to improve the user experience, more information on the legal information path."
                    />
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </ErrorBoundary>
            </IntlProvider>
        </>
    );
};

export default App;
