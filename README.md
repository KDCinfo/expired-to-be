# Expired To Be

Products that you own, such as medicines, pantry and refrigerated items, etc., typically come with expiration dates.

Expired To Be provides notification reminders for your expiring items at a time of your choosing.

Simply add an item (1), expiration date (2), and how much 'lead time' you would like (3).

> Your browser will show a # count for items as they come due for renewal.

## App Availability

  - [Chrome Browser Extension](https://chrome.google.com/webstore/detail/expired-to-be/kamjiblbgmiobifooelpmlkojmadmcan) - Available for free on the Chrome Web Store.

## Overview

  - Be reminded of little one-offs you don't think about too often; like butter, medicine, or the cleaning supplies under your sink. Maybe your pet's next vet visit.

  - Notifications are set to an expiration date that you provide, minus your chosen 'lead time'.

  - Expired To Be is [open source](https://github.com/KDCinfo/expired-to-be), so feel free to fork it, or, PR's are welcome as well.

**Primary features:**

  - Display listing of all expiration items:

  	+ Expired items will be distinct, as will any item you are currently 'editing'.
  	+ Items that have alarms set will show an 'orange or blue sun' near its 'active' status.
  	+ You can edit, delete, and de/activate items individually.

  - Expiration items are stored in the browser's own storage. There are no connections to any 3rd party services.

  - You can export all of your existing expiration items.

  - You can import over 500 items (the app will walk through saving each item from the list you provide).

## X2B [A Chrome Extension]

The primary notification for when an item expires is an orange number count that will show in the extension's icon (in the Chrome toolbar). This expiration count will clear when the expired item is either deactivated, or updated with a new valid reminder date.

  - As a developer, I spend most of my life in Chrome, which is why I decided to create this as a browser extension.

  - This was my 2nd Chrome Extension. Although I built this extension primarily for personal use, I am completely open to feedback as well as PRs, and I'm especially open to looking into any bugs.

  - Creating a FireFox extension would make for a good fork and school project for someone.

  - Uses: Chrome Extension API (icon badge text)
    https://developer.chrome.com/extensions/

## Data Storage

  > Chrome Extension uses: Chrome -> Storage -> Sync

## Diagrams

All diagrams were created with [Draw.io](https://www.draw.io/).

  > [Chrome Extension Integration with React Alarms API](/public/x2b/expired-to-be_page-load_07.svg)

## Version History

See ['X2B Version History' at bottom of page](#x2b-version-history)

## Happy Paths

See [Happy Paths file](/public/x2b/x2b-happy-paths.md)

## Detailed Development History

See [History file](/public/extensions/chrome/history.md)

## Helpful Sites and Pages

  * [https://developer.chrome.com/extensions/content_scripts](https://developer.chrome.com/extensions/content_scripts)
  * [https://developer.chrome.com/extensions/storage](https://developer.chrome.com/extensions/storage)
  * [https://developer.chrome.com/extensions/event_pages](https://developer.chrome.com/extensions/event_pages)
  * [https://developer.chrome.com/extensions/messaging](https://developer.chrome.com/extensions/messaging)
  * [https://developer.chrome.com/extensions/alarms](https://developer.chrome.com/extensions/alarms)
  * [https://developer.chrome.com/extensions/browserAction](https://developer.chrome.com/extensions/browserAction)

## X2B Version History

### 1.0

  - Initial Release.

### 1.1

  - Added link to Chrome Store. Filled in outer edge with orange to better complement the outer border.

### 1.2

  - Added a 'confirm' to 'Clear All' button. Also zeroed out form on clear all. Pertinent Chrome Store files updated.

### 1.3

  - Issue resolved. Decorative Unicode character replaced with CSS border-left: 5px;

### 1.4

  - Will begin patch-level updates when applicable from here on out (although this particular version does warrant a minor version increment).

  - Changed font. (Discovered iPad (iOS?) fell back to a near illegible cursive font.)

  - Implemented 'Export' feature. Will save as a JSON file or open in a new tab (depending on your system).

  - Implemented 'Import' feature (includes a progress bar, error handling, and sample JSON data).

  - Added both those features with the 'Clear All' and implemented a `List Options` pop-up menu in the footer.

  - Major code refactor with storage (created `x2bStorage`) and alarms: Prepped for integration of Notifications and a custom `alarms` interface.

  - Created Functional Diagram for visual representation of storage and alarms (notifications).

  - Finished [Happy Paths file](/public/x2b/x2b-happy-paths.md).

  - Got entire app to work standalone, on any browser -- There just aren't any alarms or notifications to let you know when an item's expiration lead time has matured. And, it's not hosted anywhere... yet (will be going through GitHub pages and Travis CLI with ver 1.5).

### 1.4.1

  - Padded 'day' for proper `date` input field compatibility.

### 2.0

  - Run Expired To Be in any browser as a Web App (in lieu of installing the Chrome extension).

The Web App version of X2B provides for opt-in browser-level Notifications, or just visit the web app page regularly to check on your expirations. It also includes a custom Alarms interface. The code that runs the Chrome Extension is injected directly into the Web App and is the underlying face and brains of the Web App (2 apps; 1 source code).

### 2.0.1

  - Fixed error on initial page load with an active expired item.

### 2.0.2

  - Fixed issue with 'reset' button allowing for more than 10 weeks.
  - Added GA tag.

### 2.0.3

  - Fixed issue with messages (e.g., preference update messages) being overwritten by expired items message.
  - Made a few relative path adjustments in [README.md](README.md).

### 2.1.0

- Added sorting (6 in all).
  - 3 sortable columns (title; date; days remaining).
  - Ascending and Descending; each sortable column.

### 2.1.1

- Fixed low-level vulnerabilities with open-source dependencies.

### 2.1.2

- Added automated UI testing using TestCafe.
  - Lead times.
  - Importing.
  - Clearing all items.
  - Sorting.

### 2.2.0

  * Added **'Replacement Date'** feature (optional).

  This is for when you have a backup on hand (such as an overlapping spare butter; gotta have spare butter).

  - See [History file](/public/extensions/chrome/history.md#new-feature-thought-replacement-dates) for details.

### 2.2.1

- Aesthetic adjustment.

### 2.2.2

- Fixed import error.

### 2.2.3

- Stripped SPA.

### 2.3.0

- Converted expired items listing from an HTML `<table>` to `<div>`s.
- Instead of scrolling the entire screen when the list fills up, scrolling is now isolated to just the expired item list (below the sortable list headings).
- Updated favicons to accommodate the browser's dark themed bar.
- Added FAQ / Help.

### 2.3.1

- Aesthetic fix for new FAQ slide-up modal when list is empty.

## Bugs and Enhancements

If you have a bug or feature request, please feel free to [submit a new issue on GitHub](https://github.com/KDCinfo/expired-to-be/issues). You are also free to submit Pull Requests for consideration.

A partial list of things I have in store, of which are in no particular order:

- Add reminders to export your list (you really don't want to lose your list!)
- Get code prepped for a mobile version of the app (as part of an even bigger suite).
