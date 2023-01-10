import React from 'react';
import styles from './starCounter.module.css';
import { AiOutlineStar, AiFillStar } from 'react-icons/ai';
import { FaSpinner } from 'react-icons/fa';
import { RxCross2 } from 'react-icons/rx';

type Props = {
    children?: React.ReactNode;
};

const Container = ({ children }: Props) => {
    return (
        <a
            className={styles.stars}
            href="https://github.com/xabierlameiro/the-last-dance"
            title="Go to the repository to give my star"
            target="_blank"
            rel="noopener noreferrer"
        >
            <AiOutlineStar />
            {children}
        </a>
    );
};

const StarCounter = () => {
    const [stars, setStars] = React.useState(0);

    React.useEffect(() => {
        (async () => {
            try {
                const stars = await fetch('/api/github').then((res) => res.json());
                setStars(stars);
            } catch (e) {
                setStars(-1);
            }
        })();
    }, []);

    if (stars === -2)
        return (
            <Container>
                <AiFillStar className={styles.starred} title="Starred" />
            </Container>
        );

    if (stars === -1)
        return (
            <Container>
                <RxCross2 className={styles.error} title="Error endpoint" />
            </Container>
        );

    if (stars === 0)
        return (
            <Container>
                <FaSpinner className={styles.spinner} title="Loading stars" />
            </Container>
        );

    return (
        <Container>
            <span>{stars}</span>
        </Container>
    );
};

export default StarCounter;
