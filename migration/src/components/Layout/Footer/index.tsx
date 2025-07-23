import styles from './footer.module.css';
import Dock from '@/components/Dock';

const Footer = () => {
    return (
        <footer data-testid="footer" className={styles.footer}>
            <Dock data-testid="nav" />
        </footer>
    );
};

export default Footer;
