import type { ReactElement } from "react";
import Head from "next/head";

type Props = {
    children: ReactElement;
    meta: {
        title: string;
    };
};

export default function Layout({ meta, children }: Props) {
    return (
        <>
            <Head>
                <title data-testid="meta-title">{meta.title}</title>
            </Head>
            <main>{children}</main>
        </>
    );
}
