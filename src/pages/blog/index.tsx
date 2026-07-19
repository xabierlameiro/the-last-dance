import blogLanding from '@/constants/blogLanding.json';
import { defaultLocale } from '@/constants/site';
import { getLang } from '@/helpers';

/**
 * @description /blog used to be a hub page listing every post inside a plain white panel — an
 * app the desktop does not have. The blog is the full-screen Notes window, so this URL only
 * survives to redirect the links and search results that already point at it.
 *
 * The redirect lives here rather than in next.config.js (which the docs otherwise prefer for
 * build-time redirects) because the landing slug is translated per locale. A locale-varying
 * destination forces `locale: false`, and that matcher never matches the default locale's
 * unprefixed `/blog`. Here the locale arrives from Next directly, so every language works.
 *
 * getServerSideProps, not getStaticProps: a static page is prerendered at build time, and Next
 * rejects a redirect returned during prerendering ("`redirect` can not be returned from
 * getStaticProps during prerendering"). Serving these two URLs from a function is a fair price
 * for redirect-only routes that carry no content.
 */
const BlogIndexRedirect = () => null;

export const getServerSideProps = async ({ locale }: { locale: string }) => {
    const slug = blogLanding[locale as keyof typeof blogLanding] ?? blogLanding[defaultLocale];

    return {
        redirect: {
            // The locale prefix has to be added by hand: unlike a next.config.js redirect, a
            // redirect returned from getServerSideProps is used verbatim. Without it /es/blog
            // would land on the English URL tree carrying a Spanish slug, which 404s.
            destination: `${getLang(locale)}${slug}`,
            permanent: true,
        },
    };
};

export default BlogIndexRedirect;
