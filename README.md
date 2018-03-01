# Expired To Be

## A Chrome Extension

'Expired To Be' is a Chrome extension available on the [Chrome Web Store](https://chrome.google.com/webstore/detail/expired-to-be/kamjiblbgmiobifooelpmlkojmadmcan).

This Chrome browser extension allows you to enter expiration dates with 'alarms' (measured primarily in days) for any items you'd like to be reminded of.

This extension will provide notification reminders at a time of your choosing (which is the actual expiration date, minus your 'lead time'). The primary notification for when an item expires is a number count that will show in the extension's icon (in the Chrome toolbar).

**Usage thoughts:**

  - Be reminded of little one-offs you don't think about too often; like butter, medicine, or the cleaning supplies under your sink. Maybe your pet's next vet visit.
  - As a developer, I spend most of my life in Chrome, which is why I decided to create this as a browser extension. I've completed refactoring to enable a SPA version, but will take some time to implement a local 'alarm' interface, and to implement an optional (and opt-in) [Web/Desktop Notifications system](https://developer.mozilla.org/en-US/docs/Web/API/notification).
  - It's open source, so feel free to fork it, or, PR's are welcome as well.
  - Creating a FireFox extension would make for a good fork and school project for someone.

**Primary features:**

  - Display listing of expiration items
  	+ Expired items will be distinct, as will any item you are currently 'editing'.
  	+ Items that have alarms set will show a 'blue sun' near its 'active' status.
  	+ You can edit, delete, and de/activate items individually.
  - Expiration items are stored in the browser's own storage. There are no connections to any 3rd party dependencies.
  - Chrome's 'storage' is synchronized (synced), meaning alarms are available on any of your synced devices that allow your Chrome extensions.
  - Chrome Extension Notifications: Icon badge text will show when items expire, and they will clear when the expired item is either deactivated, or updated with a new valid reminder date.
  - You can export your existing expiration items.
  - You can import over 500 items (the app will walk through saving each item from the list you provide).

## Version History

See ['X2B Version History' at bottom of page](#x2b-version-history)

## Functional Diagram

See [Storage (sync) with Alarms, and Storage (local) with Notifications](https://www.draw.io/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=expired-to-be.xml#Uhttps%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D1mTxbVo9d5hfpxvEPvz_4I65Cb0YU3LUG%26export%3Ddownload) (created with [Draw.io](https://www.draw.io/))

## Happy Paths

See [Happy Paths file](assets/x2b-happy-paths.md)

## Detailed Development History

See [History file](history.md)

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
  - Finished [Happy Paths file](assets/x2b-happy-paths.md).
  - Got entire app to work standalone, on any browser -- There just aren't any alarms or notifications to let you know when an item's expiration lead time has matured. And, it's not hosted anywhere... yet (will be going through GitHub pages and Travis CLI with ver 1.5).

### 1.4.1

  - Padded 'day' for proper `date` input field compatibility.

### 2.0 (WIP)

Browser-Level Notifications (in lieu of installing the Chrome extension)

Run Expired To Be from a standalone web app page, and be provided with opt-in notifications. Or just visit the web app page regularly to check on your expirations.

  - Custom alarms interface with a Browser Notification system.
    - Expiration Notification options; Never, Once*, Daily* ... *Requires opt-in).
    - If `!chrome.alarms`, and if not previously granted, provide button to opt-in to Notifications.
  - Standalone web page for access to Expired To Be app from any browser (no Chrome Extension).
    - Note: The two systems 'may' interact if on a Chrome browser, but each browser has its own storage system.

### 2.0.1 (TBD)

  - Add sorting for larger lists.
