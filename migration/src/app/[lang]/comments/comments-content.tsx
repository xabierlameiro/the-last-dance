'use client'

import React from 'react';
import Dialog from '@/components/Dialog';
import ControlButtons from '@/components/ControlButtons';
import { AiFillFolder } from 'react-icons/ai';
import styles from '@/styles/comments.module.css';
import { useDialog } from '@/context/dialog';

type Props = {
  lang: string;
  content: string;
}

export default function CommentsContent({ lang, content }: Props) {
  const { dispatch, open } = useDialog();
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState(0);
  const [width, setWidth] = React.useState(0);
  const close = () => dispatch({ type: 'close' });

  React.useEffect(() => {
    if (dialogRef.current) {
      setHeight(dialogRef.current.clientHeight);
      setWidth(dialogRef.current.clientWidth);
    }
  }, [dialogRef]);

  return (
    <Dialog
      open={open}
      modalMode
      className="comments"
      dialogRef={dialogRef as React.RefObject<HTMLDivElement>}
      header={
        <div className={styles.header}>
          <ControlButtons disabled onClickClose={close} onClickMinimise={close} />
          <div>
            <AiFillFolder style={{ display: 'inline-block' }} />
            xabier.lameirocardama - bash - {width}x{height}
          </div>
        </div>
      }
      body={
        <div 
          dangerouslySetInnerHTML={{ __html: content }}
          style={{ height: 'inherit', borderRadius: 0 }}
        />
      }
    />
  );
}
