import Layout from '@/layout';
import Dialog from '@/components/Dialog';

const meta = {
    title: 'This is the Comments page',
};

const Page = () => {
    return (
        <Layout meta={meta}>
            <Dialog open>
                <></>
            </Dialog>
        </Layout>
    );
};

export default Page;
