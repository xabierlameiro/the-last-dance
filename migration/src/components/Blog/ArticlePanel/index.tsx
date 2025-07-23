'use client'

import React from 'react';
import { MdSortByAlpha, MdAddLink, MdOutlineChecklist } from 'react-icons/md';
import { RxTable, RxUpload, RxStopwatch } from 'react-icons/rx';
import { BiPhotoAlbum } from 'react-icons/bi';
import { BsLock } from 'react-icons/bs';
import { CgProfile } from 'react-icons/cg';
import { useTranslation } from '@/hooks/useTranslationSimple';
import SearchInput from '@/components/SearchInput';
import styles from './panel.module.css';
import StarCounter from '../StarCounter';
import ViewCounter from '../ViewCounter';
import Tooltip from '@/components/Tooltip';

type Props = {
    readTime?: string;
};

/**
 * @example
 *     <TimeRead readTime="2" />;
 *
 * @param {string} readTime - The read time of the article
 * @returns {JSX.Element}
 */
const TimeRead = ({ readTime }: Props) => {
    const { t } = useTranslation();

    return (
        <Tooltip>
            <Tooltip.Trigger>
                <div className={styles.readContainer} data-testid="read-time">
                    <RxStopwatch size={20} />
                    <span>{readTime}</span>
                </div>
            </Tooltip.Trigger>
            <Tooltip.Content>
                <span>{t('blog.readtime', { readTime: readTime || '' })}</span>
            </Tooltip.Content>
        </Tooltip>
    );
};

/**
 * @example
 *     <ArticlePanel readTime="2" />;
 *
 * @param {string} readTime - The read time of the article
 * @returns {JSX.Element}
 */
const ArticlePanel = ({ readTime }: Props) => {
    return (
        <div className={styles.articleControls} data-testid="article-panel">
            <div className={styles.readTime}>
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
