import blogLanding from '@/constants/blogLanding.json';
import { defaultLocale } from '@/constants/site';
import { getLang } from '@/helpers';

/**
 * @description Category hubs (/blog/nextjs, /blog/error, …) were the same white panel as /blog
 * and are gone for the same reason: the blog window's own sidebar is how you browse a category.
 * The URLs stay only to redirect. See src/pages/blog/index.tsx for why this is not in
 * next.config.js.
 */
const CategoryIndexRedirect = () => null;

// getServerSideProps rather than getStaticProps + getStaticPaths: Next rejects a redirect
// returned during prerendering, and there is nothing to prerender here anyway. Any category —
// including one that no longer exists — redirects instead of 404ing, which is friendlier for
// stale inbound links.
export const getServerSideProps = async ({ locale }: { locale: string }) => {
    const slug = blogLanding[locale as keyof typeof blogLanding] ?? blogLanding[defaultLocale];

    return {
        redirect: {
            // See src/pages/blog/index.tsx: the locale prefix is not added for us here.
            destination: `${getLang(locale)}${slug}`,
            permanent: true,
        },
    };
};

export default CategoryIndexRedirect;
