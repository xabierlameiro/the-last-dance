import ModalWrapper from '@/components/ModalWrapper'
import VisibilityManager from '@/components/VisibilityManager'

// Import MDX content directly
import DesktopContentEs from '../../../../data/home/desktop.es.mdx'
import MobileContentEs from '../../../../data/home/mobile.es.mdx'
import DesktopContentEn from '../../../../data/home/desktop.en.mdx'
import MobileContentEn from '../../../../data/home/mobile.en.mdx'
import DesktopContentGl from '../../../../data/home/desktop.gl.mdx'
import MobileContentGl from '../../../../data/home/mobile.gl.mdx'

type Props = {
    params: Promise<{ lang: string }>
}

export default async function HomePage({ params }: Props) {
    const { lang } = await params;
    
    // Select content based on language
    const getContent = (lang: string) => {
        switch (lang) {
            case 'en':
                return { Desktop: DesktopContentEn, Mobile: MobileContentEn };
            case 'gl':
                return { Desktop: DesktopContentGl, Mobile: MobileContentGl };
            case 'es':
            default:
                return { Desktop: DesktopContentEs, Mobile: MobileContentEs };
        }
    };
    
    const { Desktop, Mobile } = getContent(lang);

    return (
        <ModalWrapper className="home">
            <VisibilityManager hideOnDesktop hideOnTablet>
                <Mobile />
            </VisibilityManager>
            <VisibilityManager hideOnMobile>
                <Desktop />
            </VisibilityManager>
        </ModalWrapper>
    );
}
