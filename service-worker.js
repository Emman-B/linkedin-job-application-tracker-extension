const STORAGE_KEY = "tracked-applications";

// Adds to local storage
const pushToStorage = async (parsedData) => {
    const retrievedStorage = await chrome.storage.local.get(STORAGE_KEY);

    const jobApps = Object.hasOwn(retrievedStorage, STORAGE_KEY) ? retrievedStorage[STORAGE_KEY] : []; // Use an empty array if no data exists

    jobApps.push(parsedData);

    await chrome.storage.local.set({ [STORAGE_KEY]: jobApps });
};

// Update badge text to show count of applications tracked
const updateBadgeText = async () => {
    const retrievedStorage = await chrome.storage.local.get(STORAGE_KEY);
    const jobApps = retrievedStorage[STORAGE_KEY];

    const badgeText = jobApps?.constructor === Array ? jobApps.length.toString() : "0";
    await chrome.action.setBadgeText({ text: badgeText });
};

// Receives parsed data sent from content script
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    if (request.jobTitle) {
        pushToStorage(request);
    } else if (request.externalApply) {
        chrome.tabs.query({ active: true, lastFocusedWindow: true })
            .then((result) => {
                if (result?.length > 0) {
                    const url = new URL(result[0].pendingUrl).hostname;
                    sendResponse(url)
                }
            })
            .catch((err) => console.error(err));
        return true;
    }
});

// Updates extension badge depending on storage updates
chrome.storage.onChanged.addListener(updateBadgeText);

// update badge text on start
updateBadgeText();
