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
    /*
     * The countdown's only explanation was a tooltip reading 'Important date'. This says at least
     * what the number is counting towards; what the date signifies is the owner's copy to write.
     */
    'countdown.label': 'Time remaining until {date}',
};

export default en;
