import CVMobile from '@/mdx/cv-mobile.mdx';
import CVDesktop from '@/mdx/cv.mdx';
import VisibilityManager from '@/components/VisibilityManager';
import Layout from '@/layout';

const Page = () => {
    const meta = {
        title: "This is the Xabier's portfolio",
    };
    return (
        <Layout meta={meta}>
            <>
                <VisibilityManager hideOnDesktop hideOnTablet>
                    <CVMobile />
                </VisibilityManager>
                <VisibilityManager hideOnMobile>
                    <CVDesktop />
                </VisibilityManager>
            </>
        </Layout>
    );
};

export default Page;
