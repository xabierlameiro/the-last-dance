import { CgLayoutGridSmall } from 'react-icons/cg';
import styles from './grid.module.css';

type Props = {
    routeName?: string;
};

/**
 * @example
 *     <GridLayoutControl routeName="System Preferences" />;
 *
 * @param {string} routeName - The name of the route
 * @returns {JSX.Element}
 */
const GridLayoutControl = ({ routeName = 'System Preferences' }: Props) => {
    return (
        <div data-testid="grid-layout-control" className={styles.container}>
            <CgLayoutGridSmall className={styles.layoutIcon} />
            <h1 className={styles.title}>{routeName}</h1>
        </div>
    );
};

export default GridLayoutControl;
