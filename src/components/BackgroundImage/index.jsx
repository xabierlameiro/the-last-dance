import Image from 'next/image';
import styles from './backgroundImage.module.css';
import backgroundImage from '../../../public/background-image.jpeg';

const BackgroundImage = () => (
    <div className={styles.bgWrap}>
        <Image
            alt="Mountains"
            src={backgroundImage}
            placeholder="blur"
            quality={100}
            fill
            sizes="100vw"
            style={{
                objectFit: 'cover',
            }}
        />
    </div>
);

export default BackgroundImage;
