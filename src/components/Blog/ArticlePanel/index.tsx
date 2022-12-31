import { MdSortByAlpha, MdAddLink, MdOutlineChecklist } from 'react-icons/md';
import { RxTable, RxUpload, RxStopwatch } from 'react-icons/rx';
import { BiPhotoAlbum } from 'react-icons/bi';
import { BsLock } from 'react-icons/bs';
import { CgProfile } from 'react-icons/cg';
import { SearchInput } from '@/components';
import styles from './panel.module.css';
import { useIntl } from 'react-intl';

const ArticlePanel = ({ post }: any) => {
    const { readTime } = post.meta;
    const { formatMessage: f } = useIntl();
    return (
        <div className={styles.articleControls}>
            <div className={styles.readTime}>
                <RxStopwatch size={20} />
                {f(
                    { id: 'blog.readtime', description: 'read time' },
                    { readTime }
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
