# LinkedIn Job Application Tracker Extension 📃

This is a Google Chrome extension meant to help track job applications made via
LinkedIn. This will not work outside of LinkedIn. I also do not plan on publishing
this extension to the Chrome Web Store.

## Installation 🛠
1. Pull this repository into a folder.
2. Go to `chrome://extensions` and enable developer mode.
3. Click on `Load unpacked` and load the folder.
4. The extension should now show up on the extension list. Disable Developer mode.

## How to use 🔧
1. 📃 Go to the LinkedIn job search/listings page.
  a. ⚠ There is a known issue. If you open up the extension popup and click on "Add Current
  Selected Job", it might not work. In this case, you need to refresh the page after reaching
  the listings page.
2. 📝 Apply to any job on the list. If a job has LinkedIn Easy Apply, you will see some extra text
at the top of the easy apply modal: "This application will be tracked by the extension!".
  a. The reason for this is due to the known issue described above. This will be updated or removed
  once the issue is figured out.
3. 💻 After you apply to the job, the extension will automatically track the job's company name,
job title, job listing URL, method of application (which is the domain of where you were redirected
to, or simply "LinkedIn Easy Apply"), and the month, day, and year of when you applied.
  a. You should also see a counter next to the extension icon go up 1 number.
4. 📋 After you are done applying to jobs, you can hit "Copy to Clipboard" and it will copy all of the
details into a CSV-formatted string that you can use to paste to a spreadsheet.
  a. It will be formatted as `Company Name,Job Title,Job URL,Apply Method,Application Date`.
  b. If there are commas in any column, they should be handled by the quotes, except for the company
  name. The company name will have commas replaced with periods.
5. ❌ If you have made a mistake, you can delete jobs that were tracked by hitting the "Delete" button
next to the tracked job.
6. 👆 If you applied to a job but it was not tracked (due to the issue described in step 1a), use the
"Add Current Selected Job" button and it will track everything except for the apply method.

## Known Issues ⚠
- There is a known issue where arriving onto the LinkedIn Job Search/Listings page in which the
extension will not work at all. The error message provided is `Uncaught (in promise) Error: Could
not establish connection. Receiving end does not exist.`.
  - Although a temporary fix is to refresh the page, it is possible that this will go unnoticed
  and result in making multiple applications where none are tracked, so keep this in mind.

## Features ✅
- LinkedIn job application tracking either in the job search/listings page or the job's specific
page.
- Live updating counter next to the badge.

## Future Features ⭐
- Proper icons
- Customizable formatting
- Firefox Add-on
- Functionality on other websites (requires project rename)
- Future proofing the extension so that UI updates on LinkedIn won't break the extension.
  - Possible method: `textContent` of entire job listing, `split` by `newlines`, clear out
  empty strings, then parse the data from there.

## How it was made 🔨
The main functionality depends on the class names and HTML tags of certain elements in order
to obtain the needed information to track the job listing properly. This also helped with
figuring out whenever the user applied to jobs by tracking button clicks.

This does lead to an issue where if LinkedIn makes any visual updates to their UI, it can
break the extension. A future update could be to either parse the data differently so that
it doesn't depend on class names or HTML tags, or to use an API to fetch the job details.
