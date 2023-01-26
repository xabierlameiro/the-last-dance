import { NextApiRequest, NextApiResponse } from 'next';

const userAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36';

/**
 * @description Get the number of indexed pages in Google
 *
 * @returns {Promise<{ num: string } | { error: string } | void>}
 */
export default async function handler(
    _req: NextApiRequest,
    res: NextApiResponse
): Promise<
    | {
          num: string;
      }
    | {
          error: string;
      }
    | void
> {
    const response = await fetch('https://www.google.com/search?q=site%3Axabierlameiro.com', {
        method: 'GET',
        headers: new Headers({
            'user-agent': userAgent,
            'cache-control': 'max-age=0',
            cookie: 'OTZ=6831335_56_56_123900_52_436380; CONSENT=PENDING+047; SID=SwjXMjTWfjDfnGgbRd-6G8CQZMVXkF-992UhK8wxfFbHVbv-FyGzHoH7ngaEbhdEEE-HGA.; __Secure-1PSID=SwjXMjTWfjDfnGgbRd-6G8CQZMVXkF-992UhK8wxfFbHVbv-WxqcyaP30TwrV47FFQQm-Q.; __Secure-3PSID=SwjXMjTWfjDfnGgbRd-6G8CQZMVXkF-992UhK8wxfFbHVbv-6uOVv7NuFxeBWWvMCmF0Hw.; HSID=AUfybx_ebG2539f6q; SSID=Ad0iFiyvbJTf6aJ23; APISID=hSYYronTlV5spEIF/A4e3jM5Q7f3-2uQLv; SAPISID=TZi3xq-WWLkwEE0J/AvgzmTnugn-yT6-FI; __Secure-1PAPISID=TZi3xq-WWLkwEE0J/AvgzmTnugn-yT6-FI; __Secure-3PAPISID=TZi3xq-WWLkwEE0J/AvgzmTnugn-yT6-FI; OGPC=19022622-1:; AEC=ARSKqsIMwRy5Pw4z9OcaY-8tJgOjbS1ZulBwOL3w1hECryawXt2EcGx-aA; S=antipasti_server_prod=iqycEHYCtI2LVXLwAwSiiRSl-zRpQjZJbaaPqjw0Reo:billing-ui-v3=k4jH-b_lKhjy4MUy1pJFya1uf9yDFbT3:billing-ui-v3-efe=k4jH-b_lKhjy4MUy1pJFya1uf9yDFbT3; 1P_JAR=2023-1-26-8; NID=511=lOAcEnkvg50nEsgOmE5HT-06ehhndhcJpDUyXoEKAhdHdL6_RMcdUNxY55rXjAbvzWZYktjGrFH1QXHOa8BASzg9VJsFK_PzU-13A7mY7rCWsjOlrwLlHVIbm8HSLDrFTLj5fwngzdEga94Tb41tKaIgbKowW4SKR-W-Btv5kPzyjtz3mQ1OOhJdnsQawaTV1e0Cc9T8qH6o1H_UvJYVjgS83XLSJyqp02EbIo1O_7s5XNvOo_BzLLJrvSDTutjLHLjxNYU; __Secure-ENID=10.SE=RgHhmNawSnPWMJVFQKwGlIY9uEtBRkmWazPhO-jeve-pVu3xS1nXJGp9FnjHIPj00dl4I5Hc24W4xdHxfho98Ipa2kA3XPCgpHcOeC98PAsnTx1kfL9pXKrB26ZssSObGA6Cnm6C6-lDra3eUiJRB7hSbvC2ZzOzM0kBDuY2_weTebEJV4sBaz7dPIDa1Zb41kSP9J0qOm_tuntJtYas9o11zT-Oo2SkgK6CaXbAGxcbaJZKE1T4vKbZZkGuq7y9SX1npUAt73Kq_g1NcDFTmkB7_Frrxm8ubDE6ZKe1UzG64ZthvLidr9EultsvtABriSwGAWU; UULE=a+cm9sZTogMQpwcm9kdWNlcjogMTIKdGltZXN0YW1wOiAxNjc0NzI1ODkxNDY2MDAwCmxhdGxuZyB7CiAgbGF0aXR1ZGVfZTc6IDUyNjUyNjMyNAogIGxvbmdpdHVkZV9lNzogLTg2MjgxNzg1Cn0KcmFkaXVzOiAxMDE1Mi41CnByb3ZlbmFuY2U6IDYK; DV=M1tP2ZjsSVkYgIjjJVKBVqZRMyzXXhg; SIDCC=AIKkIs1srl3cH9tkFJjYOGGLI6MfJYaP5u6s__uUZOp91nHZ7HLyoOo1nKgTObGhuubQEIPJSNE; __Secure-1PSIDCC=AIKkIs0uJYHpyA4jNpm1IKIUIrBOufwdoitaU-wawMlse9egLi4RbISbpxrTKYZJkgG_wbVTamE; __Secure-3PSIDCC=AFvIBn9cjy9S7Sldrq6q8TcsiHneNdRWvWhfbB2T6jIMVBSmyTrVM55mAS83LmKOU5tQJ04LfLOH',
        }),
    })
        .then((res) => res.text())
        .catch((err) => {
            throw new Error(err);
        });

    const num = response.substring(response.indexOf('id="result-stats">') + 24, response.indexOf('<nobr>') - 8);

    if (isNaN(Number(num))) {
        throw new Error(`The number of indexed pages is not a number ${response}`);
    }

    try {
        res.status(200).json({ num });
    } catch (err) {
        res.status(500).json({ error: 'Something went wrong', err });
    }
}
