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

    // New locals rather than reassigning the props: React Compiler treats props as immutable and
    // skips a component that writes to one.
    const selectedCategory = category && typeof category == 'object' ? category[0] : category;
    const isCategoryList = isCategory && typeof isCategory == 'object' ? isCategory[0] : isCategory;

    return (
        <>
            {/* SDD-L05: was <h2>. These two sidebar titles precede the article in DOM order, so
                every post outline read h2, h2, h1 — the post title reported as subordinate to the
                sidebar, and heading navigation landing here first. The surrounding <nav> carries an
                aria-label now, so the region is still reachable by landmark without these claiming
                to be document structure. */}
            <p className={styles.navTitle}>{title}</p>
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
                        const isSelected = isCategoryList
                            ? selectedCategory === item.category.toLowerCase()
                            : selectedCategory === item.tag.toLowerCase();
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
