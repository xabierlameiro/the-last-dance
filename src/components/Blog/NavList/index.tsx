import styles from './navlist.module.css';
import { BsTag, BsFolder2 } from 'react-icons/bs';
import Link from 'next/link';

const NavList = ({ title, list, category, isCategory }: any) => {
    return (
        <>
            <h2 className={styles.navTitle}>{title}</h2>
            <ul className={styles.postList}>
                {list.map((item: any, index: number) => (
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
                            <div className={styles.tag}>
                                {isCategory ? item.category : item.tag}
                            </div>
                            <div className={styles.number}>{item.total}</div>
                        </Link>
                    </li>
                ))}
            </ul>
        </>
    );
};

export default NavList;
