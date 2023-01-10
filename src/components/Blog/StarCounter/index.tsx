import React from 'react';
import styles from './starCounter.module.css';
import { AiOutlineStar, AiFillStar } from 'react-icons/ai';
import { FaSpinner } from 'react-icons/fa';
import { RxCross2 } from 'react-icons/rx';

type Props = {
    children?: React.ReactNode;
    hasStar?: boolean;
    setRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
};

const Container = ({ children, hasStar, setRefresh }: Props) => {
    const starHandler = async () => {
        try {
            if (hasStar) {
                await fetch('/api/github', { method: 'DELETE' });
            } else {
                await fetch('/api/github', { method: 'POST' });
            }
        } catch (e) {
            console.log(e);
        }
        setRefresh?.((value: boolean) => !value);
    };

    return (
        <div className={styles.stars}>
            {hasStar ? (
                <AiFillStar onClick={starHandler} className={styles.starred} title="Starred" />
            ) : (
                <AiOutlineStar onClick={starHandler} title="Stars from github" />
            )}
            {children}
        </div>
    );
};

const StarCounter = () => {
    const [stars, setStars] = React.useState(0);
    const [hasStar, setHasStar] = React.useState(false);
    const [refresh, setRefresh] = React.useState(false);

    React.useEffect(() => {
        (async () => {
            try {
                const stars = await fetch('/api/github').then((res) => res.json());
                setStars(stars);
                const hadStar = await fetch('/api/github?starred=true').then((res) => res.json());
                setHasStar(hadStar);
            } catch (e) {
                setStars(-1);
            }
        })();
    }, [refresh]);

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
        <Container hasStar={hasStar} setRefresh={setRefresh}>
            <span>{stars}</span>
        </Container>
    );
};

export default StarCounter;
