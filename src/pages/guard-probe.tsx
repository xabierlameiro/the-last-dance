import React from 'react';
import SEO from '@/components/SEO';

/**
 * A page that exists to be broken on purpose, once.
 *
 * The indexability guard has never proved itself against this site: every run
 * since it was deployed has found nothing wrong, which is good for the site and
 * useless as evidence. Its acceptance criterion is a deliberate `noindex` on a
 * route nobody minds, confirming that exactly one notification arrives naming
 * the commit that caused it — and that criterion has gone unmet since the
 * change was written.
 *
 * So this route ships indexable, gets watched, then gets a `noindex` in a
 * second commit. If the guard is real, it says so and names that commit.
 *
 * **Delete this page once the guard has spoken.** It carries no content, and a
 * page that exists only to be watched is worth exactly one experiment.
 */
const GuardProbe = () => (
    <>
        <SEO
            meta={{
                title: 'Guard probe',
                description:
                    'Temporary page used once to verify the indexability guard reports a deliberate regression.',
            }}
        />

        <main>
            <h1>Guard probe</h1>
            <p>
                This page exists to verify that the indexability guard notices when a deploy makes a page
                non-indexable. It has no other purpose and will be removed.
            </p>
        </main>
    </>
);

export default GuardProbe;
