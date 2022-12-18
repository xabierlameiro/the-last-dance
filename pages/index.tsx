import CVMobile from '../src/mdx/cv.mobile.mdx';
import CVDesktop from '../src/mdx/cv.mdx';
import VisibilityManager from '@/components/VisibilityManager';

const Page = () => {
    return (
        <>
            <VisibilityManager hideOnDesktop hideOnTablet>
                <CVMobile />
            </VisibilityManager>
            <VisibilityManager hideOnMobile>
                <CVDesktop />
            </VisibilityManager>
        </>
    );
};

export default Page;
