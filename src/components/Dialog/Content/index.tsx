import styles from './content.module.css';
import Image from 'next/image';

const Content = () => {
    return (
        <>
            <div className={styles.content}>
                <section className={styles.userInfo}>
                    <Image
                        className={styles.avatar}
                        src="/avatar.png"
                        alt="hero"
                        width={71}
                        height={71}
                    />
                    <div className={styles.userDetails}>
                        <h2 className={styles.username}>
                            Xabier Lameiro Cardama
                        </h2>
                        <p className={styles.description}>ID of Apple</p>
                    </div>
                </section>
            </div>
            <section className={styles.confg}>
                <div className={styles.option}>
                    <Image
                        src="/language.jpeg"
                        alt="hero"
                        width={44}
                        height={42}
                    />
                    <p className={styles.optionText}>Language & Region</p>
                </div>
            </section>
        </>
    );
};
export default Content;
