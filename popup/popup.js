const STORAGE_KEY = "tracked-applications";

// Handles when all items are cleared
const clearAllItems = async () => {
    await chrome.storage.local.clear();
};
const clearButton = document.querySelector("#apptracker__clear-button");
clearButton.addEventListener("click", clearAllItems); // clears all items on click

// Handles deleting specific items
const handleDeletingJobButton = async (event) => {
    const retrievedStorage = await chrome.storage.local.get(STORAGE_KEY);
    const jobApps = retrievedStorage[STORAGE_KEY];

    if (jobApps?.constructor === Array) {
        const index = event.target.dataset.index;

        jobApps.splice(index, 1); // deletes in place

        await chrome.storage.local.set({ [STORAGE_KEY]: jobApps });
    }
}

// Handle manually adding an item via button click
const handleAddCurrentSelectedJob = async () => {
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true, url: "https://www.linkedin.com/jobs/*"});

    if (tab) {
        await chrome.tabs.sendMessage(tab.id, { addCurrentJob: true });
    }
};
document.querySelector("#apptracker__add-current-selected-job-button").addEventListener("click", handleAddCurrentSelectedJob);

// Handle copying all job applications to clipboard
const handleCopyToClipboard = async () => {
    const retrievedStorage = await chrome.storage.local.get(STORAGE_KEY);
    const jobApps = retrievedStorage[STORAGE_KEY];

    let clipboardContents = "";

    jobApps?.forEach((jobApp) => {
        // quotes surround job title and url to prevent errors when pasting as CSV
        // for some reason, quotes around company name does not work correctly, so commas are replaced with periods.
        const jobAppAsCsv = `"${jobApp["companyName"].replace(",", ".")}","${jobApp["jobTitle"]}","${jobApp["jobUrl"]}","${jobApp["applyMethod"]}",${jobApp["applicationDate"]}\n`;
        clipboardContents += jobAppAsCsv;
    });

    // write to clipboard
    await navigator.clipboard.writeText(clipboardContents);
};
document.querySelector("#apptracker__copy-to-clipboard-button").addEventListener("click", handleCopyToClipboard);

// First clears UI, then adds data row elements using data pulled from local storage.
//  Also attaches event listeners to the delete buttons.
const loadStorage = async () => {
    const retrievedStorage = await chrome.storage.local.get(STORAGE_KEY);
    const jobApps = retrievedStorage[STORAGE_KEY];

    // get table body element
    const tableBody = document.querySelector(".apptracker__table-body-row");

    // clear all current rows
    while (tableBody.firstChild) {
        tableBody.firstChild.remove();
    }

    // add all new rows
    for (let idx = 0; idx < jobApps?.length; idx++) {
        const jobApp = jobApps[idx];

        // row being added
        const tableRow = document.createElement("tr");

        // data from the job application
        const tableDataCompanyName = document.createElement("td");
        const tableDataJobTitle = document.createElement("td");
        const tableDataApplyMethod = document.createElement("td");

        // delete button with event listener attached
        const tableDataDeleteColumn = document.createElement("td");
        const tableDataDeleteButton = document.createElement("button");
        tableDataDeleteButton.textContent = "Delete";
        tableDataDeleteButton.dataset.index = idx;
        tableDataDeleteButton.addEventListener("click", handleDeletingJobButton);
        tableDataDeleteColumn.appendChild(tableDataDeleteButton);

        // updating with the data from job application
        tableDataCompanyName.textContent = jobApp.companyName;
        tableDataJobTitle.textContent = jobApp.jobTitle;
        tableDataApplyMethod.textContent = jobApp.applyMethod;

        // attaching to the table row, and then the full table body
        tableRow.appendChild(tableDataCompanyName);
        tableRow.appendChild(tableDataJobTitle);
        tableRow.appendChild(tableDataApplyMethod);
        tableRow.appendChild(tableDataDeleteColumn);
        tableBody.appendChild(tableRow);
    }
};

// load storage whenever storage gets updated
chrome.storage.onChanged.addListener(loadStorage);

// Load storage at start
loadStorage(); // async
