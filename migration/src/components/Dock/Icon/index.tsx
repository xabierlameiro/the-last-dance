import React from 'react';
import Image from 'next/image';

type Props = {
    src: string;
    alt: string;
    testId?: string;
};

/**
 * @description: Icon component
 * @param {string} src - Image source
 * @param {string} alt - Image alt text
 * @param {string} testId - Test id for testing
 * @returns {JSX.Element}
 * @example
 * <Icon src="/images/nextjs.svg" alt="NextJS" testId="nextjs-icon" />
 */
const Icon = ({ src, alt, testId }: Props) => {
    return (
        <>
            <Image data-testid={testId} src={src} alt={alt} width={60} height={60} priority />
        </>
    );
};

export default Icon;
