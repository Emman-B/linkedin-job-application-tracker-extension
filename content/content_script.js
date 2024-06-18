// Obtains the element containing the job details
const getJobDetailsElement = () => {
    const jobSearchElement = document.getElementsByClassName("jobs-search__job-details");
    if (jobSearchElement.length > 0) {
        return jobSearchElement[0];
    } else {
        // this is the main element if on a specific job's page
        return document.getElementsByClassName("jobs-details")[0];
    }
};

// Formats a date object to be MM/DD/YYYY
const applicationDateFormatted = () => {
    const date = new Date();

    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

// Adds the listener that tracks whenever you submit data when doing easy-apply
const addEasyApplyModalSubmitHandler = () => {
    const jobEasyApplyModal = document.getElementsByClassName("jobs-easy-apply-modal")[0];

    if (jobEasyApplyModal && jobEasyApplyModal.getAttribute("application-tracker-listener") !== "true") {
        jobEasyApplyModal.setAttribute("application-tracker-listener", "true");
        jobEasyApplyModal.addEventListener('click', checkEasyApplyModalClick);
    }
};

// Handles whenever an application is submitted with an external application
const externalApplyHandler = (event) => {
    if (event.target.classList.contains("artdeco-button") || event.target.classList.contains("artdeco-button__text")) {
        if (event.target.textContent.includes("Yes")) {
            // Submit is detected, parse and store data, providing external url as needed
            const externalUrlElement = document.querySelector("[data-app-tracker-external-url]");
            if (externalUrlElement == null) {
                parseData();
            } else {
                parseData(externalUrlElement.dataset.appTrackerExternalUrl);
            }
        } else if (event.target.textContent.includes("Apply") && !event.target.textContent.includes("Easy")) {
            // Apply is detected, send message to service worker to parse the domain of the redirect
            (async () => {
                const response = await chrome.runtime.sendMessage({ externalApply: true });
                // response will be the pending URL
                event.target.dataset.appTrackerExternalUrl = response || "";
            })();
        }
    }
};

// Handles if an application is submitted via the easy-apply modal
const checkEasyApplyModalClick = (event) => {
    if (event.target.classList.contains("artdeco-button") || event.target.classList.contains("artdeco-button__text")) {
        if (event.target.textContent.includes("Submit")) {
            // Submit is detected, parse and store data.
            parseData();
        }
    }
};

// Parses the data of the selected job into a CSV-formatted string
const parseData = (externalUrl) => {
    const jobDetailsWindow = getJobDetailsElement();
    // regex parses the job ID from the job's URL
    const urlRegex = /https:\/\/www\.linkedin\.com\/jobs\/view\/([0-9]+)/i;
    const prefix = ".job-details-jobs-unified-top-card__";

    // detects if "Easy Apply" was used
    const usedLinkedInEasyApply = jobDetailsWindow.querySelector(".jobs-apply-button--top-card span.artdeco-button__text")?.textContent?.includes("Easy Apply");

    const applyMethod = externalUrl ? externalUrl : (usedLinkedInEasyApply ? "LinkedIn Easy Apply" : "");

    // determines jobUrl depending on if on job search page, or on a job's specific page
    const jobUrl = (() => {
        const jobTitleLinkElement = jobDetailsWindow.querySelector(`${prefix}job-title h1 a`);
        if (jobTitleLinkElement) {
            return jobTitleLinkElement.href.match(urlRegex)[0];
        } else {
            return window.location.href.match(urlRegex)[0];
        }
    })();

    const parsedData = {
        companyName: jobDetailsWindow.querySelector(`${prefix}company-name`).textContent.trim(),
        jobTitle: jobDetailsWindow.querySelector(`${prefix}job-title`).textContent.trim(),
        jobUrl: jobUrl,
        applicationDate: applicationDateFormatted(),
        applyMethod: applyMethod
    };

    // Send parsed data to be received by service worker
    (async () => {
        await chrome.runtime.sendMessage(parsedData);
    })();
};

// Adds a mutation observer to observe the entire document body, which will call the provided callback
// whenever changes to the page occur. (This is due to content scripts running on entire LinkedIn website).
const addMutationObserver = (callback) => {
    // Mutation Observer options (to check what mutations to observe)
    const config = { childList: true, subtree: true };

    // Create observer instance linked to the callback
    const observer = new MutationObserver(callback);

    // start observing the target node for configured mutations
    observer.observe(document.body, config);
};

// Initializes the content script only if it is on the right starting path (which is the /jobs path).
// Initialization will add event listeners to the job details window.
const initializeContentScript = () => {
    if (window.location.href.startsWith("https://www.linkedin.com/jobs/")) {
        // Window that contains the selected job's details
        const jobDetailsWindow = getJobDetailsElement();

        if (jobDetailsWindow) {
            // When job details window is clicked anywhere, it attaches a listener to the jobs easy-apply modal if it exists
            jobDetailsWindow.addEventListener('click', addEasyApplyModalSubmitHandler);
            // When job details window is clicked anywhere, it checks if the button is a "Yes" button. If so, parses the data.
            jobDetailsWindow.addEventListener('click', externalApplyHandler);
        }
    }
};

// If manually requested to add job to tracker, handle it here
chrome.runtime.onMessage.addListener((request) => {
    if (request.addCurrentJob) {
        parseData();
    }
});

// Add the mutation observer to the document body at start
addMutationObserver(initializeContentScript);

// To handle refreshes, initialize the content script as well
initializeContentScript();
