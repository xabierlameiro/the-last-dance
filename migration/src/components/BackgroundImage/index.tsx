'use client'

import Image from 'next/image';
import styles from './backgroundImage.module.css';

/**
 * @example
 *     <BackgroundImage />;
 *
 * @returns {JSX.Element}
 */
const BackgroundImage = () => {
    return (
        <div className={styles.bgWrap}>
            <Image
                fill
                loading="eager"
                data-testid="background-image"
                sizes="100vw"
                quality={100}
                src="/background-image.jpeg"
                alt="This is the background image"
                style={{
                    objectFit: 'cover',
                }}
            />
        </div>
    );
};

export default BackgroundImage;
