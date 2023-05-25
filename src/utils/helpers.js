export const createPopupNotification = ({type, status, autoHide, duration = 2600, closeable, state, message, meta = {}}) => {
    let count = 0;
    if (state && state.popupNotification) {
        count = (state.popupNotification.count || 0) + 1;
    }
    return {
        type,
        status,
        autoHide,
        closeable,
        duration,
        meta,
        message,
        count
    };
};

export function isSentryEventAllowed({event: sentryEvent}) {
    const frames = sentryEvent?.exception?.values?.[0]?.stacktrace?.frames || [];
    const fileNames = frames.map(frame => frame.filename).filter(filename => !!filename);
    const lastFileName = fileNames[fileNames.length - 1] || '';
    return lastFileName.includes('@tryghost/comments');
}

export function formatNumber(number) {
    if (number !== 0 && !number) {
        return '';
    }

    // Adds in commas for separators
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();

    // Diff is in seconds
    let diff = Math.round((now.getTime() - date.getTime()) / 1000);
    if (diff < 5) {
        return '刚刚';
    }

    if (diff < 60) {
        return `${diff}秒前`;
    }

    // Diff in minutes
    diff = diff / 60;
    if (diff < 60) {
        if (Math.floor(diff) === 1) {
            return `1分钟前`;
        }
        return `${Math.floor(diff)}分钟前`;
    }

    // First check for yesterday
    // (we ignore setting 'yesterday' if close to midnight and keep using minutes until 1 hour difference)
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    if (date.getFullYear() === yesterday.getFullYear() && date.getMonth() === yesterday.getMonth() && date.getDate() === yesterday.getDate()) {
        return '昨天';
    }

    // Diff in hours
    diff = diff / 60;
    if (diff < 24) {
        if (Math.floor(diff) === 1) {
            return `1小时前`;
        }
        return `${Math.floor(diff)}小时前`;
    }

    // Diff in days
    diff = diff / 24;
    if (diff < 7) {
        if (Math.floor(diff) === 1) {
            // Special case, we should compare based on dates in the future instead
            return `1天前`;
        }
        return `${Math.floor(diff)}天前`;
    }

    // Diff in weeks
    diff = diff / 7;
    if (Math.floor(diff) === 1) {
        // Special case, we should compare based on dates in the future instead
        return `1星期前`;
    }
    return `${Math.floor(diff)}星期前`;
}

export function formatExplicitTime(dateString) {
    const date = new Date(dateString);

    let day = date.toLocaleDateString('en-us', {day: '2-digit'}); // eg. 01
    let month = date.toLocaleString('en-us', {month: 'short'}); // eg. Jan
    let year = date.getFullYear(); // eg. 2022
    let hour = (date.getHours() < 10 ? '0' : '') + date.getHours(); // eg. 02
    let minute = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes(); // eg. 09

    return `${day} ${month} ${year} ${hour}:${minute}`;
}

export function getInitials(name) {
    if (!name) {
        return '';
    }
    const parts = name.split(' ');

    if (parts.length === 0) {
        return '';
    }

    if (parts.length === 1) {
        return parts[0].substring(0, 1).toLocaleUpperCase();
    }

    return parts[0].substring(0, 1).toLocaleUpperCase() + parts[parts.length - 1].substring(0, 1).toLocaleUpperCase();
}

// Rudimentary check for screen width
// Note, this should be the same as breakpoint defined in Tailwind config
export function isMobile() {
    return (Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) < 480);
}

export function isCommentPublished(comment) {
    return comment.status === 'published';
}

/**
 * Returns the y scroll position (top) of the main window of a given element that is in one or multiple stacked iframes
 */
export const getScrollToPosition = (element) => {
    let yOffset = 0;

    // Because we are working in an iframe, we need to resolve the position inside this iframe to the position in the top window
    // Get the window of the element, not the window (which is the top window)
    let currentWindow = element.ownerDocument.defaultView;

    // Loop all iframe parents (if we have multiple)
    while (currentWindow !== window) {
        const currentParentWindow = currentWindow.parent;
        for (let idx = 0; idx < currentParentWindow.frames.length; idx++) {
            if (currentParentWindow.frames[idx] === currentWindow) {
                for (let frameElement of currentParentWindow.document.getElementsByTagName('iframe')) {
                    if (frameElement.contentWindow === currentWindow) {
                        const rect = frameElement.getBoundingClientRect();
                        yOffset += rect.top + currentWindow.pageYOffset;
                    }
                }
                currentWindow = currentParentWindow;
                break;
            }
        }
    }

    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
    return y;
};

/**
 * Scroll to an element that is in an iframe, only if it is outside the current viewport
 */
export const scrollToElement = (element) => {
    // Is the form already in view?
    const elementHeight = element.offsetHeight;

    // Start y position of the form
    const yMin = getScrollToPosition(element);

    // Y position of the end of the form
    const yMax = yMin + elementHeight;

    // Trigger scrolling when yMin and yMax is closer than this to the border of the viewport
    const offset = 64;

    const viewportHeight = window.innerHeight;
    const viewPortYMin = window.scrollY;
    const viewPortYMax = viewPortYMin + viewportHeight;

    if (yMin - offset < viewPortYMin || yMax + offset > viewPortYMax) {
        // Center the form in the viewport
        const yCenter = (yMin + yMax) / 2;

        window.scrollTo({
            top: yCenter - viewportHeight / 2,
            left: 0,
            behavior: 'smooth'
        });
    }
};
