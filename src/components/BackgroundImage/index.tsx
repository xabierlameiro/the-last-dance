import Image from 'next/image';
import styles from './backgroundImage.module.css';
import backgroundImage from '../../../public/background-image.jpeg';
import { useIntl } from 'react-intl';

/**
 * @example
 *     <BackgroundImage />;
 *
 * @returns {JSX.Element}
 */
const BackgroundImage = () => {
    const { formatMessage: f } = useIntl();
    return (
        <div className={styles.bgWrap}>
            <Image
                fill
                /**
                 * SDD-L03. This is the LCP candidate on every URL — `Layout` mounts it site-wide,
                 * `fill` + `objectFit: cover` over a fixed full-screen wrapper.
                 *
                 * It carried `loading="eager"` and `quality={100}` and no `priority`, which was the
                 * wrong pair of both. `loading="eager"` only disables lazy-loading; `priority` is what
                 * emits `fetchpriority="high"` and a `<link rel="preload">`. Meanwhile the five 60px
                 * Dock icons *did* carry `priority`, so five decorative preloads outranked the LCP
                 * image. And `quality={100}` delivered 222 KB where the default 75 delivers 19 KB —
                 * measured with the project's own sharp against this source, a factor of 11.7.
                 */
                priority
                data-testid="background-image"
                sizes="100vw"
                placeholder="blur"
                src={backgroundImage}
                alt={f({ id: 'background.image.alt' })}
                style={{
                    objectFit: 'cover',
                }}
            />
        </div>
    );
};

export default BackgroundImage;
