import styles from './avatar.module.css';
import Image from 'next/image';

type Props = {
    name: string;
    description: string;
    img: string;
    alt: string;
};

const Avatar = ({ name, description, img, alt }: Props) => {
    return (
        <section data-testid="avatar" className={styles.userInfo}>
            <Image className={styles.avatar} src={img} alt={alt} width={71} height={71} />
            <div className={styles.userDetails}>
                <h2 className={styles.username}>{name}</h2>
                <p className={styles.description}>{description}</p>
            </div>
        </section>
    );
};

export default Avatar;
