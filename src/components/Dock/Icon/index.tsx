import React from 'react';
import Image from 'next/image';

type Props = {
    src: string;
    alt: string;
};

const Icon = ({ src, alt }: Props) => {
    return (
        <>
            <Image
                data-testid="icon"
                src={src}
                alt={alt}
                width={60}
                height={60}
            />
        </>
    );
};

export default Icon;
