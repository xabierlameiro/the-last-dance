import { clx } from '@/helpers';
import styles from './adsense.module.css';

type Props = {
    client?: string;
    slot: string;
    horizontal?: boolean;
};

const GoogleAdsense = ({ client = 'ca-pub-3537017956623483', slot, horizontal }: Props) => {
    return (
        <ins
            className={clx('adsbygoogle', horizontal ? styles.horizontal : styles.block)}
            data-ad-client={client}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
        />
    );
};

export default GoogleAdsense;
