import styles from './navlist.module.css';
import { BsTag, BsFolder2 } from 'react-icons/bs';
import Link from 'next/link';

type Props = {
    title: string;
    list?: {
        category: string;
        total: number;
        href: string;
        tag: string;
    }[];
    category?: string | string[];
    isCategory?: boolean | boolean[];
};

/**
 * @example
 *     <NavList title="Categories" list={categories} category={category} isCategory={true} />;
 *
 * @param {string} title - The title of the list
 * @param {object[]} list - The list of items
 * @param {string} category - The category has other styles
 * @param {boolean} isCategory - If is category the icon will be a folder
 * @returns {JSX.Element}
 */
const NavList = ({ title, list, category, isCategory }: Props) => {
    if (!list) return null;

    if (category && typeof category == 'object') category = category[0];
    if (isCategory && typeof isCategory == 'object') isCategory = isCategory[0];

    return (
        <>
            <h2 className={styles.navTitle}>{title}</h2>
            <ul className={styles.postList} data-testid="nav-list">
                {list.map(
                    (
                        item: {
                            category: string;
                            total: number;
                            href: string;
                            tag: string;
                        },
                        index: number
                    ) => {
                        // Validar que href existe antes de renderizar el Link
                        if (!item.href) {
                            console.warn('NavList: item without href', item);
                            return null;
                        }
                        
                        // Calcular className para evitar ternarios anidados
                        const isSelected = (isCategory && category == item.category.toLowerCase()) || 
                                         (!isCategory && category == item.tag.toLowerCase());
                        const itemClassName = isSelected ? styles.selected : '';
                        
                        return (
                            <li key={item.href || `${isCategory ? item.category : item.tag}-${index}`}>
                                <Link
                                    href={item.href}
                                    title={isCategory ? item.category : item.tag}
                                    className={itemClassName}
                                >
                                    {isCategory ? <BsFolder2 /> : <BsTag />}
                                    <div className={styles.tag}>{isCategory ? item.category : item.tag}</div>
                                    <div className={styles.number}>{item.total}</div>
                                </Link>
                            </li>
                        );
                    }
                )}
            </ul>
        </>
    );
};

export default NavList;
