import { ReactNode } from 'react';

type Props = {
    children: ReactNode;
};

export default function BlogLayout({ children }: Props) {
    return (
        <>
            {children}
        </>
    );
}
