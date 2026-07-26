import Link from 'next/link';
import { useIntl } from 'react-intl';
import Dialog from '@/components/Dialog';
import ControlButtons from '@/components/ControlButtons';
import { useDialog } from '@/context/dialog';
import SEO from '@/components/SEO';
import styles from './error.module.css';

const Custom404 = () => {
    const { dispatch, open } = useDialog();
    const { formatMessage: f } = useIntl();
    const close = () => dispatch({ type: 'close' });

    return (
        <>
            <SEO
                meta={{
                    title: '404',
                    description: f({ id: 'error.404.message' }),
                    noindex: true,
                }}
            />
            {/* SDD-L05: this page rendered with no heading at all, so heading navigation found
                nothing and the document had no programmatic title. The window chrome is the visual
                title in this design, so the <h1> is visually hidden rather than bolted on. */}
            <h1 className="visuallyHidden">{f({ id: 'error.404.title' })}</h1>
            <Dialog
                modalMode
                withPadding
                header={<ControlButtons disabled onClickClose={close} onClickMinimise={close} />}
                open={open}
                body={
                    /* SDD-L08: was hardcoded English on a trilingual site, and offered no way out —
                       a visitor who landed here had the Dock and nothing else. The message now says
                       what happened; the link says what to do about it. */
                    <div className={styles.body}>
                        <p>{f({ id: 'error.404.message' })}</p>
                        <Link href="/" className={styles.home}>
                            {f({ id: 'error.home' })}
                        </Link>
                    </div>
                }
            />
        </>
    );
};

export default Custom404;
