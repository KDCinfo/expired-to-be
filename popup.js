/**
 * Expired To Be
 *
 * This extension allows you to enter and be reminded of expiration dates.
 * It will provide notification reminders with lead times of your choosing.
 *
 * Developer: Keith D Commiskey (https://kdcinfo.com) 2018-02
 *
 * Chrome Extension Notifications:
 *   - Icon badge text (will clear when expired item is reset)
 *   - Storage listing (expired items will be distinct)
 *
 * In The Works (X2B 1.5):
 *   - Browser-Level Notifications (in lieu of installing the Chrome extension)
 */

/**
 * At the bottom of this file is a simple representation of the elements and objects used in this extension:
 *
 * Functional Diagram: Storage (sync) with Alarms, and Storage (local) with Notifications
 * https://www.draw.io/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=expired-to-be.xml#Uhttps%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D1mTxbVo9d5hfpxvEPvz_4I65Cb0YU3LUG%26export%3Ddownload
 *
 */

let ourState = [],
    importErrors = [],
    badgeTextCount = 0;

const maxDays = 70,
      maxWeeks = 10,
      stateLocation = 'chrome', // chrome|local|session|cookie
      TESTING = false, // Currently means you can activate an expired item, for testing 'expired notifications'.
      ourKeys = new Set(['title', 'date', 'leadTime', 'leadTimeVal']), // No: 'id', 'active'
      sampleJSON = '[{"id": 1, "title": "My first reminder.", "date": "2033-03-10", "leadTime": "days", "leadTimeVal": "1"}, {"id": 2, "title": "My 2nd reminder.", "date": "2033-03-16", "leadTime": "weeks", "leadTimeVal": "1"}]';

function displayIt() { // [window|document].onload = function() {}

  document.querySelector('.input-date').value = setDate(); // input-date

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
        !e.target.closest('.footer-menu-div')) {
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
  const selName = document.querySelector('.input-select-name'),
        selNum = document.querySelector('.input-select-num');

  selName.addEventListener('change', (e) => {
    if (e.target.value === 'days') {
      selNum.setAttribute('max', maxDays);
    } else {
      selNum.setAttribute('max', maxWeeks);
      if (selNum.value > maxWeeks) {
        selNum.value = maxWeeks;
      }
    }
  });

  addStorageListener();

  storeStateLocal(showList); // Store Chrome Storage locally, then display the list (if any).
}

/**
 * Let the FUN Begin!!
 */
document.addEventListener('DOMContentLoaded', displayIt, false);

/**
 * Listen on Storage Changes
 *
 * https://developer.chrome.com/extensions/storage
 */

function addStorageListener() {
  if (isGood('chrome') && isGood('chrome.storage')) {
    // [storage]: onChange

    chrome.storage.onChanged.addListener(function(changes, namespace) {
      /*
        // Per: https://developer.chrome.com/extensions/storage
        for (key in changes) {
          var storageChange = changes[key];
          console.log('Storage key "%s" in namespace "%s" changed. Old value was "%s", new value is "%s".',
                      key, namespace, storageChange.oldValue, storageChange.newValue);
        }
      */
      // console.log('Storage Updated !!! Do we need to repaint the list with showList() ???');
      // showList(); // Refresh the expiration display list after any state updates.
    });
  }
  // Local Storage Listener? Unsure if even the above is necessary... and if so,
  // how to apply to localStorage. I commented out early in development of X2B 1.4.
  // Will remove in future releasee.
}

const x2bStorage = (function() {
  return {
    get: async function() { // x2bStorage.get

      if (isGood('chrome') && isGood('chrome.storage') && isGood('chrome.storage.sync')) {

        return new Promise( (resolve, reject) => {
          chrome.storage.sync.get('expiresList', itemList => {
            resolve(itemList);
          });
        });

      } else if (isGood('window.localStorage')) {

        return new Promise( (resolve, reject) => {
          const storedTimerList = getStorageItem(localStorage, 'expiresList'); // Returned item is: `JSON.parse()`'d
          resolve(storedTimerList);
        });

      } else {
        if (hasSeen > 0) {
          alert('Your browsing device has no local storage (i.e., no data persistence.) ' +
                'You can still run the app, but nothing will be saved when you leave.'); // try cookies?
        }
        return { 'expiresList': ourState };
      }
    },
    set: function(itemId, lastImport) { // was: function updateStorageWithState(itemId) {

      // [ourState] is updated prior to 'x2bStorage.set' being called.

      let msgDone = '';

      if (typeof(lastImport) !== 'undefined') {
        finishImport();
      } else if (itemId === 0) {
        msgDone = message('Your expiration item was successfully created.', false);
      } else if (itemId < 0) {
        msgDone = message('Your expiration item was successfully removed.', false);
      } else {
        msgDone = message('Your expiration item was successfully updated.', false);
      }

      if (isGood('chrome') && isGood('chrome.storage') && isGood('chrome.storage.sync')) {

        // Save it using the Chrome extension storage API.
        chrome.storage.sync.set({'expiresList': ourState}, () => {
          msgDone;
          showList();
        });

      } else if (isGood('window.localStorage')) {

        setStorageItem(localStorage, 'expiresList', JSON.stringify(ourState));

        msgDone;
        showList();
      }
    },
    clear: function(thisId) { // x2bStorage.clear
      // Use instead: x2bStorage.set(-1);
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
  finalImportMsg += ' [[ Import Complete !!! ]]';
  message(finalImportMsg, true);

  toggleProgressBar('off');
}

function toggleProgressBar(which = 'off') {
  let progressBarElement = document.getElementById('import-progress');
  if (which === 'off') {
    setTimeout( () => {
      progressBarElement.classList.replace('opacity100', 'opacity0');
      setTimeout( () => {
        progressBarElement.classList.add('hidden');
      }, 500);
    }, 1000);
  } else {
    progressBarElement.classList.remove('hidden');
    setTimeout( () => {
      progressBarElement.classList.replace('opacity0', 'opacity100');
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

function updateNotifications(stat = '') {
  if (isGood('chrome') && isGood('chrome.browserAction')) {
    chrome.browserAction.setBadgeText({text: stat}); // Updated Via: Alarms (eventPage) and showList()
  } else {
    if (stat.length > 0) {
      message('@TODO: Implement \'notifications\': [' + stat + ']', false);
    }
  }
}

function showList() {

  toggleMenu('close');
  clearDOMList();
  badgeTextCount = 0;
  updateNotifications(); // Clear expired alarm notifications

  if (ourState.length > 0) {

    // Turn on the 'Clear All' and 'Export All' buttons.
    let inputOptions = document.querySelectorAll('.input-options-with-items');
    for (let i = 0; i < inputOptions.length; i++) {
      inputOptions[i].style.display = 'inline-block';
    }

    let alarmList = [];

    printListHead();

    ourState.forEach( item => {
      let configObj = {},
          getBetweenObj = {}; // {delay, between}

      configObj.dateValueArr = item.date.split('-');
      configObj.delay = getDelay(item.leadTime, item.leadTimeVal);

      // Need the top two values first in order to get both the 'newThen' and 'between'.
      getBetweenObj = getBetween(configObj.dateValueArr, configObj.delay);

      // Now that we've got that object, we can assign them respectively.
      configObj.newThen = getBetweenObj.newThen;
      configObj.between = getBetweenObj.between;

      // Alarm should not be set (i.e., undefined): Is `between`, and an `alarm` being set, synonymous?
      if (configObj.between <= 0 && item.active === true) {
        // Expired; but still active.
        badgeTextCount++;
      }

      alarmList.push( requestAlarm(item.id) ); // chrome.alarms.get('x2b-' + itemId, callback) );

      printList(item, configObj);
    });

    // This action is also used in [eventPage.js]
    badgeTextCount = (badgeTextCount === 0) ? '' : badgeTextCount.toString();
    updateNotifications(badgeTextCount); // chrome.browserAction.setBadgeText({text: badgeTextCount });

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

      let expiresTable = document.getElementById('expires-table');

      results.forEach( alarm => {

        // alarm: undefined | {id, active, ...}

        if (isGood(alarm)) {
          let itemId = parseInt(alarm.name.substr(4), 10), // x2b-1
              // <tr class="x2b-listitem-1">
              //   <td><input type="checkbox" class="toggle-active active-is-true item-1">
              alarmNodeParent = expiresTable
                .querySelector('tr.x2b-listitem-' + itemId)
                .querySelector('.toggle-active')
                .parentNode,
              alarmNode = document.createElement('span');

          alarmNode.classList.add('alarm-stat', 'has-alarm');
          alarmNodeParent.appendChild(alarmNode);

        } else {

          // Active but no alarm.

          // You cannot turn off an alarm without deactivating it.
          // You can save it in an expired state, but that'll trigger the expiration flags
            // Those 2 flags are;
            // 1) Icon badge text, and
            // 2) light-red row highlighting with a semi-translucent ["Expired"] stamp on it.
        }
      });
    });

  /* Below is another way of doing the same thing as above:

    // I actually did it this way first, before learning about Promise.all().

    //
    // Now that the table is written to the DOM,
    // we can run the `getAll()` async call to update the table with any 'expired' items.
    //
    let expiresTable = document.getElementById('expires-table');
    chrome.alarms.getAll( alarms => {
      // { name: 'x2b-' + item.id }

      alarms.forEach( alarm => {
        let itemId = parseInt(alarm.name.substr(4), 10), // x2b-1
            // <tr class="x2b-listitem-1">
            //   <td><input type="checkbox" class="toggle-active active-is-true item-1">
            alarmNodeParent = expiresTable
              .querySelector('tr.x2b-listitem-' + itemId)
              .querySelector('.toggle-active.item-' + itemId)
              .parentNode;
        alarmNode = document.createElement('span'),
        alarmNode.classList.add('alarm-stat', 'has-alarm');
        alarmNodeParent.appendChild(alarmNode);
      });
    });

    // [2018-02] Although I was able to write my own async/await and
       // my first Promise [popup.js (async function getState())], I got
       // help with understanding the Promise.all() (above) from two sources:

       // Thanks to: FED Slacker [Darko Efremov (darko)] [2018-02-15 at 2:02 AM] in #javascript
       // https://frontenddevelopers.slack.com/archives/C03B41BH2/p1518688964000167

       // Also Thanks to this SO Answer: https://stackoverflow.com/a/32828546/638153

    // FED Slack: During the peak of an architectural crisis with how to approach
    // adding the "Alarm is Set" notification (which resulted with the blue sun,)
    // I posted the following in FED Slack: #JavaScript --> Vanilla JS Question:

      // I'm creating and writing out a table of data to the DOM (`TR`s and `TD`s),
      // and one of the fields (for each item) requires an async API call,
      // the result of which will go into a newly created `span` on the pertinent field's element.

      // Should I wait until the entire table is written to the DOM,
      // and then run the async call on all the newly created DOM elements to update the pertinent fields?

      // Or is there a way I can run a promise during the creation of each DOM element?
      // (Or would that not be a good thing to do on each item?)

      // Or should I instead store that dynamic API call on page load (for all the items),
      // and use the values then stored locally (but having to update those values whenever they change elsewhere)?

      // I was trying the 2nd option but got stuck.
      // Gonna run with the first option for now (as I know it's something I can do).
  */
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

function requestAlarm(itemId) {
  if (isGood('chrome') && isGood('chrome.alarms')) {
    return new Promise((resolve, reject) => {
      chrome.alarms.get(
        'x2b-' + itemId,
        (alarmitem) => {
          resolve(alarmitem);
        }
      );
    });
  } else {


    // @TODO: Implement local alarms interface for array of setTimeout's to be saved in localStorage.


    return undefined; // This is what I've seen `alarms.get` return when empty.
    // chrome.alarms.get('abcd1234', alarm => console.log(alarm)) // undefined undefined
  }
}

function printListHead() {
  let itemTCH = document.createElement('thead'),
      itemTCR = document.createElement('tr'),
      itemTCH1 = document.createElement('th'),
      itemTCH2 = document.createElement('th'),
      itemTCH3 = document.createElement('th'),
      itemTCH4 = document.createElement('th'),
      itemTCH5 = document.createElement('th'),
      itemTCH6 = document.createElement('th'),
      itemTCH7 = document.createElement('th'),
      itemTCH8 = document.createElement('th'),
      itemTB = document.createElement('tbody');

      itemTCH1.innerText = 'Title';
        itemTCH1.classList.add('text-left');
        itemTCR.appendChild(itemTCH1);
      itemTCH2.innerText = 'Date';
        itemTCH2.classList.add('text-left');
        itemTCR.appendChild(itemTCH2);
      itemTCH3.innerText = 'Lead Time';
        itemTCR.appendChild(itemTCH3);
      itemTCH4.innerText = 'Days/ Weeks';
        itemTCR.appendChild(itemTCH4);
      itemTCH5.innerText = 'Days Left';
        itemTCR.appendChild(itemTCH5);
      itemTCH6.innerHTML = '<span>Alarm/</span> Active';
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

function printList(item, configObj) {
  let itemTR = document.createElement('tr'),
      itemSpan1 = document.createElement('td'), // 1 :title
      itemSpan1Overlay = document.createElement('span'), // Expiration notification over title
      itemSpan2 = document.createElement('td'), // 2 :dateValue
      itemSpan3 = document.createElement('td'), // 3 :leadTimeVal
      itemSpan4 = document.createElement('td'), // 4 :leadTime
      itemSpan5 = document.createElement('td'), // 5 :between
      itemSpan6 = document.createElement('td'), // 6 <Active>
      itemSpan6Container = document.createElement('span'), // Container for active and blue sun
      itemSpan7 = document.createElement('td'), // 7 <Edit>
      itemSpan8 = document.createElement('td'); // 8 <Delete>

  const itemBetween = configObj.between;

  let trClassList = ['x2b-listitem-' + item.id];
  if (item.active === true && itemBetween <= 0) {
    trClassList.push('expired');
  } else {
    itemSpan1Overlay.classList.add('hidden'); // Not expired; don't show notification.
  }

  itemTR.classList.add(...trClassList);
    itemSpan1Overlay.innerText = 'Expired!';
    itemSpan1.innerText = htmlUnescape(item.title);
      itemSpan1.classList.add('cellCol1');
      itemSpan1.appendChild(itemSpan1Overlay);
    itemSpan2.innerText = item.date;
      itemSpan2.classList.add('cellCol2');
    itemSpan3.innerText = item.leadTimeVal;
    itemSpan4.innerText = item.leadTime;

    itemSpan5.innerText = itemBetween; // Should be a whole number: calc is done in getBetween()

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

  // console.log('Active 1: [', thisId, '] [', itemCurState, '] [', typeof(eChecked), '] [', typeof(itemCurState), ']');
  // Active 1: [ 1 ] [ true ] [ string ] [ string ]

  // If `active` was off, `.checked` will be true.
  if (eChecked !== itemCurState) {
    // Should always be true; unless there is a way (in some browser)
    // to click the checkbox without changing its checked status.

    let stateItem = ourState.find(stateObj => stateObj.id === thisId),
        stateItemIdx = ourState.findIndex(stateObj => stateObj.id === thisId);

    // console.log('toggleActive 2: ', stateItem, stateItemIdx, newState);
    // toggleActive 2: {active: true, date: "2018-03-14", id: 1, leadTime: "weeks", leadTimeVal: "2", …}
                // [ 0 ]
                // (2) [{…}, {…}]

    if (stateItem.active === true) {

      deleteTimer(thisId).then( (wasCleared) => {

        passthruUpdateStorage(stateItem, stateItemIdx, eTargetChecked, false); // false = not creating a timer

        if (typeof(wasCleared) !== 'undefined') {
          message('Your alarm has been removed.', false); // , thisId
        } else {

          message('@TODO: Implement local alarms interface: Remove.', false);

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
        createTimer(thisId, newThen).then( (newAlarm) => {

          passthruUpdateStorage(stateItem, stateItemIdx, eTargetChecked, true); // true = creating a timer

          if (typeof(newAlarm) !== 'undefined') {
            message('An alarm was created for your item.', false); // , newAlarm.alarmId
          } else {

            message('@TODO: Implement local alarms interface: Create.', false);

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

  // updateStorageWithState(localStateItem.id);        // Update '.sync' storage.
  x2bStorage.set(localStateItem.id);
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
}

function updateForm(itemId) {
  if (itemId) {
    let ourObj = ourState.find(item => item.id === itemId);

    document.querySelector('.input-id').value = itemId;
    document.querySelector('.input-date').value = ourObj.date; // input-date
    document.querySelector('.input-title').value = htmlUnescape(ourObj.title); // input-title
    document.querySelector('.input-select-num').value = ourObj.leadTimeVal; // input-select-num
    document.querySelector('.input-select-name').value = ourObj.leadTime; // input-select-name
    // document.querySelector('.input-select-name').checked = ourObj.active; // The logic for this is done on save.

    setItemEdit(itemId);
  } else {
    document.querySelector('.input-id').value = 0;
    document.querySelector('.input-date').value = setDate(); // input-date
    document.querySelector('.input-title').value = ''; // input-title
    document.querySelector('.input-select-num').value = 1; // input-select-num
    document.querySelector('.input-select-name').value = 'weeks'; // input-select-name
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
      textTitle,
      selectNum,
      selectName,
      itemIdOrig;

  if (!isImport) {
    // Get a value saved in a form.
    itemId = document.querySelector('.input-id').value;
    textTitle = document.querySelector('.input-title').value; // input-title
    dateValue = document.querySelector('.input-date').value; // input-date
    selectName = document.querySelector('.input-select-name').value; // input-select-name
    selectNum = document.querySelector('.input-select-num').value; // input-select-num
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
    errMsg = 'All fields are required in order to setup a proper expiration item.';
    // message('All fields are required in order to setup a proper expiration item.', true);
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
  }

  delay = getDelay(selectName, selectNum); // Validation was done above; first thing on Save.

  newTime = getBetween(dateValueArr, delay);
  between = newTime.between;
  newThen = newTime.newThen;

  let isActive = (between > 0) ? true : false;

  message('', true); // Clear message/notification board (div)

  if (isActive) {
    // This is an asycnronous call and is completely independent of the `state` and `storage` updates below.
    createTimer(thisId, newThen).then( (newAlarm) => {
      if (!isImport) {
        if (typeof(newAlarm) !== 'undefined') {
          message(' An alarm was successfully created.', false);
        } else {


          message('@TODO: Implement local alarms interface: Create Timer.', false);

        }
      }
    });
  } else {
    deleteTimer(thisId).then( (wasCleared) => {
      if (!isImport) {
        if (typeof(wasCleared) !== 'undefined') {
          message('Previous alarm has been removed.', false); // , thisId
        } else {


          message('@TODO: Implement local alarms interface: Delete Timer.', false);

        }
      }
    });
  }

  let ourItem = {
        id: thisId,                   // <number> 1, 2, 3, ...
        title: htmlEscape(textTitle), // (25 chars)
        date: dateValue,              // Expiration Date [2018-02-12]
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
    ourState = newState;                         // Update global ourState.
  }

  // Clear the form (they can now edit individual items from the list below the form).
  updateForm();

  //
  // Save item using the Chrome extension storage API.
  // updateStorageWithState(itemIdOrig); // Update '.sync' storage.
  if (lastImport) {
    x2bStorage.set(itemIdOrig, 'last');
  } else {
    x2bStorage.set(itemIdOrig);
  }
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

  between = (between / 1000 / 60 / 60 / 24).toFixed(0); // 1

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

          // console.log('count last: ', ii, fraction * (ii + 1) + '%', newFraction);
          progressBarElement.style.width = fraction * (ii + 1) + '%';
        }, 1500 * ii);
      } else {
        window.setTimeout( () => {
          saveChanges(importList[(ii)]);

          // console.log('count not last: ', ii, fraction * (ii + 1) + '%', newFraction);
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

function clearItem(itemId) { // deleteAlarm
  // alarm: alarmId = "x2b-" + itemId;
  // storage: 'expiresList': [ourState] -> [{ id, title }]
  // ourState: [{ id, title }]
  // DOM List: (just redraw the list: showList() -> it will clear it first)
  let storeId = "x2b-" + itemId,
      newState = ourState.filter( item => item.id !== itemId);

  // When deleting, if current item ID is in Edit Form, zero it out (ID's should not be used again).
  let currentEditId = document.querySelector('.input-id').value;
  if (parseInt(currentEditId, 10) === itemId) {
    document.querySelector('.input-id').value = 0;
  }

  message('Clearing...', true);

  ourState = newState;

  if (isGood('chrome') && isGood('chrome.alarms') && isGood('chrome.storage')) {
    chrome.alarms.clear(storeId, (wasCleared) => {
      chrome.storage.sync.set({'expiresList': newState}, () => {

        showList();

        if (wasCleared) {
          message('Your expiration item and alarm were both successfully removed.', true);
        } else {
          message('Your expiration item was successfully removed.', true);
        }
        if (newState.length === 0) {
          message('You currently have no expirations.', false);
        }
      });
    });

  } else {

    if (isGood('window.localStorage')) {
      // -1 informs `.set` an item has been removed.
      // Could do a 2nd param, but will refactor if needed. `.set` is only used in a few places.
      x2bStorage.set(-1);
    }

    // @TODO: Implement local alarms interface. (v1.5)

    showList();
  }
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
}

/**
 *   TIMER FUNCTIONS
 *
 */

function createTimer(timeId, delay) { // async / returns a Promise
  let alarmId = "x2b-" + timeId;

  // window.onerror

  // window.onerror = (e) => console.error('[onerror] doesn\'t seem to work: ', e);
  return new Promise((resolve, reject) => {

    if (isGood('chrome') && isGood('chrome.runtime')) {

      try {
        chrome.runtime.sendMessage({
          alarmId,
          delay
        }, (response, ) => {
          resolve(response);
        });
      } catch(e) {
        // console.log('chrome.runtime error: ', e);
        // Error: chrome.runtime.connect()
           // called from a webpage must specify an Extension ID (string) for its first argument

        // We're actually in Chrome, but we're not running the Chrome Extension.
        // So we should follow the approach for: localStorage and Notifications.

        // @TODO: Implement local alarms interface. (v1.5)

        // Until then...
        resolve(undefined);
      }
    } else {

      // @TODO: Implement local alarms interface. (v1.5)

      resolve(undefined);
    }
  });
}

function deleteTimer(timeId) {
  return new Promise((resolve, reject) => {
    if (isGood('chrome') && isGood('chrome.alarms')) {
      chrome.alarms.clear("x2b-" + timeId, (wasCleared) => {
        if (wasCleared) {
          showList();
        }
        resolve(wasCleared);
      });
    } else {

      // @TODO: Implement local alarms interface. (v1.5)

      resolve(undefined);
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
          ourState = [];
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
        ourState = [];
        showList();
        updateForm();
      }
    }

    // @TODO: Implement local alarms interface. (v1.5)

  }
}

/**
 *   SYSTEM MESSAGING FUNCTIONS
 *
 */


    // @TODO: Should only check notification permissions once on page load.
    // From there out, just go with whatever internal setting is set.


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

function setDate() {
  const today = new Date(), // Tested: new Date(2018, 11, 31); showed as [Jan 31, 2019]
        thisMonth = today.getMonth() + 1,
        nextMonth = (thisMonth === 12) ? 1 : thisMonth + 1,
        padMonth = ((nextMonth < 10) ? '0' : '') + nextMonth,
        thisDay = today.getDate(),
        padDay = ((thisDay < 10) ? '0' : '') + thisDay,
        thisYear = (thisMonth === 12) ? today.getFullYear() + 1 : today.getFullYear();

  return thisYear + '-' + padMonth + '-' + padDay;
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

  // Test strings: (25 chars.)
  // <script>alert(1)</script>
  // <_>-\/!@#$%^&*();'?+"[`~]

function htmlEscape(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\//g, '&#x2F;'); // forward slash is included as it helps end an HTML entity
}

function htmlUnescape(str){
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#x2F;/g, '/');
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
      testObj0 = { 'expiresList': ourState },
      testObj1 = { 'expiresList': [ newItem ] },
      testObj2 = (keyItem) ? { 'expiresList': JSON.parse(keyItem) } : testObj0;
  try {
    return testObj2; // Swap between 'testObj1' and 'testObj2'.
  } catch (e) {
    message('Error: ' + e, false);
    return { expiresList: [] };
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
