import React from 'react';
import { MdSortByAlpha, MdAddLink, MdOutlineChecklist } from 'react-icons/md';
import { RxTable, RxUpload, RxStopwatch } from 'react-icons/rx';
import { BiPhotoAlbum } from 'react-icons/bi';
import { BsLock } from 'react-icons/bs';
import { CgProfile } from 'react-icons/cg';
import { SearchInput } from '@/components';
import { useIntl } from 'react-intl';
import styles from './panel.module.css';
import StarCounter from '../StarCounter';
import ViewCounter from '../ViewCounter';

type Props = {
    readTime?: string;
};

const TimeRead = ({ readTime }: Props) => {
    return (
        <div className={styles.readContainer} data-testid="read-time">
            <RxStopwatch size={20} />
            <span>{readTime}</span>
        </div>
    );
};

const ArticlePanel = ({ readTime }: Props) => {
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
                <TimeRead readTime={readTime} />
                <ViewCounter />
                <StarCounter />
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
