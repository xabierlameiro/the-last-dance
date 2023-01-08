import { MdSortByAlpha, MdAddLink, MdOutlineChecklist } from 'react-icons/md';
import { RxTable, RxUpload, RxStopwatch } from 'react-icons/rx';
import { BiPhotoAlbum } from 'react-icons/bi';
import { BsLock } from 'react-icons/bs';
import { CgProfile } from 'react-icons/cg';
import { SearchInput } from '@/components';
import styles from './panel.module.css';
import { useIntl } from 'react-intl';

type Props = {
    readTime?: string;
    analytics?: number;
};
const ArticlePanel = ({ readTime, analytics }: Props) => {
    const { formatMessage: f } = useIntl();
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
                {Number(analytics) > 0 && (
                    <span className={styles.analytics}>
                        {f({ id: 'blog.readHits', description: 'read hits' }, { hits: analytics })}
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
