'use client'

import { useEffect } from 'react';
import Dialog from '@/components/Dialog';
import { useDialog } from '@/context/dialog';

type Props = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function BlogError({ error, reset }: Props) {
    const { open } = useDialog();

    useEffect(() => {
        console.error('Blog error:', error);
    }, [error]);

    return (
        <Dialog
            className="blog-error"
            open={open}
            body={
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h2>Something went wrong!</h2>
                    <p>There was an error loading the blog content.</p>
                    <button
                        onClick={reset}
                        style={{
                            marginTop: '1rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Try again
                    </button>
                </div>
            }
        />
    );
}
