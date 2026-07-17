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

    const isCategoryList = Array.isArray(isCategory) ? Boolean(isCategory[0]) : Boolean(isCategory);
    // `category` carries the currently active value(s): the route category for the category list,
    // or the post's own tags (an array) for the tag list — both highlight via membership.
    const selectedValues = (Array.isArray(category) ? category : [category])
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.toLowerCase());

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
                        const compareValue = (isCategoryList ? item.category : item.tag).toLowerCase();
                        const isSelected = selectedValues.includes(compareValue);
                        return (
                            <li key={index}>
                                <Link
                                    href={item.href}
                                    title={isCategoryList ? item.category : item.tag}
                                    className={isSelected ? styles.selected : ''}
                                >
                                    {isCategoryList ? <BsFolder2 /> : <BsTag />}
                                    <div className={styles.tag}>{isCategoryList ? item.category : item.tag}</div>
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
