import React from 'react';
import styles from './viewCounter.module.css';
import { FaSpinner } from 'react-icons/fa';
import { RxCross2 } from 'react-icons/rx';
import { useRouter } from 'next/router';
import { BsBook, BsEye } from 'react-icons/bs';
import { clx } from '@/helpers';

type StarCounterProps = {
    all?: boolean;
};

type Props = StarCounterProps & {
    children?: React.ReactNode;
};

const Container = ({ children, all }: Props) => {
    return (
        <div
            className={clx(styles.views, all ? styles.all : '')}
            title={all ? 'Total views' : 'Number of views in this post from GA'}
        >
            {all ? <BsEye /> : <BsBook />}
            {children}
        </div>
    );
};

const ViewCounter = ({ all }: StarCounterProps) => {
    const [views, setViews] = React.useState(-1);
    const { asPath } = useRouter();

    React.useEffect(() => {
        (async () => {
            try {
                if (!all) setViews(-1);
                const { total } = await fetch(`/api/analytics?slug=${all ? '' : asPath}`).then((res) => res.json());
                setViews(total);
            } catch (e) {
                setViews(-2);
            }
        })();
    }, [all, asPath]);

    if (views === -2)
        return (
            <Container>
                <RxCross2 className={styles.error} title="Error on endpoint" />
            </Container>
        );

    if (views === -1)
        return (
            <Container>
                <FaSpinner className={styles.spinner} title="Loading views" />
            </Container>
        );

    return (
        <Container all={all}>
            <span>{views}</span>
        </Container>
    );
};

export default ViewCounter;
