import React from 'react';
import { TbCurrencyRipple } from 'react-icons/tb';
import { RxCross2 } from 'react-icons/rx';
import { FaSpinner } from 'react-icons/fa';
import styles from './crypto.module.css';
import { FormattedNumber } from 'react-intl';

type Props = {
    children?: React.ReactNode;
    title?: string;
};

/**
 * @example
 *     <Container title="XRP price">
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
            <TbCurrencyRipple className={styles.xrp} />
            <span>{children}</span>
        </div>
    );
};

/**
 * @example
 *     <CryptoPrice />;
 *
 * @returns {JSX.Element}
 */
const CryptoPrice = () => {
    const [xrp, setXRP] = React.useState<{ price: number; todaySummary: string; todayPorcentage: string } | -1 | 0>(0);

    React.useEffect(() => {
        (async () => {
            try {
                const xrp = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/xrp`).then((res) => res.json());
                setXRP(xrp);
            } catch (e) {
                setXRP(-1);
            }
        })();
    }, []);

    if (xrp === -1)
        return (
            <Container>
                <RxCross2 className={styles.error} title="Error endpoint" />
            </Container>
        );

    if (xrp === 0)
        return (
            <Container>
                <FaSpinner className={styles.spinner} title="Loading stars" />
            </Container>
        );

    return (
        <Container title={`The Ripple Coin price today is ${xrp.todaySummary} ${xrp.todayPorcentage}`}>
            <FormattedNumber
                value={!isNaN(xrp.price) ? xrp.price : 0}
                style="currency"
                currency="EUR"
                minimumFractionDigits={2}
                maximumFractionDigits={2}
            />
        </Container>
    );
};

export default CryptoPrice;
