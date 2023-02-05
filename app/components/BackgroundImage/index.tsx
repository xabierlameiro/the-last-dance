import Image from 'next/image';
import styles from './backgroundImage.module.css';
import backgroundImage from '../../../public/background-image.jpeg';
import { useIntl } from 'react-intl';

/**
 * @example
 *     <BackgroundImage />;
 *
 * @returns {JSX.Element}
 */
const BackgroundImage = () => {
    const { formatMessage: f } = useIntl();
    return (
        <div className={styles.bgWrap}>
            <Image
                fill
                loading="eager"
                data-testid="background-image"
                sizes="100vw"
                quality={100}
                placeholder="blur"
                src={backgroundImage}
                alt={f({ id: 'background.image.alt' })}
                style={{
                    objectFit: 'cover',
                }}
            />
        </div>
    );
};

export default BackgroundImage;
