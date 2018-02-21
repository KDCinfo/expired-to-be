# Expired To Be

## A Chrome Extension

'Expired To Be' is a Chrome extension available on the [Chrome Web Store](https://chrome.google.com/webstore/detail/expired-to-be/kamjiblbgmiobifooelpmlkojmadmcan).

This Chrome browser extension allows you to enter expiration dates with 'alarms' (measured primarily in days) for any items you'd like to be reminded of.

This extension will provide notification reminders at a time of your choosing (which is the actual expiration date, minus your 'lead time'). The primary notification for when an item expires is a number count that will show in the extension's icon (in the Chrome toolbar).

**Usage thoughts:**

  - Be reminded of little one-offs you don't think about too often; like butter, medicine, or the cleaning supplies under your sink. Maybe your pet's next vet visit.
  - As a developer, I spend most of my life in Chrome, which is why I decided to create this as a browser extension. I `might` make a SPA version if I find myself needing one, or perhaps if there were outside interest.
  - It's open source, so feel free to fork it, or, PR's are welcome as well.
  - Creating a FireFox extension would make for a good fork and school project for someone.

**Primary features:**

  - Icon badge text will show when items expire, and they will clear when the expired item is either deactivated, or updated with a new valid reminder date.
  - Display listing of expiration items
  	+ Expired items will be distinct, as will any item you are currently 'editing'.
  	+ Items that have alarms set will show a 'blue sun' near its 'active' status.
  	+ You can edit, delete, and de/activate items individually.
  - Expiration items are stored in the browser's own storage. There are no connections to any 3rd party dependencies.
  - Chrome's 'storage' is synchronized (synced), meaning this alarm will be available on any of your synced devices that allow your Chrome extensions.

## Helpful Sites and Pages

  * [https://developer.chrome.com/extensions/content_scripts](https://developer.chrome.com/extensions/content_scripts)
  * [https://developer.chrome.com/extensions/storage](https://developer.chrome.com/extensions/storage)
  * [https://developer.chrome.com/extensions/event_pages](https://developer.chrome.com/extensions/event_pages)
  * [https://developer.chrome.com/extensions/messaging](https://developer.chrome.com/extensions/messaging)
  * [https://developer.chrome.com/extensions/alarms](https://developer.chrome.com/extensions/alarms)
  * [https://developer.chrome.com/extensions/browserAction](https://developer.chrome.com/extensions/browserAction)

## History

See [history file](history.md)
