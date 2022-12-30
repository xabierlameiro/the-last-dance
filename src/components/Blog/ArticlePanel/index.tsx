import { RiEditBoxLine } from 'react-icons/ri';
import { MdSortByAlpha, MdAddLink, MdOutlineChecklist } from 'react-icons/md';
import { RxTable, RxUpload } from 'react-icons/rx';
import { BiPhotoAlbum } from 'react-icons/bi';
import { BsLock } from 'react-icons/bs';
import { CgProfile } from 'react-icons/cg';
import { SearchInput } from '@/components';
import styles from './panel.module.css';

const ArticlePanel = () => {
    return (
        <div className={styles.articleControls}>
            <RiEditBoxLine size={20} />
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
