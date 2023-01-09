import React from 'react';
import { MdSortByAlpha, MdAddLink, MdOutlineChecklist } from 'react-icons/md';
import { RxTable, RxUpload, RxStopwatch } from 'react-icons/rx';
import { BiPhotoAlbum } from 'react-icons/bi';
import { BsLock } from 'react-icons/bs';
import { CgProfile } from 'react-icons/cg';
import { SearchInput } from '@/components';
import { useRouter } from 'next/router';
import { useIntl } from 'react-intl';
import styles from './panel.module.css';

type Props = {
    readTime?: string;
};
const ArticlePanel = ({ readTime }: Props) => {
    const [hits, setHits] = React.useState(0);
    const { formatMessage: f } = useIntl();
    const { asPath } = useRouter();

    React.useEffect(() => {
        (async () => {
            const { total } = await fetch(`/api/analytics?slug=${asPath}`).then((res) => res.json());
            setHits(total);
        })();
    }, [asPath]);

    return (
        <div className={styles.articleControls} data-testid="article-panel">
            <div
                className={styles.readTime}
                {...(readTime &&
                    Number(readTime) >= 0 && {
                        title: f({ id: 'blog.readtime', description: 'read time' }, { readTime }),
                    })}
            >
                <RxStopwatch size={20} />
                {readTime && Number(readTime) >= 0 && (
                    <>{f({ id: 'blog.readtime', description: 'read time' }, { readTime })}</>
                )}
                {Number(hits) > 0 && (
                    <span className={styles.analytics}>
                        {f({ id: 'blog.readHits', description: 'read hits' }, { hits })}
                    </span>
                )}
            </div>
            <MdSortByAlpha />
            <MdOutlineChecklist />
            <RxTable size={18} />
            <MdAddLink className={styles.rotate} />
            <BiPhotoAlbum size={18} />
            <BsLock size={18} />
            <CgProfile size={18} />
            <RxUpload size={18} />
            <SearchInput />
        </div>
    );
};
export default ArticlePanel;
