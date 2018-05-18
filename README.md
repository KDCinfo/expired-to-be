[![Build Status](https://travis-ci.org/KDCinfo/expired-to-be.svg?branch=master)](https://travis-ci.org/KDCinfo/expired-to-be)

# Expired To Be

Expired To Be provides notification reminders for your expiring items at a time of your choosing. It is available as:

  - A Chrome browser extension (available for free from the [Chrome Web Store](https://chrome.google.com/webstore/detail/expired-to-be/kamjiblbgmiobifooelpmlkojmadmcan))

  - A standalone web app (available via a [(GitHub-hosted) web page](https://KDCinfo.github.io/expired-to-be/))

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

## X2B [A Web App]

The [web version of the app](https://KDCinfo.github.io/expired-to-be/) (SPA) can be run in any browser, was written with React 16.2 (w/ TypeScript), was built on top of [Create React App](https://github.com/facebookincubator/create-react-app), and is hosted via GitHub Pages bootstrapped with Travis CI.

[SPA Integration Diagram](/public/x2b/expired-to-be_page-load_07.svg): Integration between the **React Alarms API** and the **Chrome Extension core files**.

**Important Note**: Unlike the Chrome Extension, which is always running so long as your browser is running, the web-based version of the app (its browser tab) must remain open for the timers (alarms) to continue to run. You can absolutely continue your browsing activities in other tabs and other windows, but the X2B page will need to stay open in the background. If you close the browser tab that Expired To Be is open in, you are effectively closing the Expired To Be web app, and the timers won't be able to run. However, in the case you do close the tab, all is not lost... each time you visit the page, all active timers are restored, and any active expired items will trigger.

You can select one of 4 optional notification delivery methods for when expiring items are triggered. There is also a custom built-in notification method that will update the browser tab's icon and text. The optional notification methods are Alerts (default), Web-based Notifications, Modals, and 'None'.

  > `Alerts` will trigger a built-in browser dialog box, which will be revealed when the X2B web page is available. In Chrome, if the tab is not active, you may see a little dot in the X2B browser's tab. `Alerts` is the default notification delivery method.

  > Web-based `Notifications`, if `grant`ed, will use the browser's built-in notification system, which will show a notification balloon on your desktop. Most of these desktop notifications will automatically disappear after a certain time (e.g., after 15-30 seconds). If permissions are not granted (either by denying, or by just closing the permission request box, Alerts will be set and used in its stead.

  Side note: If you close the permissions request box 3 times, Chrome will ___automatically___ set Notifications to `Deny`, and ___will not ask again___. To reset after that, you'll need to click the 'Site Info' button at the top of your browser, to the left of the URL (it may say, "Secure"). Clicking that will provide a dropdown panel which will have the `Notifications` option set to `Deny`.

  > `Modals` are quite passive and will only show when the page is available. The modal will continue to show each time the page is loaded until the "Done (for now)" button is clicked. (The Done (for now) reference is an easter egg for the borrowed TimerBox component.)

  > `None` will yield no notifications other than the custom built-in notification method (distinct tab icon and text changes).

  - Uses: Custom Alarms API (extracted from my "Done (for now)" web app)
    https://github.com/KDCinfo/done-for-now

  - Uses: Web-based Notifications API (optional)
    https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API

### Technical Note

At the core of the [Expired To Be Web App](https://github.com/KDCinfo/expired-to-be) lies the Expired To Be Chrome extension's 2 primary files, which include:

    > `/public/extensions/chrome/`
    - popup.html (the user interface)
    - popup.js (the brains)

## Data Storage

  > Chrome Extension uses: Chrome -> Storage -> Sync

  > Hosted Web App uses: Each browser's own `LocalStorage`

## Diagrams

All diagrams were created with [Draw.io](https://www.draw.io/).

  > [Chrome Extension Integration with React Alarms API](/public/x2b/expired-to-be_page-load_07.svg)

  > [Alarms and Notifications](/public/x2b/x2b-with-alarms.svg)

  > [Storage (sync) with Alarms, and Storage (local) with Notifications](https://www.draw.io/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=expired-to-be.xml#Uhttps%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D1mTxbVo9d5hfpxvEPvz_4I65Cb0YU3LUG%26export%3Ddownload)

## Version History

See ['X2B Version History' at bottom of page](#x2b-version-history)

## Happy Paths

See [Happy Paths file](/public/x2b/x2b-happy-paths.md)

## Detailed Development History

See [History file](/public/extensions/chrome/history.md)

## Helpful Sites and Pages

  * [Travis CI (Prod Build)](https://travis-ci.org/KDCinfo/expired-to-be)

  * [Done (for now) TimerBox (timers) Component](https://github.com/KDCinfo/done-for-now/blob/master/src/components/TimerBox.tsx)
  The Done (for now) TimerBox component (and all its subcomponents) was forked and updated to accommodate (one-time daily) alarms. The (recurring) `timer` code still exists in Expired To Be, and could be enabled within a week or two (see `TimerAlertPrompt.tsx`).

  * [Done (for now) TimerBox Flow Diagram](https://kdcinfo.com/app/done-for-now/flowchart/done-for-now.svg)
  This diagram was used as a schematic for integrating the TimerBox component with the Expired To Be architecture.

  * [Done (for now) Web App (the working version)](https://kdcinfo.github.io/done-for-now/)

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