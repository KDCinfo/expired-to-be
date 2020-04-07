# Expired To Be

Products that you own, such as medicines, pantry and refrigerated items, etc., typically come with expiration dates.

Expired To Be provides notification reminders for your expiring items at a time of your choosing.

Simply add an item (1), expiration date (2), and how much 'lead time' you would like (3).

> Your browser will show a # count for items as they come due for renewal.

## App Availability

  - [Chrome Browser Extension](https://chrome.google.com/webstore/detail/expired-to-be/kamjiblbgmiobifooelpmlkojmadmcan) - Available for free on the Chrome Web Store.

## Overview

  - Be reminded of little one-offs you don't think about too often; like butter, medicine, or the cleaning supplies under your sink.

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

## Happy Paths

See [Happy Paths file](/public/x2b/x2b-happy-paths.md)

## Helpful Sites and Pages

  * [https://developer.chrome.com/extensions/content_scripts](https://developer.chrome.com/extensions/content_scripts)
  * [https://developer.chrome.com/extensions/storage](https://developer.chrome.com/extensions/storage)
  * [https://developer.chrome.com/extensions/event_pages](https://developer.chrome.com/extensions/event_pages)
  * [https://developer.chrome.com/extensions/messaging](https://developer.chrome.com/extensions/messaging)
  * [https://developer.chrome.com/extensions/alarms](https://developer.chrome.com/extensions/alarms)
  * [https://developer.chrome.com/extensions/browserAction](https://developer.chrome.com/extensions/browserAction)

## App Genesis: Detailed Notes

See ['Detailed Development History'](https://github.com/KDCinfo/expired-to-be/blob/master/public/extensions/chrome/history.md)

## Release Notes

See ['Wiki'](https://github.com/KDCinfo/expired-to-be/wiki) for version history and release notes.

## Bugs and Enhancements

If you have a bug or feature request, please feel free to [submit a new issue on GitHub](https://github.com/KDCinfo/expired-to-be/issues). Feel free to submit [Pull Requests](https://github.com/KDCinfo/expired-to-be/pulls) for consideration as well.

A list of longer term considerations:

- Add 'last export' date and remind about backing up (you really don't want to lose your list!)

  Store: Date, number of items at that time, number of active items at that time, ...

  Preference Option: Enable Check [yes|no] _ How often: [1-dy|2-dy|3-dy|5-dy|1-wk (default)|2-wk|3-wk|4-wk]

  Preference Option: Can/should show reminder alert on the toolbar icon? Different color background (with a 0 if no expires---just to show for the export reminder (usually it won't show if there are none)).

- Allow categorizing (or labeling)

- Get code prepped for a mobile version of the app (as part of an even bigger suite).

## Chrome Store Listing

```
Expiration Reminders for groceries, medicine, warranties, etc.
A quick and convenient way to set and be reminded of expiring items.
```
```
Because by the time you need something---it's expired!

> Simply add an item (1), expiration date (2), and how much 'lead time' you would like (3).

> Your browser will show a # count for items as they come due for renewal.

Expired To Be is a free browser extension.
It is also open source on GitHub and is provided with
detailed notes and release notes: https://github.com/KDCinfo/expired-to-be
```
