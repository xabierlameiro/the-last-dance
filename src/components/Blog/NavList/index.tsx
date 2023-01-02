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
                        return (
                            <li key={index}>
                                <Link
                                    href={item.href}
                                    className={
                                        isCategory
                                            ? category == item.category.toLowerCase()
                                                ? styles.selected
                                                : ''
                                            : category == item.tag.toLowerCase()
                                            ? styles.selected
                                            : ''
                                    }
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
