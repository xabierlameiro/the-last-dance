import { getLatestPostPath } from '@/helpers/fileReader';
import { getLang } from '@/helpers';

/**
 * @description /blog used to be a hub page listing every post inside a plain white panel — an
 * app the desktop does not have. The blog is the full-screen Notes window, so this URL survives
 * only as the blog's entry point: it redirects to the newest post in the active locale.
 *
 * That is also what the Dock links to. Pointing the Dock here instead of at a post means the
 * entry point follows publishing on its own, and `<Link href="/blog">` already carries the
 * current locale, so the visitor stays in their language.
 *
 * getServerSideProps, not getStaticProps: a static page is prerendered at build time, and Next
 * rejects a redirect returned during prerendering ("`redirect` can not be returned from
 * getStaticProps during prerendering"). It also keeps the target correct between deploys.
 */
const BlogIndexRedirect = () => null;

export const getServerSideProps = async ({ locale }: { locale: string }) => {
    const path = getLatestPostPath(locale);

    if (!path) return { notFound: true as const };

    return {
        redirect: {
            // The locale prefix has to be added by hand: unlike a next.config.js redirect, a
            // redirect returned from getServerSideProps is used verbatim. Without it /es/blog
            // would land on the English URL tree carrying a Spanish slug, which 404s.
            destination: `${getLang(locale)}${path}`,
            permanent: false,
        },
    };
};

export default BlogIndexRedirect;
