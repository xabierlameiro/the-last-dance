import styles from './dock.module.css';
import { iconUrls } from '@/constants/navMenu';
import Icon from '@/components/Dock/Icon';

const Dock = () => {
    return (
        <nav className={styles.dock}>
            <ul>
                {iconUrls.map((iconUrl, index) => (
                    <li key={index}>
                        <Icon src={iconUrl.url} alt={iconUrl.alt} />
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Dock;
