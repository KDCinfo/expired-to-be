# Expired To Be

Products that you own, such as medicines, pantry and refrigerated items, etc., typically come with expiration dates.

Expired To Be provides notification reminders for your expiring items at a time of your choosing.

Simply add an item (1), expiration date (2), and how much 'lead time' you would like (3).

> Your browser will show a # count for items as they come due for renewal.

## App Availability

  - [Chrome Browser Extension](https://chrome.google.com/webstore/detail/expired-to-be/kamjiblbgmiobifooelpmlkojmadmcan) - Available for free on the Chrome Web Store.

As of Sep 2021, 'Expired To Be' is also available as a free mobile app titled 'Xpired To Be' in both app stores. 

  > **Note**: The 'Xpired To Be' mobile app is a part of the [KD-reCall collection of free 'simple reminder apps'](https://kdrecall.com). As a part of that collection, an account is required (also free), and is shared among all the mobile apps in the collection. Due to the Chrome extension operating solely in the browser and not requiring a login, **the mobile app and Chrome extension are not linked, and do not share data**. 
  
  > Additionally, due to the "file" structure in mobile devices, there is currently no support for importing or exporting lists. For mobile, your lists are stored on your account, and is available across mobile devices.

  - [Google Play Store](https://play.google.com/store/apps/details?id=com.kdcinfo.kdrecall_x2b) - Available for Android devices.
  - [Apple App Store](https://apps.apple.com/us/app/kd-recall-xpired-to-be/id1585280787) - Available for iPhones and iPads.

## Overview

Be reminded of little one-offs you don't think about too often; like butter, medicine, or the cleaning supplies under your sink.

The primary notification for when an item expires is an orange number count that will show in the extension's icon (in the Chrome toolbar). This expiration count will clear when the expired item is either deactivated, or updated with a new valid reminder date.

**Primary features:**

  - Display listing of all expiration items:
  	+ Expired items will be distinct, as will any item you are currently 'editing'.
  	+ Items that have alarms set will show an 'orange or blue sun' near its 'active' status.
  	+ You can edit, delete, and de/activate items individually.
  - Expiration items are stored in the browser's own storage. There are no connections to any 3rd party services.
  - You can export all of your existing expiration items.
  - You can import over 500 items (the app will walk through saving each item from the list you provide).
  - Uses: [Icon Badge Text](https://developer.chrome.com/extensions/browserAction#badge), [Data Storage](https://developer.chrome.com/extensions/storage), and [Chrome.Storage.Sync](https://developer.chrome.com/extensions/storage#property-sync).

## Helpful Sites and Pages

All of these are available from [the Chrome API Documentation](https://developer.chrome.com/extensions)

  * [[content_scripts](https://developer.chrome.com/extensions/content_scripts)], [[storage](https://developer.chrome.com/extensions/storage)], [[event_pages](https://developer.chrome.com/extensions/event_pages)], [[messaging](https://developer.chrome.com/extensions/messaging)], [[alarms](https://developer.chrome.com/extensions/alarms)], [[browserAction](https://developer.chrome.com/extensions/browserAction)]

## Happy Paths

See [Happy Paths file](/public/x2b/x2b-happy-paths.md).

## App Genesis: Detailed Notes

See [Detailed Development History](https://github.com/KDCinfo/expired-to-be/blob/master/public/extensions/chrome/history.md).

## Release Notes

See ['Wiki' for version history and release notes](https://github.com/KDCinfo/expired-to-be/wiki/Expired-To-Be:-Release-Notes-and-Version-History).

## Bugs and Enhancements

If you have a bug or feature request, please feel free to [submit a new issue on GitHub](https://github.com/KDCinfo/expired-to-be/issues). Feel free to submit [Pull Requests](https://github.com/KDCinfo/expired-to-be/pulls) for consideration as well.

A list of longer term considerations:

- Add 'last export' date and remind about backing up (you really don't want to lose your list!)
  	+ Store: Date, number of items at that time, number of active items at that time, ...
  	+ Preference Option: Enable Check [yes|no] _ How often: [1-dy|2-dy|3-dy|5-dy|1-wk (default)|2-wk|3-wk|4-wk]
  	+ Preference Option: Can/should show reminder alert on the toolbar icon? Different color background (with a 0 if no expires---just to show for the export reminder (usually it won't show if there are none)).
- Allow categorizing (or labeling)
- Get code prepped for a mobile version of the app (as part of an even bigger suite).

## [Chrome Store Listing](https://chrome.google.com/webstore/detail/expired-to-be/kamjiblbgmiobifooelpmlkojmadmcan)

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
