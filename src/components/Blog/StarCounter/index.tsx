import React from 'react';
import styles from './starCounter.module.css';
import { AiOutlineStar } from 'react-icons/ai';
import { FaSpinner } from 'react-icons/fa';
import { RxCross2 } from 'react-icons/rx';

type Props = {
    children?: React.ReactNode;
    dataTetsId: string;
};

/**
 * @example
 *     <Container>
 *         <span> 1 </span>
 *     </Container>;
 *
 * @param {React.ReactNode} children - The number of stars
 * @returns {JSX.Element}
 */
const Container = ({ children, dataTetsId }: Props) => {
    return (
        <a
            data-testid={dataTetsId}
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

/**
 * @example
 *     <StarCounter />;
 *
 * @returns {JSX.Element}
 */
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

    if (stars === -1)
        return (
            <Container dataTetsId="error">
                <RxCross2 className={styles.error} title="Error endpoint" />
            </Container>
        );

    if (stars === 0)
        return (
            <Container dataTetsId="loading">
                <FaSpinner className={styles.spinner} title="Loading stars" />
            </Container>
        );

    return (
        <Container dataTetsId="star-counter">
            <span>{stars}</span>
        </Container>
    );
};

export default StarCounter;
