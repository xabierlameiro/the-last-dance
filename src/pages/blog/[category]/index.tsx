import { getLatestPostPath } from '@/helpers/fileReader';
import { getLang } from '@/helpers';

/**
 * @description Category hubs (/blog/nextjs, /blog/error, …) were the same white panel as /blog
 * and are gone for the same reason: the blog window's own sidebar is how you browse a category.
 * The URL stays as an entry point, landing on the newest post of that category in the active
 * locale — or on the newest post overall when the category holds none, so a stale inbound link
 * still arrives somewhere useful instead of 404ing. See src/pages/blog/index.tsx for the rest.
 */
const CategoryIndexRedirect = () => null;

export const getServerSideProps = async ({
    locale,
    params,
}: {
    locale: string;
    params: { category: string };
}) => {
    const path = getLatestPostPath(locale, params.category);

    if (!path) return { notFound: true as const };

    return {
        redirect: {
            // See src/pages/blog/index.tsx: the locale prefix is not added for us here, and the
            // redirect is temporary because the newest post changes with every publication.
            destination: `${getLang(locale)}${path}`,
            permanent: false,
        },
    };
};

export default CategoryIndexRedirect;
