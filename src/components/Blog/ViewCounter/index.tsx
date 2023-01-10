import React from 'react';
import styles from './viewCounter.module.css';
import { FaSpinner } from 'react-icons/fa';
import { RxCross2 } from 'react-icons/rx';
import { useRouter } from 'next/router';
import { AiOutlineEye } from 'react-icons/ai';

type Props = {
    children?: React.ReactNode;
};

const Container = ({ children }: Props) => {
    return (
        <div className={styles.stars}>
            <AiOutlineEye title="Number of views in this post" />
            {children}
        </div>
    );
};

const StarCounter = () => {
    const [views, setViews] = React.useState(0);
    const { asPath } = useRouter();

    React.useEffect(() => {
        (async () => {
            try {
                const { total } = await fetch(`/api/analytics?slug=${asPath}`).then((res) => res.json());
                setViews(total);
            } catch (e) {
                setViews(-1);
            }
        })();
    }, [asPath]);

    if (views === -1)
        return (
            <Container>
                <RxCross2 className={styles.error} title="Error on endpoint" />
            </Container>
        );

    if (views === 0)
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
