// Usage: `node searchConsole.js`
import fetch from 'node-fetch';

export const sendSitemapToSearchConsole = async () => {
    try {
        const response = await fetch(
            `https://www.google.com/webmasters/tools/ping?sitemap=https://xabierlameiro.com/sitemap.xml`
        );

        if (response.status === 200) {
            console.log('Sitemap successfully sent to Google Search Console');
        } else {
            console.error('Failed to notify Google Search Console');
            process.exit(1);
        }
    } catch (error) {
        console.error('Error sending sitemap to Google Search Console', error);
        process.exit(1);
    }
};

sendSitemapToSearchConsole();
