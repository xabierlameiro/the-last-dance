/**
 * SDD-L08/L09: the three catalogues used to live in one 300-line module that every page imported.
 * Splitting them per locale is the seam L09-T9 needs to load only the active one, and it is what
 * makes the survey copy (SDD-L08-T7) tractable — that alone is ~60 strings per language.
 */

const en = {
    'blog.categories': 'Topics',
    'blog.readtime': '{readTime, plural, one {# minute of reading time} other {# minutes of reading time}}',
    'blog.breadcrumb': 'Notes',
    'blog.tags': 'Tags',
    language: 'English',
    'home.breadcrumb': 'Code',
    'home.seo.title': 'Xabier Lameiro | Software Architect · Next.js & React',
    'home.seo.description':
        "I'm a Software Architect with more than 8 years of experience working in the online banking sector, currently specialized in Nextjs and React. Passionate about technology and programming, I like to learn new things and share knowledge with the community.",
    'settings.seo.title': 'Customized language, theme and region preferences for a web application',
    'settings.seo.description':
        'Web page for user preferences settings for your experience on the web, allows you to change the language, theme and region',
    'settings.title': 'System Preferences',
    'settings.desc': 'Software Architect · Next.js & React',
    'settings.lang': 'Language & Region',
    'settings.langAlt': 'Language & Region Icon',
    'settings.lang.preferred': 'Preferred languages:',
    'settings.lang.description':
        'Language & Region preferences control the language you see in menus and dialogues, and the formats of date, times and currencies',
    'settings.search': 'Search',
    'settings.avatar': 'Avatar image',
    'settings.breadcrumb': 'System Preferences',
    'comments.seo.title': 'Web application comments',
    'comments.seo.description':
        'Web page for web application comments, allows users to leave comments on the content of the page',
    'comments.breadcrumb': 'Terminal',
    'legal.title': 'Legal documents',
    'legal.breadcrumb': 'Legals',
    'legal.cookies-policy': 'Cookies Policy',
    'legal.legal-notice': 'Legal Notice',
    'legal.privacy-policy': 'Privacy Policy',
    'consent.title': 'Cookies',
    // SDD-L06: the search field had no label at all; a placeholder is not one.
    'search.label': 'Search',
    // Side-panel toggles (SDD-L05): the grabbers had no accessible name.
    'blog.toggleCategories': 'Show categories and tags',
    'blog.togglePosts': 'Show posts in this category',
    // Landmark names (SDD-L05): four <nav> regions announced as an undifferentiated
    // "navigation, navigation, navigation, navigation" before these.
    'nav.social': 'Social links',
    'nav.applications': 'Applications',
    'nav.taxonomy': 'Categories and tags',
    'nav.posts': 'Posts in this category',
    'nav.legal': 'Legal documents',
    // Window controls (SDD-L05): previously hardcoded English title attributes.
    'controls.close': 'Close window',
    'controls.minimise': 'Minimise window',
    'controls.maximise': 'Maximise window',
    'consent.message':
        'This site would like to use analytics cookies to measure how it is read. They are only set if you accept. More detail in the',
    'consent.accept': 'Accept',
    'consent.reject': 'Reject',
    'legal.search-placeholder': 'Search in legals',
    'weather.tooltip': 'Click above for weather and news updates',
    'countdown.caption': 'Important date',
    'starCounter.label': 'Star this repository on GitHub',
    'starCounter.tooltip': 'Come on, give me a star!',
    'starCounter.error': 'Error getting the number of stars',
    'starCounter.loading': 'Loading... stars',
    'viewCounter.error': 'Error getting the number of views',
    'viewCounter.loading': 'Loading... views',
    'viewCounter.tooltipAll': 'Number of total website visits from Google analytics',
    'viewCounter.tooltipPage': 'Number of page visits from Google analytics',
    'viewCounter.users.error': 'Error getting the number of users',
    'viewCounter.users.loading': 'Loading... users',
    'viewCounter.users.tooltip': 'Number of users from Google analytics',
    'cryptoPrice.error': 'Error getting the price of the Ripple coin',
    'cryptoPrice.loading': 'Loading... price',
    'cryptoPrice.tooltip': 'Ripple coin price today, percentage {todayPercentage}',
    'heating.error': 'Error getting the temperature',
    'heating.loading': 'Loading... temperature',
    'heating.tooltip': 'Temperature outside {outsideTemp}º and inside {zoneMeasuredTemp}º of my house',
    'indexedCounter.error': 'Error getting the number of indexed pages',
    'indexedCounter.loading': 'Loading... indexed pages',
    'indexedCounter.tooltip': '{num, plural, one {# page indexed in Google} other {# pages indexed in Google}}',
    'news.error': 'Error getting the news',
    'news.empty': 'No recent news',
    'news.loading': 'Loading... news',
    'weather.error': 'Error getting the weather',
    'weather.loading': 'Loading... weather',
    'weather.precipitation': 'Precipitation {precipitation}',
    'weather.humidity': 'Humidity {humidity}',
    'weather.windSpeed': 'Wind {windSpeed}',
    'countdown.years': 'years',
    'countdown.months': 'months',
    'countdown.days': 'days',
    'countdown.hours': 'hours',
    'countdown.minutes': 'minutes',
    'countdown.seconds': 'seconds',
    'settings.dark': 'Theme (Dark)',
    'settings.light': 'Theme (Light)',
    'deploymentstatus.tooltip':
        'Status : {status} The user {username} has deployed to {environment} environment at {createdAt}',
    'rendermanager.error': 'An error has occurred, we are working on it',
    // SDD-L07: three failures used to share one sentence, because the prop carrying them was a
    // boolean. They are different events and a reader can act on the difference — a bad status
    // is worth retrying, a response that no longer matches its contract is not.
    'rendermanager.error.status': 'The service answered with an error. It may work if you try again shortly',
    'rendermanager.error.shape': 'The service answered something unexpected, so this reading is not shown',
    'rendermanager.loading': 'Getting the data...',
    /*
     * SDD-L08. 404, 500 and the error boundary were hardcoded English on a trilingual site, and none
     * of them offered a way out — a visitor who hit one had the Dock and nothing else. Each pair says
     * what happened and what to do next, which is the part that was missing even in English.
     */
    'error.404.title': 'Page not found',
    'error.404.message': 'This address does not lead anywhere. It may have been renamed or removed.',
    'error.500.title': 'Server error',
    'error.500.message': 'Something broke on my side while loading this page. It is not you.',
    'error.boundary.title': 'Something went wrong',
    'error.boundary.message': 'This part of the page could not be displayed. Reloading usually fixes it.',
    'error.home': 'Go to the home page',
    /*
     * Dock labels. These were five English `alt` strings in constants/navMenu.ts — including the
     * typo 'Got to configuration page' — on icons whose only other cue is a tooltip behind
     * `@media (hover: hover)`, which never matches on a touch device.
     */
    'dock.home': 'Home',
    'dock.blog': 'Notes',
    'dock.terminal': 'Terminal',
    'dock.legal': 'Legal documents',
    'dock.settings': 'System Preferences',
    'dock.legal.short': 'Legal',
    'dock.settings.short': 'Settings',
    'dock.nextLeak': 'next-leak',
    /*
     * /next-leak. Copy only: route names, figures, retainer chains, issue rows and the verdict words
     * are CLI output and live untranslated in constants/nextLeak.ts.
     */
    'nextLeak.breadcrumb': 'next-leak',
    'nextLeak.seo.title': 'next-leak: find out whether your Next.js app leaks memory',
    'nextLeak.seo.description':
        'A CLI that measures Next.js memory leaks route by route: a verdict from the heap after forced GC and the object that retains it.',
    'nextLeak.pitch':
        'Find out whether your Next.js app actually leaks memory: how much, on which route, and whose fault it is.',
    'nextLeak.copy': 'Copy',
    'nextLeak.copied': 'Copied',
    'nextLeak.copyLabel': 'Copy the command {command}',
    'nextLeak.sections': 'Sections',
    'nextLeak.nav.overview': 'Overview',
    'nextLeak.nav.run': 'Example run',
    'nextLeak.nav.build': 'Build mode',
    'nextLeak.nav.verified': 'Verified',
    'nextLeak.nav.limits': 'Limits',
    'nextLeak.nav.links': 'Links',
    'nextLeak.overview.title': 'What it answers',
    'nextLeak.overview.answer1':
        "You don't have a leak: the spike is transient and drains while idle. The most common case.",
    'nextLeak.overview.answer2': 'Something is filling up, not leaking: a bounded cache on its way to its ceiling.',
    'nextLeak.overview.answer3':
        'The leak is in your code or in a dependency, named down to the source file when possible.',
    'nextLeak.overview.answer4': 'It looks like framework internals, with an issue draft ready to file.',
    'nextLeak.overview.start': 'Start',
    'nextLeak.overview.startText':
        'Build your app with <code>output: "standalone"</code>, then run this from its directory:',
    'nextLeak.overview.how': 'How it measures',
    'nextLeak.overview.howText': 'Each route is measured in a fresh process:',
    'nextLeak.overview.shape':
        'The verdict comes from the shape of the curve after forced GC, not from where the heap sits: 40 MB and 400 MB say nothing on their own.',
    'nextLeak.overview.verdicts': 'Verdicts',
    'nextLeak.verdict.stable':
        'No growth this run could detect. Not proof of absence: the verdict prefers missing a leak to inventing one.',
    'nextLeak.verdict.leak':
        'Retained heap keeps growing every cycle. It names the culprit when the source maps resolve it.',
    'nextLeak.verdict.saturating':
        'Every cycle grew, but by less than the one before: a bounded store running out of new keys.',
    'nextLeak.verdict.inconclusive': 'The evidence does not decide. The route is measured again with twice the cycles.',
    'nextLeak.verdict.failed': 'The route errored under load: more than 1% of non-2xx responses stops the measurement.',
    'nextLeak.overview.falsePositives':
        'Across ~{routes} healthy routes on production apps (PPR, MDX, Auth.js, Sentry, i18n) it reported zero false positives.',
    'nextLeak.table.route': 'Route',
    'nextLeak.table.verdict': 'Verdict',
    'nextLeak.table.slope': 'Slope',
    'nextLeak.table.heap': 'Heap',
    'nextLeak.table.retainer': 'Retainer',
    'nextLeak.run.detail': '{route} — reproduction for {issue}, fixed in Next {version}',
    'nextLeak.run.chart': 'Heap after forced GC, per cycle',
    'nextLeak.run.cycle': 'cycle {n} · {mb} MB',
    'nextLeak.run.cycles': 'Heap per cycle',
    'nextLeak.run.stableRetainer': 'Stable routes are not diffed unless you pass <code>--diff-all</code>.',
    'nextLeak.run.leakAside':
        'A healthy route gives back 20–30% of its growth. This one gives back nothing: that is the step shape.',
    'nextLeak.run.stableAside': 'The first cycle is warm-up and stays out of the verdict. After it the curve is flat.',
    'nextLeak.status':
        '{routes, plural, one {# route} other {# routes}} · {leaks, plural, one {# leak} other {# leaks}} · heap after forced GC, per cycle',
    'nextLeak.checked': 'README checked {date}',
    'nextLeak.build.title': 'Measure the build, not the server',
    'nextLeak.build.text':
        'A large site can run out of heap while prerendering, before any server exists to measure. This command runs your build unmodified and samples the resident memory of each static-generation worker. It needs neither a previous build nor standalone output.',
    'nextLeak.build.evidence': 'On the reproduction for {issue}, {pages, number} prerendered pages:',
    'nextLeak.build.leaking':
        'Out of heap after {first, number} and {second, number} of {pages, number} pages, in two runs.',
    'nextLeak.build.healthy': 'Finishes at {perPage} per page.',
    'nextLeak.build.fixed': 'Fixed in {version} by the same fix as {issue}. Not re-measured here yet.',
    'nextLeak.build.parent':
        "The build's own process is reported, not judged. On that reproduction it went from {from} down to {to} while the workers climbed, so adding the two would cancel the finding.",
    'nextLeak.build.attribute':
        '<code>--attribute</code> also names what the worker retains. It is opt-in and slow: the worker writes its whole heap to disk.',
    'nextLeak.verified.title': 'Verified against real Next.js issues',
    'nextLeak.verified.checked': 'Issue states checked {date}.',
    'nextLeak.verified.issue': 'Issue',
    'nextLeak.verified.what': 'What it is',
    'nextLeak.verified.measured': 'Measured',
    'nextLeak.verified.state': 'State',
    'nextLeak.state.fixed': 'fixed in {version}',
    'nextLeak.state.closed': 'closed',
    'nextLeak.state.open': 'open',
    'nextLeak.state.fixProposed': 'fix proposed in {link}',
    'nextLeak.verified.proof':
        'On {issue} it found the leak, {found} across {cycles} cycles. With the workaround from the thread applied ({workaround}), same app and same parameters: {after}, flat.',
    'nextLeak.verified.kept':
        'The fixed ones stay on the list on purpose: they show that the measurements matched what the fixes turned out to be.',
    'nextLeak.verified.full': 'The full table is in the README',
    'nextLeak.limits.title': 'Scope and limits',
    'nextLeak.limits.supported':
        'The default command needs the App Router, <code>output: "standalone"</code>, Node 22 or later, and Linux or macOS. Pages Router, non-standalone builds and Windows are rejected with a clear message.',
    'nextLeak.limits.stable':
        '<code>stable</code> is not proof of absence. Run <code>--self-check</code> first: it plants a leak of 8 KB per request and proves the harness sees it where you are running.',
    'nextLeak.limits.heapCap':
        'Each measured process runs under a 512 MB heap cap, so a leak reaches a ceiling in minutes. Apps with a larger working set need <code>--max-old-space</code>.',
    'nextLeak.limits.duration':
        'A 60-route app under defaults takes hours. Narrow it with <code>--routes</code> while you iterate.',
    'nextLeak.limits.attribution':
        'Naming the file needs a Turbopack build with server source maps, the Next 15+ default. On webpack builds findings stay unattributed; the measurement does not depend on it.',
    'nextLeak.limits.flip':
        'Borderline routes can flip between <code>stable</code> and <code>leak</code> across runs. More cycles resolve it.',
    'nextLeak.limits.environment':
        'The app runs with its real environment: routes that call external services will call them under load.',
    'nextLeak.links.repository': 'Source code, README and issues',
    'nextLeak.links.npm': 'The package on npm',
    'nextLeak.links.post': 'The post that explains the method',
    'nextLeak.links.report': 'Got a wrong verdict? Open an issue',
    /*
     * The countdown's only explanation was a tooltip reading 'Important date'. This says at least
     * what the number is counting towards; what the date signifies is the owner's copy to write.
     */
    'countdown.label': 'Time remaining until {date}',
};

export default en;
