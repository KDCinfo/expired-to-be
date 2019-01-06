/**
 * Expired To Be |  https://github.com/KDCinfo/expired-to-be
 *
 * This app allows you to enter and be reminded of expiration dates.
 * It will provide notification reminders with lead times of your choosing.
 *
 * Developer: Keith D Commiskey (https://kdcinfo.com)
 * Initial Development: 2018-02 - 2018-03
 *
 * The Expired To Be app can be used in one of two ways:
 *
 * Chrome Extension:
 *   - Notifications are passive, and will clear when expired items are reset.
 *
 * Hosted Web App (SPA):
 * - The Web App uses the 'Chrome Extension' interface code, so it has all the same interface features as the Chrome
 *   extension. However, it also uses a custom 'Alarm' system and Web-based Notifications. Having these additional
 *   features provides the Web App with a few additional options and features that the Chrome extension does not have.
 *
 * References to the `window.ourExpirations` factory function should also be provided with 'undefined' alternatives.
 *
 * At the bottom of this file is a simple representation of the elements and objects used in this extension:
 *
 */

let ourState = [],
    importErrors = [];

const maxDays = 70,
      maxWeeks = 10,
      stateLocation = 'chrome', // chrome|local|session|cookie
      TESTING = false, // Currently means you can activate an expired item, for testing 'expired notifications'.
      ourKeys = new Set(['title', 'date', 'leadTime', 'leadTimeVal']), // No: 'id', 'active'
      sampleJSON = '[{"id": 1, "title": "My 1st reminder.", "date": "2033-03-10", "dateReplacement": "", "leadTime": "days", "leadTimeVal": "1"}, {"id": 2, "title": "My 2nd reminder.", "date": "2033-03-16", "dateReplacement": "2033-04-16", "leadTime": "weeks", "leadTimeVal": "1"}]';

const isExtension = !document.getElementById('web-root'), // Only run with either the extension, or the React-based web app.
      changeEvent = new Event('change'),
      inputSelectName = document.querySelector('.input-select-name'), // selName
      inputSelectNum = document.querySelector('.input-select-num');   // selNum

function displayIt() { // [window|document].onload = function() {}

  document.querySelector('.input-date-expiry').value = setDate(); // input-date

  //
  // Set Listeners
  //

  document.addEventListener('click', (e) => {
    // Thanks to:
       // https://stackoverflow.com/a/35294561/638153
       // https://css-tricks.com/dangers-stopping-event-propagation/
       // https://developer.mozilla.org/en-US/docs/Web/API/Element/closest

    // if (e.defaultPrevented) return;

    if (!e.target.closest('.footer-menu-toggle-button') &&
        !e.target.closest('.footer-menu-div') &&
        !e.target.closest('.footer-prefs-toggle-button') &&
        !e.target.closest('.footer-prefs-div') &&
        !e.target.closest('#button-toggle-webapp-help') &&
        !e.target.closest('#app-message')) {
      toggleMenu('close');
    }
    // return; // No returns; let it pass through.
  });

  // <button>: Save
  document.querySelector('.input-save').addEventListener('click', (e) => {
    e.preventDefault();
    saveChanges();
  });

  // <button>: Reset
  document.querySelector('.input-reset').addEventListener('click', (e) => {
    e.preventDefault();
    let itemId = parseInt(e.target.parentNode.querySelector('.input-id').value, 10);
    updateForm(itemId);
  });

  // <button>: Clear
  document.querySelector('.input-new').addEventListener('click', (e) => {
    e.preventDefault();
    setItemEdit();
    updateForm();
  });

  // document
  // <div>: List Options
  document.querySelector('.footer-menu-toggle-button').addEventListener('click', (e) => {
    toggleMenu();
  });

  // <button>: Clear All
  document.getElementById('input-clear-all').addEventListener('click', (e) => {
    clearTimersAndStorage();
  });

  // <button>: Export All
  document.getElementById('input-export-all').addEventListener('click', (e) => {
    exportTimers();
  });

  // <button>: Import - Toggle Import Options
  document.getElementById('input-import-button').addEventListener('click', (e) => {
    showImportTextarea();
  });

  // <button>: Import - Execute Import
  document.querySelector('#input-import-action').addEventListener('click', (e) => {
    importTimersRun();
  });

  // <a>: Import - fillSampleJSON
  document.getElementById('fillSampleJSON').addEventListener('click', (e) => {
    e.preventDefault();
    importSamples();
  });

  // <select class="input-select-name" required>
  inputSelectName.addEventListener('change', (e) => {
    if (e.target.value === 'days') {
      inputSelectNum.setAttribute('max', maxDays);
    } else {
      inputSelectNum.setAttribute('max', maxWeeks);
      if (inputSelectNum.value > maxWeeks) {
        inputSelectNum.value = maxWeeks;
      }
    }
  });

  storeStateLocal(showList); // Store Chrome Storage locally, then display the list (if any).
}

/**
 * Let the FUN Begin!!
 */

if (isExtension) {

  document.addEventListener('DOMContentLoaded', displayIt, false);
  // window.onload = function() {
  // displayIt();

} else {
  let checkIt = () => {
    let testObj = document.querySelector('.input-date-expiry');

    if (typeof(testObj) === 'undefined') {
      // Let's give it a 10th of a second (or more) in case there's a holdup.
      // This will also push our call to the end of the call stack (sort of).
      setTimeout( () => {
        checkIt();
      }, 100);
    } else {
      // We need to push the `displayIt` fn call to the event queue;
      // and let the call stack finish doing its thing.
      setTimeout( () => { displayIt(); }, 1000);

      // I really, really hate putting this ^^^ 1-second timeout here,
      // but when it was 0, the 'Applying Prefs' wouldn't run until after
      // the `runPassiveNotification()`, which throws off timer creations.
      // I tried moving this `displayIt()` over to `index.tsx`, but fn() not found.
    }
  };
  checkIt();
}

const x2bStorage = (function() {
  return {
    get: async function(whichStore) { // x2bStorage.get

      if (isGood('chrome') && isGood('chrome.storage') && isGood('chrome.storage.sync')) {

        return new Promise( (resolve, reject) => {
          chrome.storage.sync.get(whichStore, itemList => {
            resolve(itemList);
          });
        });

      } else if (isGood('window.localStorage')) {

        return new Promise( (resolve, reject) => {
          const storedTimerList = getStorageItem(localStorage, whichStore); // Returned item is: `JSON.parse()`'d
          resolve(storedTimerList);
        });

      } else {
        return new Promise( (resolve, reject) => {
          alert('Your browsing device has no local storage (i.e., no data persistence.) ' +
                'You can still run the app, but nothing will be saved when you leave.'); // try cookies?
          resolve({[whichStore]: ourState});
        });
      }
    },
    set: function(storeObj) {

      // [ourState] is updated prior to 'x2bStorage.set' being called.

      let msgDone = '',
          whichList = 'expiresList',
          whichData, // Can/will either be an array [] or an object {}
          isPrefs = false,
          isSortUpdate = false;

      whichData = ourState;

      if (typeof(storeObj.isLastImport) !== 'undefined') {
        finishImport();

      } else if (typeof(storeObj.prefsObj) !== 'undefined') {

        // Currently, this should ONLY be used by the SPA.

        if (storeObj.isNew !== true) {
          msgDone = message('Your preferences have been updated.', true);
        }
        isPrefs = true;
        whichList = 'expiresPrefs';
        whichData = Object.assign({}, ourExpirations.getPrefs(), storeObj.prefsObj);
        // console.log('Hope this combines and updates ourExpirations.getPrefs() objects.', storeObj.prefsObj, whichData);

      } else if (typeof(storeObj.newPrefObj) !== 'undefined') { // x2bStorage.set()

        // Currently, this is only used to update the sorting preference (once a sort is clicked).

        // msgDone = message('Your preferences have been updated.', true); // No message; let it sort and record it.
        isPrefs = true;             // We're just sorting -- it's already looping through the showList()
        isSortUpdate = true;
        whichList = 'expiresPrefs'; // chrome.storage.sync.remove('expiresPrefs')

        if (typeof ourExpirations !== 'undefined') {
          whichData = Object.assign({}, ourExpirations.getPrefs(), storeObj.newPrefObj);
                                     // ourExpirations.getPrefs() --> is synchronous
                                     // typeof ourExpirations === isGood('chrome.storage.sync')
        } else {
          whichData = Object.assign({}, storeObj.newPrefObj);
        }

      } else if (storeObj.id === 0) {
        msgDone = message('Your expiration item was successfully created.', false);
      } else if (storeObj.id < 0) {
        msgDone = message('Your expiration item was successfully removed.', false);
      } else {
        msgDone = message('Your expiration item was successfully updated.', false);
      }

      if (isGood('chrome') && isGood('chrome.storage') && isGood('chrome.storage.sync')) {

        // Save it using the Chrome extension storage API.
        chrome.storage.sync.set({[whichList]: whichData}, () => {
          msgDone;
          if (!isPrefs) {
            showList();
          } else if (isSortUpdate) {
            showList('', true); // '' = close any open menus; true = don't update alarms
          }
        });

      } else if (isGood('window.localStorage')) {

        setStorageItem(localStorage, whichList, JSON.stringify(whichData)); // Local Storage is synchronous.
        msgDone;
        if (!isPrefs) {
          showList();
        } else if (isSortUpdate) {
          showList('', true); // '' = close any open menus; true = don't update alarms
        }
      }
    },
    clear: function(thisId) { // x2bStorage.clear
      // Use instead: x2bStorage.set(-1);
      x2bStorage.set({id: -1});
    },
    which: function() {
      return stateLocation; // Possible future use, or termination.
    }
  };
})(); // <-- Does not work without IIFE (same with how MDN wrote 'LocalStorageState' interface (far below).)

function importSamples() {
  document.getElementById('input-import').value = sampleJSON;
}

function finishImport() {
  let finalImportMsg = importErrors.join(' ');
  finalImportMsg += ' Import Successful !!!';
  message(finalImportMsg, true);

  toggleProgressBar('off');
}

function toggleProgressBar(which = 'off') {

  let progressBarElement = document.getElementById('import-progress');

  if (which === 'off') {

    setTimeout( () => {
      progressBarElement.classList.remove('opacity100');
      progressBarElement.classList.add('opacity0');
      setTimeout( () => {
        progressBarElement.classList.add('hidden');
      }, 500);
    }, 1000);

  } else {
    progressBarElement.classList.remove('hidden');

    setTimeout( () => {
      progressBarElement.classList.remove('opacity0');
      progressBarElement.classList.add('opacity100');
    }, 1); // Near-after hidden is removed, the element will take up space on screen, then fade in.
  }
}

function storeStateLocal(thenFunc) {
  getState().then( data => {

    if (data && data.length > 0) {

      ourState = ourState.concat(data);

      if (thenFunc) {
        thenFunc.call();
        // I'd never done this before, but I just plugged it in as
        // I imagined it should go and it just worked - like cool!
      }
    }
  });
}

async function getState() {
  // Get current timers (array of objects)

  // This (getState function) should only be called once on page load; then stored locally.
  // Both local and storage will be updated together.

  return new Promise( (resolve, reject) => {
    x2bStorage.get('expiresList').then( itemList => {

      let returnIt = [];

      if (!isEmpty(itemList.expiresList)) {
        // This only runs on initial page load through 'storeStateLocal'
        message('Or you can edit your items from below.', false);

        returnIt = returnIt.concat(itemList.expiresList);
      }
      resolve(returnIt);
    });
  });
}

function runPassiveNotification(stat = '', noMsg = '') {
  // console.log('runPassiveNotification: ', stat, noMsg, noMsg.length);

  if (stat.length > 0) {

    let passiveMsg = 'You have ' + stat + ' expired item';
    if (stat === '1') { // Ternary wouldn't work... :(
      passiveMsg = passiveMsg + '.';
    } else {
      passiveMsg = passiveMsg + 's.';
    }
    if (noMsg.length === 0) {
      message(passiveMsg, false);
    }
  }

  if (isGood('chrome') && isGood('chrome.browserAction')) {
    chrome.browserAction.setBadgeText({text: stat}); // Updated Via: Alarms (eventPage) and showList()
  } else {
    updateFavIcon(stat);
  }
}

function updateFavIcon(stat = '') {
  // This function per and thanks to:
  // https://stackoverflow.com/questions/260857/changing-website-favicon-dynamically#answer-2995536

  document.head = document.head || document.getElementsByTagName('head')[0];

  var link = document.createElement('link'),
      oldLink = document.getElementById('dynamic-favicon');

  link.id = 'dynamic-favicon';
  link.rel = 'shortcut icon';

  if (stat.length > 0) {
    // link.href = '%PUBLIC_URL%/icon32.png';
    link.href = 'iconx32.png';
    document.title = '[x] EXPIRED Item Alert !!!';
  } else {
    link.href = 'icon32.png';
    document.title = 'Expired To Be: Expiration Reminders'; // From [index.html]
  }

  if (oldLink) {
    document.head.removeChild(oldLink);
  }

  document.head.appendChild(link);
}

function showList(noClose = '', prefUpdate = false) { // showList('', true) // Sorting

  if (noClose.length === 0) {
    toggleMenu('close');
  }

  clearDOMList();

  runPassiveNotification(); // Clear expired alarm notifications

  if (ourState.length > 0) {

    if (!prefUpdate) {
      // Turn on the 'Clear All' and 'Export All' buttons.
      let inputOptions = document.querySelectorAll('.input-options-with-items');
      for (let i = 0; i < inputOptions.length; i++) {
        inputOptions[i].style.display = 'inline-block';
      }
    }

    let sortState = ourState.slice(),
        alarmList = [];

    x2bStorage.get('expiresPrefs').then( prefsList => {

      const sortColumns = ['title', 'date', 'between'];

      let prefsListSort = prefsList,
          hasSort = false,
          sortColKey = '1u';  // If left at this default, this will get flipped to '1u'
                              // [column | direction] --> [1u] [1d] [2a] [2d] [3a] [3d]
                              // Column 1 = Title; 2 = Date; 3 = 'between' (calculation)

      if (typeof prefsList.expiresPrefs !== 'undefined') {
        prefsListSort = prefsList.expiresPrefs;
      }

      if (typeof prefsListSort.sortPref !== 'undefined') {
        hasSort = true;
        sortColKey = prefsListSort.sortPref;
        // console.log('prefsListSort.sortPref is set: ', prefsListSort.sortPref);
      }

      if (hasSort) {
        printListHead(prefsListSort);
      } else {
        printListHead();
      }

      let sortColNum = parseInt(sortColKey.substr(0, 1), 10),
          sortColName = sortColumns[sortColNum - 1],
          newSortDir = sortColKey.substr(1, 1); // === 'u' ? 'd' : 'u';

      // console.log('sortState: ', sortColNum, newSortDir, sortColName);

      sortState = sortState.sort( (a, b) => {
        // 0 : {id: 1, title: "My first reminder.", date: "2018-04-03", leadTime: "days", leadTimeVal: "1", ...}

        if (sortColNum === 3) {       // 'Days Left' sort based on calculations.

          const delayA = getDelay(a.leadTime, a.leadTimeVal),
                dateValueArrA = a.date.split('-'),
                newTimeA = getBetween(dateValueArrA, delayA),
                betweenA = newTimeA.between;

          const delayB = getDelay(b.leadTime, b.leadTimeVal),
                dateValueArrB = b.date.split('-'),
                newTimeB = getBetween(dateValueArrB, delayB),
                betweenB = newTimeB.between;

          if (newSortDir === 'u') {
            return parseInt(betweenA, 10) > parseInt(betweenB, 10) ? 1 : -1;
          } else {
            return parseInt(betweenA, 10) < parseInt(betweenB, 10) ? 1 : -1;
          }

        } else {                      // 'title' and 'date' sorted normally
          if (newSortDir === 'u') {
            return a[sortColName] > b[sortColName] ? 1 : -1;
          } else {
            return a[sortColName] < b[sortColName] ? 1 : -1;
          }
        }
      });

      sortState.forEach( item => {
        alarmList.push( requestAlarm(item.id) ); // chrome.alarms.get('x2b-' + itemId, callback) );
        printList(item);
      });

      // @TODO: arrow focus losing element bc elmts r being redrawn
      setItemEdit();

      /**
       * ALARMS - ADD BLUE-SUN ICON to ACTIVE CHECKBOXES for ALL ITEMS WITH ALARMS
       *
       * Cycle through all the `chrome.alarms.get()` call Promise resolutions.
       * IF an alarm exists, it'll be in the Promises `alarmList` array.
       * Outer shell of this Promise.all() is also used in eventPage.js.
       *
       */
      Promise.all(alarmList).then((results) => {
        // do something on fulfilled

        let countOrphans = 0,
            countExpired = 0,
            badgeTextCount = 0;

        results.forEach( alarm => {

          let tmpObj = sortState.find(elem => elem.id === alarm.id),
              isGoodAlarm = isGood(alarm.alarmObj);

          // alarm: undefined | {id, active, ...}

          // @TODONE: Adjusted all logic below and added dynamic DOM element updates based on alarms.

          let delay = getDelay(tmpObj.leadTime, tmpObj.leadTimeVal),
              dateValueArr = tmpObj.date.split('-'),
              newTime = {},
              between = -1,
              newThen = -1;

          if (isGoodAlarm) {
            newTime = getBetween(dateValueArr, delay, alarm.alarmObj.presetTargetTime);
          } else {
            newTime = getBetween(dateValueArr, delay);
          }
          between = newTime.between;
          newThen = newTime.newThen;

          // delay    | dateValueArr         | newTime
          // 86400000 | ["2018", "03", "27"] | {newThen: 1522048440000, between: 0}

          let canBeActive = (
                between > 0 &&
                newThen - Date.now() > 0 &&
                tmpObj.active === true
              ) ? true : false;

          // Passive notifications should only increase if alarm is invalid, and item is active.

          // canBeActive && Has alarm - printAlarm()
          // canBeActive && No alarm - Create alarm

          // !canBeActive &&
            // active && has alarm - Remove alarm (expired - should've triggered notification)
            // !active && has alarm - Remove alarm (orphan)
            // active && no alarm - Do nothing (expired)
            // !active && no alarm - Do nothing

          let trClassListItem = document.querySelector('.x2b-listitem-' + alarm.id),
              tdClassListItem = trClassListItem.querySelector('td'), // Grabs the first <td>
              spanClassListItem = tdClassListItem.querySelector('span'),
              tdBetweenItem = trClassListItem.querySelector('td.between');

          tdBetweenItem.innerText = between;

          if (canBeActive && isGoodAlarm) {
            trClassListItem.classList.remove('expired');
            spanClassListItem.classList.add('hidden');
            printAlarm(alarm.id);

          } else if (canBeActive && !isGoodAlarm) {
            trClassListItem.classList.remove('expired');
            spanClassListItem.classList.add('hidden');

            // @TODONE: This only caused a problem when the `alert()` was
            // triggered immediately due to 32-bit setTimeout() limitation.
            if (!prefUpdate) {
              createTimer(alarm.id, newThen, between).then( (newAlarm) => {
                printAlarm(alarm.id);
              });
            } else {
              // When sorting, no need to create new timers.
              printAlarm(alarm.id);
            }

          } else { // if (!canBeActive) {
            if (tmpObj.active === true && !isGoodAlarm) {
              badgeTextCount++;
              trClassListItem.classList.add('expired');
              spanClassListItem.classList.remove('hidden');

            } else if (tmpObj.active === true && isGoodAlarm) {
              // Active with Alarm; but expired...?
              badgeTextCount++;
              trClassListItem.classList.add('expired');
              spanClassListItem.classList.remove('hidden');
              deleteTimer(alarm.id).then( (wasCleared) => {
                if (typeof(wasCleared) !== 'undefined') {
                  if (countExpired === 0) {
                    message('An alarm was expired and has been removed.', false);
                  }
                  countExpired++;
                }
              });

            } else if (tmpObj.active !== true && isGoodAlarm) {
              trClassListItem.classList.remove('expired');
              spanClassListItem.classList.add('hidden');
              deleteTimer(alarm.id).then( (wasCleared) => {
                if (typeof(wasCleared) !== 'undefined') {
                  if (countOrphans === 0) {
                    message('An alarm was orphaned, and has been removed.', false);
                  }
                  countOrphans++;
                }
              });

            } else if (tmpObj.active !== true && !isGoodAlarm) {
              // Might be able to be active (but isn't); or maybe it can't be.
              trClassListItem.classList.remove('expired');
              spanClassListItem.classList.add('hidden');
            }
          }
        });

        badgeTextCount = (badgeTextCount === 0) ? '' : badgeTextCount.toString(); // Also used in [eventPage.js]

        // console.log('Promise.all: ', prefUpdate, badgeTextCount);

        if (!prefUpdate) {
          runPassiveNotification(badgeTextCount); // chrome.browserAction.setBadgeText({text: badgeTextCount });
        } else {
          runPassiveNotification(badgeTextCount, 'noMsg');
        }
      });

    }); // End of: x2bStorage.get('expiresPrefs') Promise
        // (and the enclosed printList() && Promise.all(alarmList))

  } else {
    // No expirations saved in storage.

    // Turn off the 'Clear All' and 'Export All' buttons (nothing to clear or export).
    let inputOptions = document.querySelectorAll('.input-options-with-items');
    for (let i = 0; i < inputOptions.length; i++) {
      inputOptions[i].style.display = 'none';
    }

    message('No expirations; Storage is empty.', true);
  }
}

function printAlarm(itemId) {
  let expiresTable = document.getElementById('expires-table'),
      // itemId = parseInt(alarm.name.substr(4), 10), // x2b-1
      // <tr class="x2b-listitem-1">
      //   <td><input type="checkbox" class="toggle-active active-is-true item-1">
      alarmNodeParent = expiresTable
        .querySelector('tr.x2b-listitem-' + itemId)
        .querySelector('.toggle-active')
        .parentNode,
      alarmNode = document.createElement('span');
  alarmNode.classList.add('alarm-stat', 'has-alarm');
  alarmNodeParent.appendChild(alarmNode);
}

function requestAlarm(itemId) {

  if (isGood('chrome') && isGood('chrome.alarms')) {
    return new Promise((resolve, reject) => {
      chrome.alarms.get(
        'x2b-' + itemId,
        (alarmitem) => {
          resolve({id: itemId, alarmObj: alarmitem});
        }
      );
    });
  } else {

    return new Promise((resolve, reject) => {

      const getItems = {
        id: itemId,
        whichEvent: 'setAlarms'
      };

      let checkCurrentItem = window.ourExpirations.getAlarm(itemId); // getStorage where are the alarms set?,

      if (isGood(checkCurrentItem)) {
        resolve({id: itemId, alarmObj: checkCurrentItem});
      } else {
        resolve({id: itemId, alarmObj: undefined});
      }
    });
    // return undefined; // This is what I've seen `alarms.get` return when empty.
    // chrome.alarms.get('abcd1234', alarm => console.log(alarm)) // undefined undefined
  }
}

function printListHead(prefsList) {
  let itemTCH = document.createElement('thead'),
      itemTCR = document.createElement('tr'),
      itemTCH1 = document.createElement('th'),
      itemTCH1D = document.createElement('div');
      itemTCH1L = document.createElement('span'),
      itemTCH1R = document.createElement('span'),
      itemTCH1Ru = document.createElement('a'),
      itemTCH1Rd = document.createElement('a'),
      itemTCH2 = document.createElement('th'),
      itemTCH2D = document.createElement('div');
      itemTCH2L = document.createElement('span'),
      itemTCH2R = document.createElement('span'),
      itemTCH2Ru = document.createElement('a'),
      itemTCH2Rd = document.createElement('a'),
      itemTCH3 = document.createElement('th'),
      itemTCH4 = document.createElement('th'),
      itemTCH5 = document.createElement('th'),
      itemTCH5D = document.createElement('div');
      itemTCH5L = document.createElement('span'),
      itemTCH5R = document.createElement('span'),
      itemTCH5Ru = document.createElement('a'),
      itemTCH5Rd = document.createElement('a'),
      itemTCH6 = document.createElement('th'),
      itemTCH6S = document.createElement('span'),
      itemTCH7 = document.createElement('th'),
      itemTCH8 = document.createElement('th'),
      itemTB = document.createElement('tbody'),
      sortArrowActive = '1u';

      if (typeof prefsList !== 'undefined' && typeof prefsList.sortPref !== 'undefined') {
        if (prefsList.sortPref === '3d') { // 5th column; 3rd sortable column
          itemTCH5Rd.classList.add('active');
          sortArrowActive = '3d';
        } else if (prefsList.sortPref === '3u') {
          itemTCH5Ru.classList.add('active');
          sortArrowActive = '3u';
        } else if (prefsList.sortPref === '2d') {
          itemTCH2Rd.classList.add('active');
          sortArrowActive = '2d';
        } else if (prefsList.sortPref === '2u') {
          itemTCH2Ru.classList.add('active');
          sortArrowActive = '2u';
        } else if (prefsList.sortPref === '1d') {
          itemTCH1Rd.classList.add('active');
          sortArrowActive = '1d';
        } else { // if (prefsList.sortPref === '1u') {
          itemTCH1Ru.classList.add('active');
        }
      } else {
        itemTCH1Ru.classList.add('active');
      }

      if (!isExtension && window.ourExpirations.getPrefs().showPanel) {
        itemTCH1L.innerHTML = '<small>[ID]</small> Title';
      } else {
        itemTCH1L.innerText = 'Title';
      }
        itemTCH1.classList.add('text-left');
        itemTCH1L.classList.add('paginate-title');
        itemTCH1R.classList.add('paginate');
        itemTCH1Ru.classList.add('arrow-up');
        itemTCH1Rd.classList.add('arrow-down');
          itemTCH1Ru.name = '1u';
          itemTCH1Rd.name = '1d';
          itemTCH1Ru.innerHTML = '&#x25b2';
          itemTCH1Rd.innerHTML = '&#x25bc';
            if (sortArrowActive !== '1u') {
              itemTCH1Ru.setAttribute('aria-label', 'Sort by: Title - Ascending');
              itemTCH1Ru.setAttribute("tabindex", "0");
              itemTCH1Ru.addEventListener('click', (e) => {
                sortRun(e.target.name, true); // true = isClick
              });
              itemTCH1Ru.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key.toLowerCase() === 'enter') {
                  e.preventDefault();
                  sortRun(e.target.name);
                }
              });
            }
            if (sortArrowActive !== '1d') {
              itemTCH1Rd.setAttribute('aria-label', 'Sort by: Title - Descending');
              itemTCH1Rd.setAttribute("tabindex", "0");
              itemTCH1Rd.addEventListener('click', (e) => {
                sortRun(e.target.name, true); // true = isClick
              });
              itemTCH1Rd.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key.toLowerCase() === 'enter') {
                  e.preventDefault();
                  sortRun(e.target.name);
                }
              });
            }
          itemTCH1R.appendChild(itemTCH1Ru);
          itemTCH1R.appendChild(itemTCH1Rd);
          itemTCH1D.appendChild(itemTCH1R);
          itemTCH1D.appendChild(itemTCH1L);
          itemTCH1.appendChild(itemTCH1D);
        itemTCR.appendChild(itemTCH1);

      itemTCH2L.innerText = 'Date';
        itemTCH2.classList.add('text-left');
        itemTCH2L.classList.add('paginate-title');
        itemTCH2R.classList.add('paginate');
        itemTCH2Ru.classList.add('arrow-up');
        itemTCH2Rd.classList.add('arrow-down');
          itemTCH2Ru.innerHTML = '&#x25b2';
          itemTCH2Rd.innerHTML = '&#x25bc';
          itemTCH2Ru.name = '2u';
          itemTCH2Rd.name = '2d';
            if (sortArrowActive !== '2u') {
              itemTCH2Ru.setAttribute('aria-label', 'Sort by: Date - Ascending');
              itemTCH2Ru.setAttribute("tabindex", "0");
              itemTCH2Ru.addEventListener('click', (e) => {
                sortRun(e.target.name, true); // true = isClick
              });
              itemTCH2Ru.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key.toLowerCase() === 'enter') {
                  e.preventDefault();
                  sortRun(e.target.name);
                }
              });
            }
            if (sortArrowActive !== '2d') {
              itemTCH2Rd.setAttribute('aria-label', 'Sort by: Date - Descending');
              itemTCH2Rd.setAttribute("tabindex", "0");
              itemTCH2Rd.addEventListener('click', (e) => {
                sortRun(e.target.name, true); // true = isClick
              });
              itemTCH2Rd.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key.toLowerCase() === 'enter') {
                  e.preventDefault();
                  sortRun(e.target.name);
                }
              });
            }
          itemTCH2R.appendChild(itemTCH2Ru);
          itemTCH2R.appendChild(itemTCH2Rd);
          itemTCH2D.appendChild(itemTCH2R);
          itemTCH2D.appendChild(itemTCH2L);
          itemTCH2.appendChild(itemTCH2D);
        itemTCR.appendChild(itemTCH2);

      itemTCH3.innerHTML = 'Lead<br/>Time';
        itemTCR.appendChild(itemTCH3);
      itemTCH4.innerHTML = 'Days/<br/>Weeks';
        itemTCR.appendChild(itemTCH4);

      itemTCH5L.innerHTML = 'Days<br/>Left';
        itemTCH5.classList.add('text-left');
        itemTCH5L.classList.add('paginate-title');
        itemTCH5R.classList.add('paginate');
        itemTCH5Ru.classList.add('arrow-up');
        itemTCH5Rd.classList.add('arrow-down');
          itemTCH5Ru.innerHTML = '&#x25b2';
          itemTCH5Rd.innerHTML = '&#x25bc';
          itemTCH5Ru.name = '3u'; // 5th column; 3rd sortable column
          itemTCH5Rd.name = '3d';
            if (sortArrowActive !== '3u') {
              itemTCH5Ru.setAttribute('aria-label', 'Sort by: Days Left - Ascending');
              itemTCH5Ru.setAttribute("tabindex", "0");
              itemTCH5Ru.addEventListener('click', (e) => {
                sortRun(e.target.name, true); // true = isClick
              });
              itemTCH5Ru.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key.toLowerCase() === 'enter') {
                  e.preventDefault();
                  sortRun(e.target.name);
                }
              });
            }
            if (sortArrowActive !== '3d') {
              itemTCH5Rd.setAttribute('aria-label', 'Sort by: Days Left - Descending');
              itemTCH5Rd.setAttribute("tabindex", "0");
              itemTCH5Rd.addEventListener('click', (e) => {
                sortRun(e.target.name, true); // true = isClick
              });
              itemTCH5Rd.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key.toLowerCase() === 'enter') {
                  e.preventDefault();
                  sortRun(e.target.name);
                }
              });
            }
          itemTCH5R.appendChild(itemTCH5Ru);
          itemTCH5R.appendChild(itemTCH5Rd);
          itemTCH5D.appendChild(itemTCH5R);
          itemTCH5D.appendChild(itemTCH5L);
          itemTCH5.appendChild(itemTCH5D);
        itemTCR.appendChild(itemTCH5);

      itemTCH6S.innerText = 'Alarm';
      itemTCH6.innerHTML = '<span class="alarm">Alarm/</span><br/>Active';
        itemTCR.appendChild(itemTCH6);

      itemTCH7.innerText = '';
        itemTCR.appendChild(itemTCH7);
      itemTCH8.innerText = '';
        itemTCR.appendChild(itemTCH8);

  itemTCH.appendChild(itemTCR);

  let parentTable = document.getElementById('expires-table'); // <table>

  parentTable.appendChild(itemTCH);
  parentTable.appendChild(itemTB);
}

function sortRun(setObj, isClick = false) { // sortRun(true); // If mouse, remove focus from clicked arrow element.
  x2bStorage.set({newPrefObj: {sortPref: setObj}});

  let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  // let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    // ^^^ https://stackoverflow.com/questions/1248081/get-the-browser-viewport-dimensions-with-javascript/36132694#36132694
    // ^^^ Not the most reliable, but should work in normal case scenarios
    // ... just don't test with Chrome emulator :)

  if (isClick && w > 500) {
    document.getElementById('entryTitle').focus();
  }
}

function printList(item) {
  let itemTR = document.createElement('tr'),
      itemSpan1 = document.createElement('td'), // 1 :title
      itemSpan1Overlay = document.createElement('span'), // Expiration notification over title
      itemSpan2 = document.createElement('td'), // 2 :dateValue
      itemSpan2Overlay = document.createElement('span'), // 'Replacement Date' indicator over Expiry field
      itemSpan3 = document.createElement('td'), // 3 :leadTimeVal
      itemSpan4 = document.createElement('td'), // 4 :leadTime
      itemSpan5 = document.createElement('td'), // 5 :between
      itemSpan6 = document.createElement('td'), // 6 <Active>
      itemSpan6Container = document.createElement('span'), // Container for active and blue sun
      itemSpan7 = document.createElement('td'), // 7 <Edit>
      itemSpan8 = document.createElement('td'); // 8 <Delete>

  let trClassList = ['x2b-listitem-' + item.id];

  itemTR.classList.add(...trClassList);
    itemSpan1Overlay.innerText = 'Expired!';
    itemSpan1.innerText = htmlUnescape(item.title);
      itemSpan1.classList.add('cellCol1');
      itemSpan1.appendChild(itemSpan1Overlay);

      if (!isExtension) {
        let itemSpan1ID = document.createElement('small');
        itemSpan1ID.innerText = '[' + item.id + '] '; // Do NOT modify this w/o adjusting TestCafe tests.
        if (window.ourExpirations.getPrefs().showPanel) {
          itemSpan1.title = 'Item ID: [x2b-' + item.id + ']';
          itemSpan1ID.classList.remove('hidden');
        } else {
          itemSpan1.title = 'ID: ' + item.id;
          itemSpan1ID.classList.add('hidden');
        }
        itemSpan1.insertBefore(itemSpan1ID, itemSpan1.firstChild);
      }

    itemSpan2.innerText = item.date;
      itemSpan2.classList.add('cellCol2');
      if (typeof item.dateReplacement !== 'undefined' && item.dateReplacement.length > 0) {
        itemSpan2Overlay.innerText = '\u2713'; // \u0252 \u2713 \u2714
          itemSpan2Overlay.title = 'Click to apply your backup date.';
          itemSpan2Overlay.classList.add('date-replace', 'item-' + item.id); // item-1
          itemSpan2Overlay.setAttribute("tabindex", "0");
          // <span title="Click to apply your backup date." class="date-replace item-1" tabindex="0">✓</span>
          itemSpan2Overlay.addEventListener('click', (e) => { // date replace
            itemUpdate(e);
          });
          itemSpan2.appendChild(itemSpan2Overlay);
      }

    itemSpan3.innerText = item.leadTimeVal;
    itemSpan4.innerText = item.leadTime;

    itemSpan5.classList.add('between');
    // itemSpan5.innerText = itemBetween; // Should be a whole number: calc is done in getBetween()

  itemTR.appendChild(itemSpan1);
  itemTR.appendChild(itemSpan2);
  itemTR.appendChild(itemSpan3);
  itemTR.appendChild(itemSpan4);
  itemTR.appendChild(itemSpan5);

  // <input class="toggle-active" type="checkbox" checked />
    itemSpan6Input = document.createElement('input');
      itemSpan6Input.type = 'checkbox';
      itemSpan6Input.checked = item.active ? true : false;
      itemSpan6Input.classList.add('toggle-active', 'active-is-' + item.active, 'item-' + item.id);
      itemSpan6Input.addEventListener('click', toggleActive);
      // `click` listener works for spacebar toggle also.

    itemSpan6Container.classList.add('container-active-alarm');
    itemSpan6Container.appendChild(itemSpan6Input);
    // This is where the 'alarm set' overlay would have gone... (will now go post-table creation).
    itemSpan6.appendChild(itemSpan6Container);

  itemTR.appendChild(itemSpan6);

  // <span><button class="edit">Edit</button></span>
    itemSpan7Button = document.createElement('button');
      itemSpan7Button.classList.add('edit', 'item-' + item.id);
      itemSpan7Button.innerText = 'Edit';
      itemSpan7Button.addEventListener('click', itemUpdate);

    itemSpan7.appendChild(itemSpan7Button);

  itemTR.appendChild(itemSpan7);

  // <span><button class="delete">Delete</button></span>
    itemSpan8Button = document.createElement('button');
      itemSpan8Button.classList.add('delete', 'item-' + item.id);
      itemSpan8Button.innerText = 'Del';
      itemSpan8Button.addEventListener('click', itemUpdate);

    itemSpan8.appendChild(itemSpan8Button);

  itemTR.appendChild(itemSpan8);

  let parentTable = document.querySelector('#expires-table tbody'); // <table>

  parentTable.appendChild(itemTR); // Adding the current item from global array of items
}

function toggleActive(e) {
  // classList = ['toggle-active', 'item-' + item.id]

  message('', true); // Clear message/notification board (div)

  let eChecked = e.target.checked.toString(),
      eTargetChecked = e.target.checked,
      thisId = parseInt(
                 Array.from(e.target.classList)
                      .find(thisClass => thisClass.substr(0, 5) === 'item-')
                      .substr(5),
                 10);

  let itemCurState = Array.from(e.target.classList)
                          .find(thisClass => {
                              // console.log('itemCurState: [', thisClass, '] [', thisClass.substr(0,10), ']');
                              // itemCurState: [ toggle-active ] [ toggle-act ]
                              // itemCurState: [ active-is-true ] [ active-is- ]
                              return thisClass.substr(0, 10) === 'active-is-';
                            })
                          .substr(10); // 'true'|'false'

  // If `active` was off, `.checked` will be true.
  if (eChecked !== itemCurState) {
    // Should always be true; unless there is a way (in some browser)
    // to click the checkbox without changing its checked status.

    let stateItem = ourState.find(stateObj => stateObj.id === thisId),
        stateItemIdx = ourState.findIndex(stateObj => stateObj.id === thisId);

        // [stateItem] = {active: true, date: "2018-03-14", id: 1, leadTime: "weeks", leadTimeVal: "2", …}
        // [stateItemIdx] = [ 0 ]

    if (stateItem.active === true) {

      deleteTimer(thisId).then( (wasCleared) => {
        passthruUpdateStorage(stateItem, stateItemIdx, eTargetChecked, false); // false = not creating a timer
        if (typeof(wasCleared) !== 'undefined') {
          message('Your alarm has been removed.', false);
        }
      });

    } else { // active === false

      let delay = getDelay(stateItem.leadTime, stateItem.leadTimeVal),
          dateValueArr = stateItem.date.split('-'),
          newTime = getBetween(dateValueArr, delay),
          between = newTime.between,
          newThen = newTime.newThen;

      let canBeActive = (between > 0) ? true : false;

      if (canBeActive) {
        // This is an asycnronous call and is completely independent of the `state` and `storage` updates below.
        createTimer(thisId, newThen, between).then( (newAlarm) => {

          passthruUpdateStorage(stateItem, stateItemIdx, eTargetChecked, true); // true = creating a timer

          if (typeof(newAlarm) !== 'undefined') {
            message('An alarm was created for your item.', false); // , newAlarm.alarmId
          }
        });
      } else {
        if (TESTING) {
          passthruUpdateStorage(stateItem, stateItemIdx, eTargetChecked, true); // true = creating a timer
          message('TEST MODE: Saved; but an alarm was not created for your item.', false); // , newAlarm.alarmId
        } else {
          e.preventDefault(); // We're not creating an alarm or updating the state; don't toggle checkbox.
          message('Cannot create and activate an expired alarm. Please set a lead time that is at least 1 day ahead.', false);
        }
      }
    }
  }
}

function passthruUpdateStorage(stateItem, stateItemIdx, itemActive, withTimer) {
  // `passthruUpdateStorage` was created to enforce DRY on 2 calls from the `toggleActive()` function (above).
  let localStateItem = stateItem,
      newState = ourState.slice();

  localStateItem.active = itemActive;               // Update relevant storage item.
  newState.splice(stateItemIdx, 1, localStateItem); // Overwrite it in the newState.
  ourState = newState;                              // Update global ourState.

  // updateStorageWithState(localStateItem.id);     // Update '.sync' storage.
  x2bStorage.set({id: localStateItem.id});
}

function itemUpdate(e) {
  // itemEdit:  <button class=​"edit item-4">Edit</button>​
  // itemDelete:  <button class=​"delete item-4">​Del​</button>​
  e.preventDefault();

  let whichFunc = e.target.innerText.substr(0, 3).toLowerCase(), // [edi|del]
      itemId = parseInt(Array.from(e.target.classList).find(thisClass => thisClass.substr(0, 5) === 'item-').substr(5), 10);

  if (whichFunc === 'edi') {
    updateForm(itemId);
  }

  if (whichFunc === 'del') {
    clearItem(itemId);
  }

  if (e.target.innerText.length === 1) {
    // e.target.innerText === '✓'
    if (window.confirm('Click OK if you are certain you\'d like to replace your expiration date with your replacement date (thus removing your replacement date).')) {
      patchItem(itemId);
    }
  }
}

function updateForm(itemId) {
  if (itemId) {
    let ourObj = ourState.find(item => item.id === itemId);

    // max

    document.querySelector('.input-id').value = itemId;
    document.querySelector('.input-date-expiry').value = ourObj.date; // input-date
    document.querySelector('.input-date-replacement').value = ourObj.dateReplacement; // input-date
    document.querySelector('.input-title').value = htmlUnescape(ourObj.title); // input-title
    inputSelectNum.value = ourObj.leadTimeVal; // input-select-num
    inputSelectName.value = ourObj.leadTime; // input-select-name
    inputSelectName.dispatchEvent(changeEvent);
    // document.querySelector('.input-select-name').checked = ourObj.active; // The logic for this is done on save.

    setItemEdit(itemId);
  } else {
    document.querySelector('.input-id').value = 0;
    document.querySelector('.input-date-expiry').value = setDate(); // input-date
    document.querySelector('.input-date-replacement').value = '';
    document.querySelector('.input-title').value = ''; // input-title
    inputSelectNum.value = 1; // input-select-num
    inputSelectName.value = 'weeks'; // input-select-name
    inputSelectName.dispatchEvent(changeEvent);
    document.querySelector('.input-title').focus();

    setItemEdit();
  }
}

function setItemEdit(itemId) {
  // Apply CSS class name to TR of the item that's currently in the form (if >0).
  let expiresTable = document.getElementById('expires-table'),
      ourItemId = 0;

  // First; Remove any previous Edits (Recursive CSS Class Removal)
  let trEdit = expiresTable.querySelector('tr[class^="x2b-listitem"].is-edit');
  while (trEdit) {
    trEdit.classList.remove('is-edit');
    trEdit = expiresTable.querySelector('tr[class^="x2b-listitem"].is-edit');
  }

  // Second; Let's make it editable!
  let formItemId = parseInt(document.querySelector('.input-id').value, 10);
    // We will try to highlight the param's `itemId` first ('Edit' button was clicked).
    // If no `itemId` was passed, and we're just clearning the board,
    // reset to whatever item is in the form, if any, else 0.
  if (!itemId && formItemId > 0) {
    ourItemId = formItemId;
  } else if (itemId) {
    ourItemId = itemId;
  } else {
    ourItemId = 0;
  }

  if (ourItemId > 0) {
    expiresTable
      .querySelector('tr.x2b-listitem-' + ourItemId)
      .classList
      .add('is-edit');
  }
}

function saveChanges(itemToSave = {}, lastImport) {

  // The 'import' function is the only reference that passes a param to saveChanges().
  const isImport = typeof(itemToSave.title) !== 'undefined';

  let itemId,
      dateValue,
      dateRepValue,
      textTitle,
      selectNum,
      selectName,
      itemIdOrig;

  if (!isImport) {
    // Get a value saved in a form.
    itemId = document.querySelector('.input-id').value;
    textTitle = document.querySelector('.input-title').value; // input-title
    dateValue = document.querySelector('.input-date-expiry').value;
    dateRepValue = document.querySelector('.input-date-replacement').value;
    selectName = inputSelectName.value;                       // input-select-name
    selectNum = inputSelectNum.value;                         // input-select-num
    itemIdOrig = parseInt(itemId, 10);

  } else {
    // Importing: Optional ID, no Active (determined below)

    let idToUse = '0';
    if (typeof(itemToSave.id) !== 'undefined') { // Check for an ID that's passed in.

      // If an item exists in `ourState`, zero out the ID and get a new one. Else, use it.
      let getItem = ourState.find(item => item.id === itemToSave.id);

      if (getItem === undefined) {
        idToUse = itemToSave.id.toString();
      }
    }
    itemId = idToUse; // "number" (number in a string).

    textTitle = itemToSave.title;
    dateValue = itemToSave.date;
    dateRepValue = itemToSave.dateReplacement;
    selectName = itemToSave.leadTime;
    selectNum = itemToSave.leadTimeVal;
    itemIdOrig = 0;
  }

  // console.log('saveChanges: ', itemId, dateValue, textTitle, selectNum, selectName);
  // saveChanges:                   2   | 2018-02-16 | t6     | 1        | days

  let stopShort = false,
      importMsg = '[Failed Title: <' + textTitle + '>]',
      errMsg = '';
      //importMsg = 'Import of Title: [' + textTitle + '] failed. All items "before" this were successfully imported.';

  // Simple Validation --> PR's are welcome.

  if (!itemId || !dateValue || !textTitle || !selectNum || !selectName) {
    errMsg = 'All non-optional fields are required in order to setup a proper expiration item.';

    if (isImport) {  importMsg += ' ' + errMsg; } // message(importMsg, false);

    stopShort = true;

  } else if (
    !testVal(itemId, 'number') ||
    !testVal(textTitle, 'string', 25) ||
    !testVal(selectNum, 'number') ||
    !testVal(selectName, 'string', 20))
  {
    errMsg = 'Error: Something appears to be wrong with one of your field entries.';
    if (isImport) {  importMsg += ' ' + errMsg; } // message(importMsg, false);
    stopShort = true;

  } else if (typeof dateReplacement !== 'undefined' && dateRepValue.length > 0 && dateRepValue <= dateValue) {
    errMsg = 'Error: If optional Replacement Date is provided, it should be greater than the primary expiration date.';
    if (isImport) {  importMsg += ' ' + errMsg; } // message(importMsg, false);
    stopShort = true;

  } else if (typeof dateReplacement !== 'undefined' && dateRepValue.length > 0 && dateRepValue <= setDate(false)) {
    errMsg = 'Error: If optional Replacement Date is provided, it should be greater than today\'s date.';
    if (isImport) {  importMsg += ' ' + errMsg; } // message(importMsg, false);
    stopShort = true;

  } else if (selectName !== 'days' && selectName !== 'weeks') {
    errMsg = 'Error: Lead Time values can only be one of: [days|weeks]';
    if (isImport) {  importMsg += ' ' + errMsg; } // message(importMsg, false);
    stopShort = true;

  } else if (selectName === 'days' && (selectNum < 1 || selectNum > maxDays)) {
    errMsg = 'Error: With \'days\' selected, largest number should be [maxDays].';
    if (isImport) {  importMsg += ' ' + errMsg; } // message(importMsg, false);
    stopShort = true;

  } else if (selectName === 'weeks' && (selectNum < 1 || selectNum > maxWeeks)) {
    errMsg = 'Error: With \'weeks\' selected, largest number should be [maxWeeks].';
    if (isImport) {  importMsg += ' ' + errMsg; } // message(importMsg, false);
    stopShort = true;
  }

  if (stopShort) {
    if (isImport) {
      importErrors.push(importMsg);
      message('Errors will show when complete.', true);
    } else {
      message(errMsg, true);
    }

    if (lastImport) {
      finishImport();
    }
    return; // Stop. Nothing further to do.
  }

  let thisId = parseInt(itemId, 10), // 'itemId' is updated if item is edited.
      delay = 0,
      newThen = 0,
      between = 0,
      newTime = {},
      dateValueArr = dateValue.split('-'); // dateValue: 2018-02-11

  if (thisId === 0) {
    thisId = getNewId(); // Gets next biggest ID in `ourState` array of objects.
  } else {
    // @TONOT: Get 'active' status for existing item in ourState. (Why?)
  }

  delay = getDelay(selectName, selectNum); // Validation was done above; first thing on Save.
       // getDelay() returns number of days in milliseconds (1 wk === 7 days | * 24 * ...)

  newTime = getBetween(dateValueArr, delay);
  between = newTime.between;
  newThen = newTime.newThen;

  let isActive = (between > 0) ? true : false;

  message('', true); // Clear message/notification board (div)

  if (isActive) {
    // This is an asycnronous call and is completely independent of the `state` and `storage` updates below.

    // https://developer.chrome.com/extensions/alarms#method-create --> If there is another alarm with
    // the same name (or no name if none is specified), it will be cancelled and replaced by this alarm.
    createTimer(thisId, newThen, between).then( (newAlarm) => {
      if (!isImport) {
        if (typeof(newAlarm) !== 'undefined') {
          message(' An alarm was successfully created.', false);
        }
      }
    });
  } else {

    deleteTimer(thisId).then( (wasCleared) => {
      if (!isImport) {
        if (typeof(wasCleared) !== 'undefined') {
          message('An alarm was removed or skipped.', false); // , thisId
        }
      }
    });
  }

  let ourItem = {
        id: thisId,                   // <number> 1, 2, 3, ...
        title: htmlEscape(textTitle), // (25 chars)
        date: dateValue,              // Expiration Date [2018-02-12]
        dateReplacement: dateRepValue,
        leadTime: selectName,         // days  ; weeks
        leadTimeVal: selectNum,       // [1-maxDays]; [1-maxWeeks]
        active: isActive              // Can be 0 or 1 (initially based on date calcs)
      };

  if (itemIdOrig === 0) {
    ourState.push(ourItem);

  } else {
    // Existing ID; needs to update itself in the list.

    let newState = ourState.slice(),
        stateItemIdx = newState.findIndex(stateObj => stateObj.id === thisId);

    newState.splice(stateItemIdx, 1, ourItem); // Overwrite it in the newState.
    ourState = newState;                       // Update global ourState.
  }

  // Clear the form (they can now edit individual items from the list below the form).
  updateForm();

  //
  // Save item using storage APIs.

  if (lastImport) {
    x2bStorage.set({id: itemIdOrig, isLastImport: true});
  } else {
    x2bStorage.set({id: itemIdOrig});
  }
}

function getBetween(dateValueArr, delay, presetTargetTime) {
  // showList()
  //   if (isGood(alarm.alarmObj)) {
  //     newTime = getBetween(dateValueArr, delay, alarm.alarmObj.presetTargetTime);

  // delay = getDelay() === [>= 1 day in milliseconds] (1 wk === 7 days | * 24 * ...)

  // Get current day's midnight (which is behind the current time, except at midnight).
  // Get expiration day's midnight (today would be same as above, but derived from form).
  // Get time between current day and expiration minus 'warn time' (deactive if negative).
  // How to create a custom date with zeroed-out time without creating a current date first?

  // Exception: `rHours` and `rMins` mingle Extension and Web App code; Extracting most Web App code to [x2b-prefs].
  let rHours = isExtension ? 0 : window.ourExpirations.getPrefs().prefHours,
      rMins = isExtension ? 0 : window.ourExpirations.getPrefs().prefMins,
      rightNow = new Date(),              // Sun Feb 11 2018 21:35:47 GMT-0800 (Pacific Standard Time)
      preNow = isExtension ?
                new Date(rightNow.getFullYear(), rightNow.getMonth(), rightNow.getDate(), 0, 0, 0) :
                rightNow,
      now = Date.parse(preNow),           // 1518336000000
      preThen = new Date(dateValueArr[0], dateValueArr[1] - 1, dateValueArr[2], rHours, rMins, 0),
                                          // Sun Feb 11 2018 00:00:00 GMT-0800 (Pacific Standard Time)
      then = Date.parse(preThen),         // 1518336000000
      newThen = (typeof(presetTargetTime) === 'undefined') ? then - delay : presetTargetTime, // 1518249600000
      between = newThen - now;            // -86400000

  if (isExtension) {
    between = (between / 1000 / 60 / 60 / 24).toFixed(0); // 1
  } else {
    between = Math.ceil(between / 1000 / 60 / 60 / 24) + 0; // 1
  }

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

function showImportTextarea(forceOff = '') { // Show the import <textarea> and other info.

  setParsingImportError();

  let forceClose = forceOff.length > 0,
      isOpen = true;

  if (document.getElementById('input-import').classList.contains('closed')) {
    isOpen = false;
  }

  if (isOpen || forceClose) {
    document.getElementById('input-import').classList.add('closed');
  } else {
    document.getElementById('input-import').classList.toggle('closed');
  }

  setTimeout( () => {
    let importElements = document.querySelectorAll('.show-import-elements');
    for (let i = 0; i < importElements.length; i++) {
      if (isOpen || forceClose) {
        importElements[i].classList.add('hidden');
      } else {
        importElements[i].classList.remove('hidden');
      }
    }
  }, 250);
}

function importTimersRun() {
  setParsingImportError();
  importErrors.length = 0;

  if (document.getElementById('input-import').value.length > 120000) {
    // Max Length: 120000 (allows for up to ~999 expirations.)
    setParsingImportError('on', 'Import only supports up to 999 expiration items.');
    return;
  }

  let ourJSON = getJson(document.getElementById('input-import').value);

  if (ourJSON.results === 'success') {

    let importList = ourJSON.expiresList; // Array of objects [{}, {}]

    toggleMenu('close');
    toggleProgressBar('on');

    let percent = 0,
        fraction = 100 / importList.length,
        newFraction = 0,
        progressBarElement = document.getElementById('import-progress-bar');

        // 100 / 1    = 100%
        // 100 / 2    = 50%
        // 100 / 10   = 10%
        // 100 / 100  = 1%
        // 100 / 200  = 0.5%
        // 100 / 1000 = 0.01%

    // Run each newObjs through saveChanges()
    for (let ii = 0; ii < importList.length; ii++) {

      if (ii + 1 === importList.length) { // Last item in list
        window.setTimeout( () => {
          saveChanges(importList[(ii)], 'last');
          progressBarElement.style.width = fraction * (ii + 1) + '%';
        }, 1500 * ii);

      } else {
        window.setTimeout( () => {
          saveChanges(importList[(ii)]);
          progressBarElement.style.width = fraction * (ii + 1) + '%';
        }, 1500 * ii);
      }
      newFraction = fraction * (ii + 1) + '%';
    }
    // showList() should close the menu...

  } else {
    setParsingImportError('on',
                       'There were issues with your JSON-like input value. ' +
                       'Empty the contents of the text area to see an example.');
  }
}

function getJson(item) {

  let thisItem,
      thisItem2,
      itemStr = JSON.stringify(item); // [{'title': 'Test'}]

  // 1. Check that item can be parsed with JSON.parse. If not, return with error.
  // 2. If that '1st pass' object is the Array we expect, assign it to the '2nd pass' object and move to #5.
  // 3. If not, check that the '1st pass' object can be parsed with JSON.parse. If not, return with error.
  // 4. If that result is the Array we expect, move to #5. If not, return error with expected format: [{}, {}]

  // 5. Check the array length > 0.
  // 6. Check if each element in the array has a constructor of Object.
  // 7. Check each successful object for 7 specific keys:
        // let newItem = {
        //       id: thisId,                   // <number> 1, 2, 3, ...
        //       title: htmlEscape(textTitle), // (25 chars)
        //       date: dateValue,              // Expiration Date [2018-02-12]
        //       dateReplacement: dateRepValue,
        //       leadTime: selectName,         // days  ; weeks
        //       leadTimeVal: selectNum,       // [1-maxDays]; [1-maxWeeks]
        //       active: isActive              // Can be 0 or 1 (initially based on date calcs)
        //     };
  //    7a. Successful objects will be stored for next test.
  // 8. Run each successful object through the `saveChanges` function (may need to populate form first?).

  try {
    thisItem = JSON.parse(itemStr);               // #1
  } catch (e) {
    return {'expiresList': [], 'results': 'error', 'msg': 'Initial JSON parser failed to parse your string.'};
  }

  if (thisItem.constructor !== Array) {
    try {
      thisItem2 = JSON.parse(thisItem);           // #3
    } catch (e) {
      return {'expiresList': [], 'results': 'error', 'msg': 'Follow-up JSON parser failed to parse your string.'};
    }
  } else {
    thisItem2 = thisItem;                         // #2
  }

  if (thisItem2.constructor !== Array) {          // #4
    return {'expiresList': [], 'results': 'error', 'msg': 'Our JSON format expects (e.g., 2 items): [{}, {}].'};

  } else { // (thisItem2.constructor === Array)

    if (thisItem2.length === 0) {                 // #5
      return {'expiresList': [], 'results': 'error', 'msg': 'Your list appears to be void of expiration items.'};
    }

    let newObjs = [];

    for (var i = 0; i < thisItem2.length; i++) {

      if (thisItem2[i].constructor === Object) {  // #6

        if (hasCorrectProps(thisItem2[i])) {      // #7
          newObjs.push(thisItem2[i]); // Got one! // #7a
        } // else; discard.

      } // else; discard.
    }

    if (newObjs.length > 0) {
      return {'expiresList': newObjs, 'results': 'success', 'msg': 'Success: Check object.'};

    } else {
      return {'expiresList': newObjs, 'results': 'error', 'msg': 'Success: But no objects survived the import.'};
    }
  }

  return {'expiresList': [], 'results': 'error', 'msg': 'Parses as JSON, but not...'};
}

function hasCorrectProps(testObj = {}) {

  let isGood = 0,
      testKeys = Object.keys(testObj);

  testKeys.forEach( thisKey => {
    if (ourKeys.has(thisKey)) {
      isGood++;
    }
    // console.log('key: ', thisKey, ourKeys.has(thisKey));
  });

  if (isGood === ourKeys.size) {
    return true;
  } else {
    return false;
  }
  // id: thisId,                   // <number> 1, 2, 3, ...
  // title: htmlEscape(textTitle), // (25 chars)
  // date: dateValue,              // Expiration Date [2018-02-12]
  // dateReplacement: dateRepValue,
  // leadTime: selectName,         // days  ; weeks
  // leadTimeVal: selectNum,       // [1-maxDays]; [1-maxWeeks]
  // active: isActive              // Can be 0 or 1 (initially based on date calcs)
}

function setParsingImportError(onOff = 'off', msg = '') {
  if (onOff === 'on') {
    document.getElementById('import-error').classList.remove('hidden');
  } else {
    document.getElementById('import-error').classList.add('hidden');
  }
  document.getElementById('import-error').innerText = msg;
}

function exportTimers() {
  toggleMenu('close');

  message('Exporting...', true);

  // <a id="input-export-download" style="display:none"></a>

  x2bStorage.get('expiresList').then( itemList => {
    if (!isEmpty(itemList.expiresList)) {

      // Saving JSON to a local file thanks to:
         // https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
         // https://stackoverflow.com/a/30800715/638153

      const storageObj = itemList.expiresList,
            dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(storageObj));

      let dlAnchorElem = document.getElementById('input-export-download');

      dlAnchorElem.setAttribute("href", dataStr);
      dlAnchorElem.setAttribute("download", "x2b-expires-list.json");
      dlAnchorElem.click();

      message('Your \'X2B Expires List\' file has either been saved, or opened for you to save.', true);
    } else {
      message('It would seem you have an empty list: there doesn\'t appear to be anything to export.', true);
    }
  });
}

function patchItem(itemId) {

  let messageMsg = '',
      storeId = 'x2b-' + itemId,
      newState = JSON.parse(JSON.stringify(ourState));

  newState = newState.map( item => {
    if (item.id === itemId) {
      if (item.dateReplacement.length > 0) {
        item.date = item.dateReplacement;
        item.dateReplacement = '';
        messageMsg = 'Your item\'s date has been renewed with its replacement.';
      } else {
        messageMsg = 'The replacement date was empty and could not be used as a replacement date.';
      }
    }
    return item;
  });

  ourState = newState; // x2bStorage.set

  // When updating, if current item ID is in Edit Form, zero it out.
  let currentEditId = document.querySelector('.input-id').value;
  if (parseInt(currentEditId, 10) === itemId) {
    document.querySelector('.input-id').value = 0;
  }

  message(messageMsg, true);

  // Extracted / Borrowed from `toggleActive`

  let stateItem = ourState.find(stateObj => stateObj.id === itemId),
      stateItemIdx = ourState.findIndex(stateObj => stateObj.id === itemId);

      // [stateItem] = {active: true, date: "2018-03-14", id: 1, leadTime: "weeks", leadTimeVal: "2", …}
      // [stateItemIdx] = [ 0 ]

  let delay = getDelay(stateItem.leadTime, stateItem.leadTimeVal),
      dateValueArr = stateItem.date.split('-'),
      newTime = getBetween(dateValueArr, delay),
      between = newTime.between,
      newThen = newTime.newThen;

  let canBeActive = (between > 0) ? true : false;

  // if it was active, and now can still be active. delete - create
  // if it was active, and now cannot be active.    delete -
  // if it wasn't active, and now can be active.           - create
  // if it wasn't active, and still can't be.              -

  if (stateItem.active) {
    deleteTimer(itemId).then( (wasCleared) => {
      if (typeof(wasCleared) !== 'undefined') {
        message('Your previous alarm has been removed.', false);
      }
      if (canBeActive) {
        createTimer(itemId, newThen, between).then( (newAlarm) => {
          if (typeof(newAlarm) !== 'undefined') {
            message('A new alarm was created for your item.', false);
          }
          x2bStorage.set({id: itemId});
        });
      } else {
        message('Cannot create and activate an expired alarm. It would seem your replacement date is also expired.', false);
        passthruUpdateStorage(stateItem, stateItemIdx, false); // Was on; Turn it off.
      }
    });
  } else {
    if (canBeActive) {
      createTimer(itemId, newThen, between).then( (newAlarm) => {
        passthruUpdateStorage(stateItem, stateItemIdx, true); // Was off; Turn it on.
        if (typeof(newAlarm) !== 'undefined') {
          message('An alarm was created for your item.', false);
        }
      });
    } else {
      message('Cannot create and activate an expired alarm. It would seem your replacement date is also expired.', false);
      x2bStorage.set({id: itemId});
    }
  }
  // check `toggleActive`
}

function clearItem(itemId) { // deleteAlarm
  // alarm:     alarmId = "x2b-" + itemId;
  // storage:   'expiresList': [ourState] -> [{ id, title }]
  // ourState:  [{ id, title }]
  // DOM List:  Just redraw the list: showList() -> it will clear it first

  let storeId = 'x2b-' + itemId,
      newState = ourState.filter( item => item.id !== itemId);

  // @TODO: Should not reference 'x2b-' anywhere, or even its length (via index).
     // Set one global name at top and use its name and length.

  // When deleting, if current item ID is in Edit Form, zero it out (ID's should not be used again).
  let currentEditId = document.querySelector('.input-id').value;
  if (parseInt(currentEditId, 10) === itemId) {
    document.querySelector('.input-id').value = 0;
  }

  message('', true);

  ourState = newState;

  // An async call to remove timers via an alarms API

  deleteTimer(itemId).then( (wasCleared) => {
    if (typeof(wasCleared) !== 'undefined') {
      message('Alarm has been removed.', false); // , itemId

      // Running `x2bStorage.set(-1);` after setting ourState will update storage with state, then run showList()
      x2bStorage.set({id: -1});
    }
  });
}

function clearDOMList() {
  let parentTable = document.getElementById('expires-table');
  // There should really only be 2 elements to remove; <thead> and <tbody>
  while (parentTable.firstChild) {
    parentTable.removeChild(parentTable.firstChild);
  }
}

function toggleMenu(which = 'toggle') {
  if (document.querySelector('.footer-menu-div').classList.contains('open')) {
    showImportTextarea('close');
  }

  if (which === 'close') { // Force close
    document.querySelector('.footer-menu-div').classList.toggle('open', false); // Remove 'open' class.
  } else {
    // Close .show-import-elements
    document.querySelector('.footer-menu-div').classList.toggle('open');
  }

  if (!isExtension) {
    let tryTry = 0,
        doTry = () => window.setTimeout( () => {
          let checkIt = document.querySelector('.footer-prefs-div');

          if (tryTry >= 20) {
            // console.log('Not found; Exit loop.'); // Gonna toggle it anyways...
            document.querySelector('.footer-prefs-div').classList.toggle('open', false); // Close App Prefs (if open)
            document.getElementById('app-message').classList.toggle('open', false); // Close About App (if open)

          } else if (typeof(checkIt) !== 'undefined' && checkIt !== null) {
            document.querySelector('.footer-prefs-div').classList.toggle('open', false); // Close App Prefs (if open)
            document.getElementById('app-message').classList.toggle('open', false); // Close About App (if open)

          } else {
            // console.log('Trying again... ', tryTry);
            tryTry++;
            doTry();
          }
        }, 100); // Allow it some time for the DOM element to arrive.
    doTry();
  }
}

/**
 *   TIMER FUNCTIONS
 *
 */

function createTimer(timeId, targetDateZeroHour, daysBetween) { // async / returns a Promise

  // `daysBetween` was going to be used, and although not now, still a good param to have passed.
  let alarmId = "x2b-" + timeId;

  // Per below, this `runReRender` function is NOT run in the Chrome extension.
  // It is only run when `chrome.runtime` and `sendMessage` API are both available.
  // Tried putting it in logic, but it says it can't be found (even putting vars above).
  let runReRender = () => {

    const newItem = {
            whichEvent: 'add',
            expiredId: timeId,
            entryTitle: alarmId,
            entryPresetTargetTime: targetDateZeroHour,
            entryHours: window.ourExpirations.getPrefs().prefHours,
            entryMinutes: window.ourExpirations.getPrefs().prefMins,
            entryCycle: window.ourExpirations.getPrefs().prefCycle, // 0 = daily
          };

    ourExpirations.processItem(newItem);
    window.reRender();
    ourExpirations.removeItem(newItem.expiredId);
    window.reRender();
    return true;
  };

  // window.onerror = (e) => console.error('[onerror] doesn\'t seem to work: ', e);
  return new Promise((resolve, reject) => {

    if (isGood('chrome') && isGood('chrome.runtime') && isGood('chrome.alarms')) {

      try {
        chrome.runtime.sendMessage({
          alarmId,
          delay: targetDateZeroHour
        }, (response) => {
          resolve(response);
        });
      } catch(e) {
        // console.log('chrome.runtime error: ', e);
        // Error: chrome.runtime.connect()
           // called from a webpage must specify an Extension ID (string) for its first argument

        // We're actually in Chrome, but we're not running the Chrome Extension.
        // So we should follow the approach for: localStorage and Notifications.

        let runGood = runReRender();
        resolve(runGood);
      }
    } else {

      let runGood = runReRender();
      resolve(runGood);
    }
  });
}

function deleteTimer(timeId) {

  return new Promise((resolve, reject) => {
    if (isGood('chrome') && isGood('chrome.alarms')) {
      chrome.alarms.clear("x2b-" + timeId, (wasCleared) => {
        // Just like `createTimer` above, this should not run showList()
        // `deleteTimer` can be called numerous times from within showList.
        // if (wasCleared) {
        //   showList();
        // }
        resolve(wasCleared);
      });
    } else {

      const removeItem = {
              whichEvent: 'remove',
              expiredId: timeId
            };

      // So far as I know this should all be synchronous.
      ourExpirations.processItem(removeItem);
      window.reRender();
      ourExpirations.removeItem(timeId);
      window.reRender();

      resolve(true);
    }
  });
}

function clearTimersAndStorage() {

  // For now, at least,
  // considering sync.storage and alarms as one group (Chrome Extension),
  // and localStorage and notifications as another group (Web App).
  // If you're running both...? (looks like Chrome Extension will win. :)

  if (isGood('chrome') && isGood('chrome.alarms') && isGood('chrome.storage')) {
    if (window.confirm('Click OK if you are certain you\'d like to remove all of your expiration items and alarms.')) {
      chrome.alarms.clearAll( () => {
        chrome.storage.sync.clear( () => {
          ourState.length = 0;
          showList();
          updateForm();
        });
      });
    }
  } else {

    if (isGood('window.localStorage')) {
      if (window.confirm('Click OK if you are certain you\'d like to remove all of your expiration items from local storage.')) {
        // https://developer.mozilla.org/en-US/docs/Web/API/Storage/clear
        localStorage.removeItem('expiresList'); // Synchronous call to clear local storage.
        ourState.length = 0;

        const removeItem = {
          whichEvent: 'clearall',
          expiredId: -1 // Required field
        };

        ourExpirations.processItem(removeItem);
        window.reRender();
        ourExpirations.removeItem(-1);
        window.reRender();

        showList();
        updateForm();
      }
    }
  }
}

/**
 *   SYSTEM MESSAGING FUNCTIONS
 *
 */

function message(msg, clearMsg, data) {

  let msgsDiv = document.getElementById('msgs-div'); // The <div> where all the notifications are headed.

  msgsDiv.classList.add('msg-transition');

  setTimeout( () => {

    if (clearMsg) {
      msgsDiv.innerText = msg;
    } else {
      msgsDiv.innerText = msgsDiv.innerText + ' ' + msg;
    }

    if (data) {
      msgsDiv.innerText = msgsDiv.innerText + ' [' + data + ']';
    }

    setTimeout( () => {
      msgsDiv.classList.remove('msg-transition');
    }, 250);

  }, 250);
}

function clearMessage() {
  document.getElementById('msgs-div').innerText = '';
}

/**
 *   UTILITY FUNCTIONS
 *
 */

function getNewId() {
  return ourState.reduce((a, v) => (v.id > a) ? v.id : a, 0) + 1;
}

function isEmpty(obj) {
  // Thanks to: https://stackoverflow.com/a/34491966/638153
  for (var x in obj) { if (obj.hasOwnProperty(x))  return false; }
  return true;
}

// Form Field Type and Value Validation
function testVal(val, valType, valLen) {
  if (valType === 'number') {

    return !isNaN(parseInt(val, 10));

  } else if (valType === 'string') {

    return (typeof(val) === valType && val.length <= valLen);

    // Trying to stay away from 'whitelist' and 'blacklist' characters.
       // if (typeof(val) === valType && val.length <= valLen) {
       //   return val.test(\[^<>]\g); // ' <-- Syntax corrector
       // }
  }
  return false;
}

function isGood(objStr) {

  // It would seem that "iPad" cannot pass an undefined object as a param.
     // isGood(chrome) would fail (I don't have a Mac to debug with, and alerts provided
     // no useful info). So I opted to go with a manual 1:1 string -> object conversion method.

  if (objStr === 'chrome') {
    return typeof(chrome) !== 'undefined';

  } else if (objStr === 'chrome.alarms') {
    return typeof(chrome.alarms) !== 'undefined';

  } else if (objStr === 'chrome.storage') {
    return typeof(chrome.storage) !== 'undefined';

  } else if (objStr === 'chrome.storage.sync') {
    return typeof(chrome.storage.sync) !== 'undefined';

  } else if (objStr === 'chrome.browserAction') {
    return typeof(chrome.browserAction) !== 'undefined';

  } else if (objStr === 'window.localStorage') {
    return typeof(window.localStorage) !== 'undefined';

  } else {
    return typeof(objStr) !== 'undefined';
  }
}

function setDate(add28 = true) {
  let today = new Date(); // Tested: new Date(2018, 11, 4); showed as [Jan 01, 2019]

  if (add28) {
    today.setDate(today.getDate() + 28);  // Add 4 weeks
  }

  const newDay = today.getDate(),        // 1-31
        newMonth = today.getMonth() + 1, // 0-11
        newYear = today.getFullYear();   // 2018

  const newFullDay = newYear + '-' +
                     (newMonth < 10 ? '0' + newMonth : newMonth) + '-' +
                     (newDay < 10 ? '0' + newDay : newDay) ;
  return newFullDay;
}

/**
 *   Escaping: Was shooting for some XSS coverage.
 *
 */

  // Refs:
     // Q: https://stackoverflow.com/questions/1219860/html-encoding-lost-when-attribute-read-from-input-field
     // A: https://stackoverflow.com/a/7124052/638153

     // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/escape
     // What's the difference? The spec doesn't escape the forward slash (recommended by OWASP).
     // https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet#RULE_.231_-_HTML_Escape_Before_Inserting_Untrusted_Data_into_HTML_Element_Content

     // https://stackoverflow.com/questions/8839112/if-function-does-not-exist-write-function-javascript#answer-8839136

  // Other Refs:
    //  https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API
    //  https://stackoverflow.com/questions/46561795/notification-requestpermission-then-always-return-promise-object-instead-of
    //  https://bugs.chromium.org/p/chromium/issues/detail?id=704771
    //  https://developer.mozilla.org/en-US/docs/Web/API/Notification/permission
    //  https://stackoverflow.com/questions/38114266/web-notifications-not-appearing-in-safari#answer-39282539

  // Test strings: (25 chars.)
  // <script>alert(1)</script>
  // <_>-\/!@#$%^&*();'?+"[`~]

if (typeof(htmlEscape) !== 'function') {
  window.htmlEscape = function(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\//g, '&#x2F;'); // forward slash is included as it helps end an HTML entity
  };
}
if (typeof(htmlUnescape) !== 'function') {
  window.htmlUnescape = function(str) {
    return str
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&#x2F;/g, '/');
  };
}

/*  STORAGE FUNCTIONS  */

/**
 *   Storage (local; client-side [window])
 *   https://developer.mozilla.org/en-US/docs/Web/API/Storage
 *
 *   STORAGE MOCKUP (jsdom)
 *
 *   - all storage code below borrowed from [my 'Done (for now)' code](https://github.com/KDCinfo/done-for-now)
 */

if (typeof(window.localStorage) === 'undefined' || window.localStorage === null) {

    // For Testing: Apparently you can disregard the TypeScript errors.

    var localStorage = (function () {
      return {
        getItem: function (key) {
          return store[key];
        },
        setItem: function (key, value) {
          store[key] = value.toString();
        },
        clear: function () {
          store = {};
        },
        removeItem: function (key) {
          delete store[key];
        }
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorage });
}

const setStorageItem = (storage, key, value) => {
  try {
    storage.setItem(key, value);
  } catch (e) {
    message('Error: ' + e);
  }
};

const getStorageItem = (storage, key) => {
  let newItem = {
        id: 0,                        // <number> 1, 2, 3, ...
        title: htmlEscape('Empty Temp Placeholder...'), // (25 chars)
        date: '2033-03-10',           // Expiration Date [2018-02-23]
        leadTime: 'days',             // days  ; weeks
        leadTimeVal: '1',             // [1-maxDays]; [1-maxWeeks]
        active: 1                     // Can be 0 or 1 (initially based on date calcs)
      },
      keyItem = storage.getItem(key),
      testObj = {};

  if (key === 'expiresPrefs') { // expiresPrefs
    testObj = (keyItem) ? JSON.parse(keyItem) : {};
  } else { // expiresList
    testObj = (keyItem) ? { 'expiresList': JSON.parse(keyItem) } : { 'expiresList': ourState };
    // testObj = (keyItem) ? JSON.parse(keyItem) : ourState;
  }

  /**
   *  testObj0 = { 'expiresList': ourState },
   *  testObj1 = { 'expiresList': [ newItem ] },
   *  testObj2 = (keyItem) ? { 'expiresList': JSON.parse(keyItem) } : testObj0;
   */
  // console.log('getStorageItem: ', keyItem, testObj);

  try {
    return testObj;
  } catch (e) {
    message('Error: ' + e, false);
    return { [key]: [] };
  }
};

/** Below is a simple representation of the elements and objects used in this extension:
 *
 *
  <tr class="x2b-listitem-{id}">
    <td>{title}</td>
    <td>{dateValue}</td>
    <td>{leadTimeVal}</td>
    <td>{leadTime}</td>
    <td>{between}</td>
    <td><input class="toggle-active" type="checkbox" checked /> {active}</td>
    <td><button class="edit">Edit</button></td>
    <td><button class="delete">Delete</button></td>
  </tr>

  document.querySelector('.x2b-listitem-{id} .toggle-active').addEventListener('click', (e) => editItem);
  document.querySelector('.x2b-listitem-{id} button.edit').addEventListener('click', (e) => editItem);
  document.querySelector('.x2b-listitem-{id} button.edit').addEventListener('click', (e) => editItem);

  {
    id: thisId,             // <number> 1, 2, 3, ...
    title: textTitle,       // (25 chars)
    date: dateValue,        // Expiration Date [2018-02-12]
    dateReplacement: dateRepValue,
    leadTime: selectName,   // days  ; weeks
    leadTimeVal: selectNum, // [1-maxDays]; [1-maxWeeks]
    active: isActive        // Can be 0 or 1 (initially based on date calcs)
  };

  configObj.dateValueArr = item.date.split('-');
  configObj.delay = getDelay(item.leadTime, item.leadTimeVal);
  configObj.newThen = [getBetween(configObj.dateValueArr, configObj.delay)].newThen;
  configObj.between = [getBetween(configObj.dateValueArr, configObj.delay)].between;

  Happy Paths:

  - assets/x2b-happy-paths.md

 *
 * Functional Diagram: Storage (sync) with Alarms, and Storage (local) with Notifications
 * https://www.draw.io/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=expired-to-be.xml#Uhttps%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D1mTxbVo9d5hfpxvEPvz_4I65Cb0YU3LUG%26export%3Ddownload
 *
 * Chrome Storage: https://developer.chrome.com/extensions/storage
 * Chrome Alarms:
 * Web Notifications:
 *
 */
