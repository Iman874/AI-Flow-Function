
const URLS = [
    'http://localhost:5000',
    'https://api.rosuliman.my.id'
];

let currentUrlIndex = 0;

export const fetchWithFallback = async (endpoint, options = {}) => {
    let lastError = null;

    // Create a list of indices to try, starting with the current one
    const indicesToTry = [currentUrlIndex];
    for (let i = 0; i < URLS.length; i++) {
        if (i !== currentUrlIndex) {
            indicesToTry.push(i);
        }
    }

    for (const index of indicesToTry) {
        const url = URLS[index];
        try {
            // Add a timeout of 5 seconds
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`${url}${endpoint}`, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // If we successfully connected (even if 4xx/5xx), update the preferred URL
            // because it means this server is alive and reachable.
            if (index !== currentUrlIndex) {
                console.log(`Switched API endpoint to ${url}`);
                currentUrlIndex = index;
            }

            return response;
        } catch (error) {
            console.warn(`Failed to connect to ${url}:`, error.message);
            lastError = error;
            // Continue to the next URL
        }
    }

    // If all URLs failed, throw the last error
    throw lastError || new Error('All API endpoints failed');
};

export const getCurrentBaseUrl = () => URLS[currentUrlIndex];
