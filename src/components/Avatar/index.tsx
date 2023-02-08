import styles from './avatar.module.css';
import Image from 'next/image';

type Props = {
    name: string;
    description: string;
    img: string;
    alt: string;
};

/**
 * @example
 *     <Avatar name="John Doe" description="Lorem ipsum" img="/images/avatar.jpg" alt="John Doe" />;
 *
 * @param {string} name - Name of the user
 * @param {string} description - Description of the user
 * @param {string} img - Image of the user
 * @param {string} alt - Alt text for the image
 * @returns {JSX.Element} - Avatar component
 */
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
