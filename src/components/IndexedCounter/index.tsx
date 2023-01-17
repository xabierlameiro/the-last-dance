import React from 'react';
import { GiCheckboxTree } from 'react-icons/gi';
import { RxCross2 } from 'react-icons/rx';
import { FaSpinner } from 'react-icons/fa';
import styles from './indexed.module.css';

type Props = {
    children?: React.ReactNode;
    title?: string;
};

/**
 * @example
 *     <Container title="Number of pages indexed">
 *         <span> 1 </span>
 *     </Container>;
 *
 * @param {React.ReactNode} children
 * @param {string} title
 * @returns {JSX.Element}
 */
const Container = ({ children, title }: Props) => {
    return (
        <div className={styles.container} title={title}>
            <GiCheckboxTree className={styles.xrp} />
            <span>{children}</span>
        </div>
    );
};

/**
 * @example
 *     <IndexedCounter />;
 *
 * @returns {JSX.Element}
 * @todo: Remove this component and refactor and unit with CryptoPrice, StartCounter and ViewCounter
 */
const IndexedCounter = () => {
    const [pages, setPages] = React.useState<number | -1 | 0>(0);

    React.useEffect(() => {
        (async () => {
            try {
                const { num } = await fetch('api/indexed').then((res) => res.json());
                setPages(num);
            } catch (e) {
                setPages(-1);
            }
        })();
    }, []);

    if (pages === -1)
        return (
            <Container>
                <RxCross2 className={styles.error} title="Error endpoint" />
            </Container>
        );

    if (pages === 0)
        return (
            <Container>
                <FaSpinner className={styles.spinner} title="Loading nº of pages" />
            </Container>
        );

    return <Container title="Number of pages indexed on Google.com">{pages}</Container>;
};

export default IndexedCounter;
