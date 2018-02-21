/**
 * Expired To Be
 *
 * This extension allows you to enter and be reminded of expiration dates.
 * It will provide notification reminders with lead times of your choosing.
 *
 * Developer: Keith D Commiskey (https://kdcinfo.com) 2018-02
 *
 * Notifications:
 *  - Icon badge text (will clear when expired item is reset)
 *  - Storage listing (expired items will be distinct)
 */

/** Below is a simple representation of the elements and objects used in this extension:
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
*/

// Chrome Storage: https://developer.chrome.com/extensions/storage

let maxDays = 70,
    maxWeeks = 10,
    ourState = [],
    badgeTextCount = 0;

chrome.browserAction.setBadgeBackgroundColor({color: 'orange'});

function setDate() {
  const today = new Date(), // Tested: new Date(2018, 11, 31); showed as [Jan 31, 2019]
        thisMonth = today.getMonth() + 1,
        nextMonth = (thisMonth === 12) ? 1 : thisMonth + 1,
        padMonth = ((nextMonth < 10) ? '0' : '') + nextMonth,
        thisYear = (thisMonth === 12) ? today.getFullYear() + 1 : today.getFullYear();

  return thisYear + '-' + padMonth + '-' + today.getDate();
}

function displayIt() { // [window|document].onload = function() {}

  document.querySelector('.input-date').value = setDate(); // input-date

  chrome.storage.sync.get('expiresList', itemList => {
    if (!isEmpty(itemList.expiresList)) {
      message('Or you can edit your items from below.', false);
    }
  });

  //
  // Set Listeners
  //

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

  // <button>: Clear All
  document.getElementById('input-clear-all').addEventListener('click', (e) => {
    clearTimers();
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

  // [storage]: onChange
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    // Per: https://developer.chrome.com/extensions/storage
    /*
    for (key in changes) {
      var storageChange = changes[key];
      console.log('Storage key "%s" in namespace "%s" changed. ' +
                  'Old value was "%s", new value is "%s".',
                  key,
                  namespace,
                  storageChange.oldValue,
                  storageChange.newValue);
    }
    */
    showList(); // Refresh the expiration display list after any state updates.
  });

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
    chrome.storage.sync.get('expiresList', itemList => {
      let returnIt = [];

      if (!isEmpty(itemList.expiresList)) {
        returnIt = returnIt.concat(itemList.expiresList);
      }
      resolve(returnIt);
    });
  });
}

function showList() {

  clearDOMList();
  badgeTextCount = 0;
  chrome.browserAction.setBadgeText({text: ''}); // Updated Via: Alarms (eventPage) and showList()

  if (ourState.length > 0) {

    // Turn on the 'Clear All' button.
    document.getElementById('input-clear-all').parentNode.style.display = 'inline-block';

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
    chrome.browserAction.setBadgeText({text: badgeTextCount });

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

        if (typeof(alarm) !== 'undefined') {
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

          // @TONOTDO:
          // Q: This alarm is undefined (i.e., it isn't on). Should we check it's state ID with 'active'?
          // A: In walking back through the entire code, what I'm looking for here appears to be an impossible state:

             // Active but no alarm.

             // You cannot turn off an alarm without deactivating it.
             // You can save it in an expired state, but that'll trigger the expiration flags
                // Those 2 flags are;
                // 1) Icon badge text, and
                // 2) light-red row highlighting with a semi-translucent ["Expired"] stamp on it.

          // 2018-02-20 @ 1:30 AM (This was the last piece.)
          // All that in mind, I think I'm done. Backup code with notes. Strip superfluous notes. Commit to Git.
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

    // Turn off the 'Clear All' button (nothing to clear).
    document.getElementById('input-clear-all').parentNode.style.display = 'none';

    message('No expirations; Storage is empty.', true);
  }
}

function requestAlarm(itemId) {
  return new Promise((resolve, reject) => {
    chrome.alarms.get(
      'x2b-' + itemId,
      (alarmitem) => {
        resolve(alarmitem);
      }
    );
  });
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
    itemSpan1.innerText = item.title;
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

  message('', true);

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
        stateItemIdx = ourState.findIndex(stateObj => stateObj.id === thisId),
        shouldUpdateStorage = false;

    // console.log('toggleActive 2: ', stateItem, stateItemIdx, newState);
    // toggleActive 2: {active: true, date: "2018-03-14", id: 1, leadTime: "weeks", leadTimeVal: "2", …}
                // [ 0 ]
                // (2) [{…}, {…}]

    if (stateItem.active === true) {

      deleteTimer(thisId).then( (wasCleared) => {
        // Shared function (i.e., DRY)
        passthruUpdateStorage(stateItem, stateItemIdx, eTargetChecked, false); // false = not creating a timer
        if (wasCleared) {
          message('Your alarm has been removed.', false); // , thisId
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
          // Shared function (i.e., DRY)
          passthruUpdateStorage(stateItem, stateItemIdx, eTargetChecked, true); // true = creating a timer
          message('An alarm was created for your item.', false); // , newAlarm.alarmId
        });
      } else {
        e.preventDefault(); // We're not creating an alarm or updating the state; don't toggle checkbox.
        message('Cannot create and activate an expired alarm. Please set a lead time that is at least 1 day ahead.', false);
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

  updateStorageWithState(localStateItem.id);        // Update '.sync' storage.
}

function updateStorageWithState(itemId) {
  //
  // Save it using the Chrome extension storage API.
  chrome.storage.sync.set({'expiresList': ourState}, () => {
    // Notify that we saved.
    // Final call in de/activation.

    if (itemId === 0) {
      message('Your expiration item was successfully created.', false);
    } else {
      message('Your expiration item was successfully updated.', false);
    }
  });
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
    document.querySelector('.input-title').value = ourObj.title; // input-title
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

function saveChanges() {
  // Get a value saved in a form.
  const itemId = document.querySelector('.input-id').value,
        dateValue = document.querySelector('.input-date').value, // input-date
        textTitle = document.querySelector('.input-title').value, // input-title
        selectNum = document.querySelector('.input-select-num').value; // input-select-num
        selectName = document.querySelector('.input-select-name').value, // input-select-name
        itemIdOrig = parseInt(itemId, 10);

  // console.log('saveChanges: ', itemId, dateValue, textTitle, selectNum, selectName);
  // saveChanges:                   2   | 2018-02-16 | t6     | 1        | days

  // Simple Validation
     // It's the user's own list and their own localstorage.
     // This is also open source on GitHub and PR's are welcome.

  if (!itemId || !dateValue || !textTitle || !selectNum || !selectName) {
    message('All fields are required in order to setup a proper expiration item.', true);
    return; // Stop. Nothing further to do.
  } else if (
    !testVal(itemId, 'number') ||
    !testVal(textTitle, 'string', 25) ||
    !testVal(selectNum, 'number') ||
    !testVal(selectName, 'string', 20))
  {
    message('Error: Something appears to be wrong with one of your field entries.', true);
    return; // Stop. Nothing further to do.
  } else if (selectName !== 'days' && selectName !== 'weeks') {
    message('Error: Lead Time values can only be one of: [days|weeks]', true);
    return;
  } else if (selectName === 'days' && (selectNum < 1 || selectNum > maxDays)) {
    message('Error: With \'days\' selected, largest number should be [maxDays].', true);
    return;
  } else if (selectName === 'weeks' && (selectNum < 1 || selectNum > maxWeeks)) {
    message('Error: With \'weeks\' selected, largest number should be [maxWeeks].', true);
    return;
  }

  let thisId = parseInt(itemId, 10), // 'itemId' is updated if item is edited.
      delay = 0,
      newThen = 0,
      between = 0,
      newTime = {},
      dateValueArr = dateValue.split('-');

  // console.log('dateValue: ', dateValue); // 2018-02-11

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
      message(' An alarm was successfully created.', false);
    });
  } else {
    deleteTimer(thisId).then( (wasCleared) => {
      if (wasCleared) {
        message('Previous alarm has been removed.', false); // , thisId
      }
    });
  }

  let newItem = {
        id: thisId,             // <number> 1, 2, 3, ...
        title: textTitle,       // (25 chars)
        date: dateValue,        // Expiration Date [2018-02-12]
        leadTime: selectName,   // days  ; weeks
        leadTimeVal: selectNum, // [1-maxDays]; [1-maxWeeks]
        active: isActive        // Can be 0 or 1 (initially based on date calcs)
      };

  if (itemIdOrig === 0) {
    ourState.push(newItem);

  } else {
    // Existing ID; needs to update itself in the list.

    let newState = ourState.slice(),
        stateItemIdx = newState.findIndex(stateObj => stateObj.id === thisId);

    newState.splice(stateItemIdx, 1, newItem); // Overwrite it in the newState.
    ourState = newState;                         // Update global ourState.
  }

  // Clear the form (they can now edit individual items from the list below the form).
  updateForm();

  //
  // Save item using the Chrome extension storage API.
  updateStorageWithState(itemIdOrig); // Update '.sync' storage.
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

function clearTimers() {
  if (window.confirm('Click OK if you are certain you\'d like to remove all expiration items and alarms?')) {
    chrome.alarms.clearAll( () => {
      chrome.storage.sync.clear( () => {
        ourState = [];
        showList();
        updateForm();
      });
    });
  }
}

function clearItem(itemId) { // deleteAlarm
  // alarm: alarmId = "x2b-" + itemId;
  // storage: 'expiresList': [ourState] -> [{ id, title }]
  // ourState: [{ id, title }]
  // DOM List: (just redraw the list: showList() -> it will clear it first)
  let newState = ourState.filter( item => item.id !== itemId);

  // When deleting, if current item ID is in Edit Form, zero it out (ID's should not be used again).
  let currentEditId = document.querySelector('.input-id').value;
  if (parseInt(currentEditId, 10) === itemId) {
    document.querySelector('.input-id').value = 0;
  }

  message('Clearing...', true);

  chrome.alarms.clear("x2b-" + itemId, (wasCleared) => {

    chrome.storage.sync.set({'expiresList': newState}, () => {

      ourState = newState;
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
}

function clearDOMList() {
  let parentTable = document.getElementById('expires-table');
  // There should really only be 2 elements to remove; <thead> and <tbody>
  while (parentTable.firstChild) {
    parentTable.removeChild(parentTable.firstChild);
  }
}

function deleteTimer(timeId) {
  return new Promise((resolve, reject) => {
    chrome.alarms.clear("x2b-" + timeId, (wasCleared) => {
      if (wasCleared) {
        showList();
      }
      resolve(wasCleared);
    });
  });
}

function createTimer(timeId, delay) { // async / returns a Promise
  let alarmId = "x2b-" + timeId;

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({
      alarmId,
      delay
    }, (response) => {
      resolve(response);
    });
  });
}

function getNewId() {
  return ourState.reduce((a, v) => (v.id > a) ? v.id : a, 0) + 1;
}

function isEmpty(obj) {
  // Thanks to: https://stackoverflow.com/a/34491966/638153
  for (var x in obj) { if (obj.hasOwnProperty(x))  return false; }
  return true;
}

function clearMessage() {
  document.getElementById('msgs-div').innerText = '';
}

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

// Form Field Type and Value Validation
function testVal(val, valType, valLen) {
  if (valType === 'number') {
    return !isNaN(parseInt(val, 10));
  } else if (valType === 'string') {
    return (typeof(val) === valType && val.length <= valLen);
  }
  return false;
}