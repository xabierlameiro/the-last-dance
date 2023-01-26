import React from 'react';
import styles from './viewCounter.module.css';
import { FaSpinner } from 'react-icons/fa';
import { RxCross2 } from 'react-icons/rx';
import { useRouter } from 'next/router';
import { BsBook, BsEye } from 'react-icons/bs';
import { FiUsers } from 'react-icons/fi';
import { clx } from '@/helpers';

type StarCounterProps = {
    all?: boolean;
};

type Props = StarCounterProps & {
    children?: React.ReactNode;
};

/**
 * @example
 *     <Container>
 *         <span> 1 </span>
 *     </Container>;
 *
 * @param {React.ReactNode} children
 * @param {boolean} all - If true, show different icon
 * @returns {JSX.Element}
 */
const Container = ({ children, all }: Props) => {
    return (
        <div className={clx(styles.views, all ? styles.all : '')}>
            {all ? <BsEye /> : <BsBook />}
            {children}
        </div>
    );
};

/**
 * @example
 *     <ViewCounter />;
 *     <ViewCounter all />;
 *
 * @param {boolean} all - If true, it will show the total views from GA
 * @returns {JSX.Element}
 */
const ViewCounter = ({ all }: StarCounterProps) => {
    const [views, setViews] = React.useState<
        | {
              pageViews: number;
              newUsers: number;
          }
        | -1
        | -2
    >(-1);
    const { asPath } = useRouter();

    React.useEffect(() => {
        (async () => {
            try {
                if (!all) setViews(-1);
                const data = await fetch(`/api/analytics?slug=${all ? '' : asPath}`).then((res) => res.json());

                setViews(data);
            } catch (e) {
                setViews(-2);
            }
        })();
    }, [all, asPath]);

    if (views === -2)
        return (
            <Container all={all}>
                <RxCross2 className={styles.error} title="Error on endpoint" />
            </Container>
        );

    if (views === -1)
        return (
            <Container all={all}>
                <FaSpinner className={styles.spinner} title="Loading views" />
            </Container>
        );

    return (
        <Container all={all}>
            <span title="Nº of page views">{views.pageViews}</span>
            {all && (
                <span className={styles.users} title="Nº of new users">
                    <FiUsers />
                    {views.newUsers}
                </span>
            )}
        </Container>
    );
};

export default ViewCounter;
