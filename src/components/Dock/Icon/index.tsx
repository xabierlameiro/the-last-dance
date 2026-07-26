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
            {/*
             * SDD-L03: `priority` removed. It emits a high-priority `<link rel="preload">`, and with
             * five Dock icons that meant five preloads competing against the LCP image — which had
             * none. The Dock is `position: fixed; bottom: 1px`, so it is always inside the initial
             * viewport and these load immediately regardless; at ~2-4 KB delivered per 60px icon there
             * is nothing to gain from outranking the background.
             */}
            <Image data-testid={testId} src={src} alt={alt} width={60} height={60} />
        </>
    );
};

export default Icon;
