/**
 * Expired To Be - Background Script Page
 *
 * The 'background script' part of this extension will listen for messages from the content script
 * (for creating alarms), listen for those alarms, and update the extension's icon (badge text) when needed.
 *
 * Developer: Keith D Commiskey (https://kdcinfo.com) 2018-02
 *
 */

chrome.browserAction.setBadgeBackgroundColor({color: 'orange'});

/**
 * ALARM - CREATE
 *
 */
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
  // A message sent from [popup.js] triggers an alarm to be created.

  // `request.delay` is a Date() equivalent to the item's expiration -minus- the lead time:
  // This should be greater than or equal to tomorrow's date, which is tonight at midnight.

  chrome.alarms.create(request.alarmId, {when: request.delay}); // {when | delayInMinutes}

  sendResponse({alarmId: request.alarmId});
});

/**
 * ALARM - TRIGGERED
 *
 */
chrome.alarms.onAlarm.addListener(function(alarm) {

  // If an alarm is triggered, a notification will appear in the icon
  // badge indicating there's an expiration to be dealt with.

  // The expiration's count will persist in the icon badge text until
  // the extension is opened and the expiration item is either;
        // 1. deactivated,
        // 2. deleted, or,
        // 3. updated to reflect a new valid expiration.

  // Badge Text Updates -- also performed in [popup.js]
  chrome.browserAction.getBadgeText({}, function(result) {
    let newerCount = (
          typeof(result) === 'undefined' || isNaN(parseInt(result, 10))
        ) ? 1 : parseInt(result, 10) + 1;
    chrome.browserAction.setBadgeText({text: newerCount.toString() });
  });
});

/**
 * STORAGE - GET / ICON BADGE TEXT UPDATES (for expired alarms)
 *
 * This code will execute on browser startup (if extension is active).
 *
 */
chrome.storage.sync.get('expiresList', itemList => {
  // Semi-replicated storage retrieval code from [popup.js]

  if (!isEmpty(itemList.expiresList)) { // Only do anything if there is an `expiresList` object.
    let alarmList = [],
        allItemsMap = new Map();

        // We need a Map() so we can loop through each item in storage,
        // not just those with alarms (from the alarmList array of Promises).

        // We also need a Map() so the `Promise.all` (below) has access
        // to each `configObj`, which has everything they need.

    itemList.expiresList.forEach( item => {
      let configObj = {},
          getBetweenObj = {}; // {delay, between}

      configObj = {...item};
      configObj.hasAlarm = false;
      configObj.dateValueArr = item.date.split('-');
      configObj.delay = getDelay(item.leadTime, item.leadTimeVal);

      // Need the top two values first in order to get both the 'newThen' and 'between'.
      getBetweenObj = getBetween(configObj.dateValueArr, configObj.delay);

      // Now that we've got that object, we can assign them respectively.
      configObj.newThen = getBetweenObj.newThen;
      configObj.between = getBetweenObj.between;

      allItemsMap.set( item.id, configObj );   // Add to Map() for `Promise.all` (below)
      alarmList.push( requestAlarm(item.id) ); // Add to array for `Promise.all` (below)
    });

    /**
     * ALARMS - UPDATE ICON BADGE TEXT
     *
     * IF an alarm exists (it'll be in the `alarmList` array)
     *    && expiration has expired (between <= 0)
     *    && item is active (active === true).
     *
     */
    Promise.all(alarmList).then((results) => {
      // do something on fulfilled

      let indexCount = 0,
          badgeTextCount = 0;

      allItemsMap.forEach( (val, key) => {

        // val: undefined | {id, active, ...}

        // Set by default: configObj.hasAlarm = true;

        let promiseConfigObj = allItemsMap.get(key);

        if (typeof(results[indexCount]) === 'undefined') {
          // Undefined; No alarm.

          /*
            Expiration    Alarm Active
            > 0 (good)    x     x       1   [ x ] All Good
            > 0 (good)    x     -       2   [ x ] Turning off active – Need to delete alarm
            > 0 (good)    -     x       3   [n/a] Can't be good without an alarm, unless deactivated (#4).
            > 0 (good)    -     -       4   [ x ] Manually turned off.
            <= 0          x     x       5   [n/a] Should be no alarm after expiration; Then it's the same as #7.
            <= 0          x     -       6   [n/a] Should be no alarm after expiration; Then it's the same as #8.
            <= 0          -     x       7   [ x ] Badge + Item Highlight
            <= 0          -     -       8   [ x ] Waiting for an edit or removal.
          */

          if (promiseConfigObj.between <= 0 && promiseConfigObj.active === true) {
            // Expired; but still active.
            badgeTextCount++;
          }
        } else {
          // Alarm is set.
          promiseConfigObj.hasAlarm = true;

          allItemsMap.set( key, promiseConfigObj );
          // Although at this point we never use Map `allItemsMap` again,
          // it's a good idea to keep it updated for potential future use.
        }

        indexCount++;
      });
      badgeTextCount = (badgeTextCount === 0) ? '' : badgeTextCount.toString();
      chrome.browserAction.setBadgeText({text: badgeTextCount });
    });
  }
});

function requestAlarm(itemId) {
  return new Promise((resolve, reject) => {
    chrome.alarms.get(
      'x2b-' + itemId,
      (alarmitem) => { resolve(alarmitem); }
    );
  });
}

// [2018-02] Although I was able to write my own async/await and
   // my first Promise [popup.js (async function getState())], I got
   // help with understanding the Promise.all() (above) from two sources:

   // Thanks to: FED Slacker [Darko Efremov (darko)] [2018-02-15 at 2:02 AM] in #javascript
   // https://frontenddevelopers.slack.com/archives/C03B41BH2/p1518688964000167

   // Also Thanks to this SO Answer: https://stackoverflow.com/a/32828546/638153

/**
 * Helper Functions
 * from [popup.js] to support
 * chrome.storage.sync.get('expiresList'
 */

function isEmpty(obj) {
  // 'Object Quick Check' thanks to: https://stackoverflow.com/a/34491966/638153
  for (var x in obj) { if (obj.hasOwnProperty(x)) return false; }
  return true;
}

function getBetween(dateValueArr, delay) {

  // Get current day's midnight (which is behind the current time, except at midnight).
  // Get expiration day's midnight (today would be same as above, but derived from form).
  // Get time between current day and expiration minus 'warn time' (deactive if negative).
  // How to create a custom date with zeroed-out time without creating a current date first?

  let rightNow = new Date(),              // Sun Feb 11 2018 21:35:47 GMT-0800 (Pacific Standard Time)
      preNow = new Date(rightNow.getFullYear(), rightNow.getMonth(), rightNow.getDate(), 0, 0, 0),
                                          // Sun Feb 11 2018 00:00:00 GMT-0800 (Pacific Standard Time)
      now = Date.parse(preNow),           // 1518336000000
      preThen = new Date(dateValueArr[0], dateValueArr[1] - 1, dateValueArr[2], 0, 0, 0), //
                                          // Sun Feb 11 2018 00:00:00 GMT-0800 (Pacific Standard Time)
      then = Date.parse(preThen),         // 1518336000000
      newThen = then - delay,             // 1518249600000
      between = newThen - now;            // -86400000

  return {newThen, between};
}

function getDelay(selectName, selectNum) {
  if (selectName === 'days') {
    return selectNum * 24 * 60 * 60 * 1000;
  } else if (selectName === 'weeks') {
    return (selectNum * 7) * 24 * 60 * 60 * 1000;
  } else {
    return 0;
  }
}
