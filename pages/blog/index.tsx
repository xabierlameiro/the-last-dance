import Layout from '@/layout';
import Dialog from '@/components/Dialog';
import ControlButtons from '@/components/ControlButtons';
import React from 'react';
import { getPostsByLocale } from '@/helpers/fileReader';
import { useIntl } from 'react-intl';
import Link from 'next/link';
import { BsFolder2, BsTag } from 'react-icons/bs';
import { SlList, SlGrid } from 'react-icons/sl';
import { IoTrashOutline } from 'react-icons/io5';

import styles from '@/styles/blog.module.css';
import { useDialog } from '@/context/dialog';

const Page = ({ posts }: any) => {
    const { open, dispatch } = useDialog();
    const close = () => dispatch({ type: 'close' });

    const PostList = () => {
        return (
            <ul className={styles.postList}>
                {posts.map((item: any, index: number) => (
                    <li key={index}>
                        <Link
                            href={`blog/${item.meta.slug}`}
                            locale={item.meta.locale}
                        >
                            <BsFolder2 />
                            {item.meta.slug}
                        </Link>
                    </li>
                ))}
            </ul>
        );
    };
    return (
        <Layout meta={{ title: 'hello' }}>
            <Dialog
                open={open}
                body={
                    <div className={styles.container}>
                        <nav className={styles.nav}>
                            <ControlButtons
                                onClickClose={close}
                                onClickMinimise={close}
                            />
                            <div>
                                <h2 className={styles.navTitle}>Topics</h2>
                                {/* <PostList /> */}
                                <ul className={styles.postList}>
                                    <li className={styles.selected}>
                                        <a href="">
                                            <BsFolder2 />
                                            <div className={styles.tag}>
                                                Nextjs
                                            </div>
                                            <div className={styles.number}>
                                                22
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="">
                                            <BsFolder2 />
                                            <div className={styles.tag}>
                                                React
                                            </div>
                                            <div className={styles.number}>
                                                2
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="">
                                            <BsFolder2 />
                                            <div className={styles.tag}>
                                                Firebase
                                            </div>
                                            <div className={styles.number}>
                                                8
                                            </div>
                                        </a>
                                    </li>
                                </ul>
                                <h2 className={styles.navTitle}>Tags</h2>
                                <ul className={styles.postList}>
                                    <li className={styles.selected}>
                                        <a href="">
                                            <BsTag />
                                            <div className={styles.tag}>
                                                frontend
                                            </div>
                                            <div className={styles.number}>
                                                10
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="">
                                            <BsTag />
                                            <div className={styles.tag}>
                                                backend
                                            </div>
                                            <div className={styles.number}>
                                                1
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="">
                                            <BsTag />
                                            <div className={styles.tag}>
                                                web
                                            </div>
                                            <div className={styles.number}>
                                                12
                                            </div>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </nav>
                        <nav className={styles.secondNav}>
                            <div className={styles.controls}>
                                <SlList size={18} />
                                <SlGrid size={14} />
                                <IoTrashOutline size={19} />
                            </div>
                            <div className={styles.postLinks}>
                                <ul>
                                    <li>
                                        <a
                                            href=""
                                            className={styles.selectedPost}
                                        >
                                            <span className={styles.title}>
                                                Title here here here here here
                                                here here here
                                            </span>
                                            <span className={styles.excerpt}>
                                                Fragment heremherem here here v
                                                vherehere here here
                                            </span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="">
                                            <span className={styles.title}>
                                                Title here
                                            </span>
                                            <span className={styles.excerpt}>
                                                Fragment here
                                            </span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="">
                                            <span className={styles.title}>
                                                Title here
                                            </span>
                                            <span className={styles.excerpt}>
                                                Fragment here
                                            </span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </nav>
                        <article className={styles.article}>
                            <div className={styles.controls}></div>
                            <div className={styles.postLinks}></div>
                        </article>
                    </div>
                }
            />
        </Layout>
    );
};

// const Page = ({ posts }: any) => {
//     const [open, setOpen] = React.useState(true);
//     const { formatMessage: f } = useIntl();

//     const props = {
//         open: open,
//         onClickClose: () => setOpen(false),
//         onClickMinimise: () => setOpen(false),
//     };

//     return (
//         <Layout meta={meta}>
//             <Dialog
//                 open
//                 body={
//                     <>
//                         <h1>{f({ id: 'blog.title' })}</h1>
//                         {posts.map(
//                             (
//                                 item: {
//                                     meta: { slug: string; locale: string };
//                                 },
//                                 index: string
//                             ) => {
//                                 return (
//                                     <p key={index}>
//                                         <Link
//                                             href={`blog/${item.meta.slug}`}
//                                             locale={item.meta.locale}
//                                         >
//                                             {item.meta.slug}
//                                         </Link>
//                                     </p>
//                                 );
//                             }
//                         )}
//                     </>
//                 }
//             />
//         </Layout>
//     );
// };

export const getStaticProps = async ({ locale }: any) => {
    const posts = await getPostsByLocale(locale);
    return {
        props: {
            posts,
        },
    };
};

export default Page;
