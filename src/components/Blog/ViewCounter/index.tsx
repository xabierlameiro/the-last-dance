import React from 'react';
import styles from './viewCounter.module.css';
import { FaSpinner } from 'react-icons/fa';
import { RxCross2 } from 'react-icons/rx';
import { useRouter } from 'next/router';
import { BsBook } from 'react-icons/bs';

type Props = {
    children?: React.ReactNode;
};

const Container = ({ children }: Props) => {
    return (
        <div className={styles.views} title="Number of views in this post from GA">
            <BsBook />
            {children}
        </div>
    );
};

const StarCounter = () => {
    const [views, setViews] = React.useState(-1);
    const { asPath } = useRouter();

    React.useEffect(() => {
        (async () => {
            try {
                const { total } = await fetch(`/api/analytics?slug=${asPath}`).then((res) => res.json());
                setViews(total);
            } catch (e) {
                setViews(-2);
            }
        })();
    }, [asPath]);

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
        <Container>
            <span>{views}</span>
        </Container>
    );
};

export default StarCounter;
