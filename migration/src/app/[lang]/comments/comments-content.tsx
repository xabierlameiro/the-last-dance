'use client'

import React from 'react';
import Dialog from '@/components/Dialog';
import ControlButtons from '@/components/ControlButtons';
import { AiFillFolder } from 'react-icons/ai';
import styles from '@/styles/comments.module.css';
import Data from '../../../../data/comments/index.mdx';

type Props = {
  lang: string
}

export default function CommentsContent({ lang }: Props) {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState(0);
  const [width, setWidth] = React.useState(0);

  React.useEffect(() => {
    if (dialogRef.current) {
      setHeight(dialogRef.current.clientHeight);
      setWidth(dialogRef.current.clientWidth);
    }
  }, [dialogRef]);

  return (
    <Dialog
      open
      modalMode
      className="comments"
      dialogRef={dialogRef as React.RefObject<HTMLDivElement>}
      header={
        <div className={styles.header}>
          <ControlButtons />
          <div>
            <AiFillFolder />
            xabier.lameirocardama - bash - {width}x{height}
          </div>
        </div>
      }
      body={<Data />}
    />
  );
}
