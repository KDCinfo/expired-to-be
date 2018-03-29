# Expired To Be

## Function Listing / Overview of Functions

```javascript
let ourState = [],
    badgeTextCount = 0;

const maxDays = 70,
      maxWeeks = 10,
      stateLocation = 'chrome', // chrome|local|session|cookie
      TESTING = true; // Currently means you can activate an expired item, for testing 'expired notifications'.
```

```javascript
function displayIt() {} // [window|document].onload = function() {}
```

```javascript
function addStorageListener() {}
    chrome.storage.onChanged.addListener(function(changes, namespace) {}
        showList()
    )
```

```javascript
const x2bStorage = (function() {}
    get:
    set:
    which:
)
```

```javascript
function storeStateLocal(thenFunc) {}
```

```javascript
async function getState() {}
```
```javascript
function updateNotifications(stat = '') {}
```

```javascript
function showList() {}
```
```javascript
function requestAlarm(itemId) {}
```
```javascript
function printListHead() {}
```
```javascript
function printList(item, configObj) {}
```

```javascript
function toggleActive(e) {}
```
```javascript
function passthruUpdateStorage(stateItem, stateItemIdx, itemActive, withTimer){}
```

```javascript
function itemUpdate(e) {}
```
```javascript
function updateForm(itemId) {}
```
```javascript
function setItemEdit(itemId) {}
```

```javascript
function saveChanges() {}
```
```javascript
function getBetween(dateValueArr, delay) {}
```
```javascript
function getDelay(selectName, selectNum) {}
```
```javascript
function exportTimers() {}
```

```javascript
function clearItem(itemId) {} // deleteAlarm
```
```javascript
function clearDOMList() {}
```
```javascript
function toggleMenu(which = 'toggle') {}
```

### Timer Functions

```javascript
function createTimer(timeId, delay) {} // async / returns a Promise
```

```javascript
function deleteTimer(timeId) {}
```

```javascript
function clearTimers() {}
```

### System Messaging Functions

> Messaging System (provides feedback to user)

```javascript
function message(msg, clearMsg, data) {}
```

```javascript
function clearMessage() {}
```

### Utility Functions

```javascript
function getNewId() {}
```
> return ourState.reduce > item.id

```javascript
function isEmpty(obj) {}
```

```javascript
function testVal(val, valType, valLen) {}
```
> Tests primitive values.

```javascript
function isGood(objStr) {}
```

```javascript
function setDate() {}
```

### Escaping: Was shooting for some XSS coverage.

```javascript
function htmlEscape(str) {}
```

```javascript
function htmlUnescape(str){}
```

### STORAGE FUNCTIONS

```javascript
const setStorageItem = (storage, key, value) => {}
```

```javascript
const getStorageItem = (storage, key) => {}
```

## Old

```javascript
// function t() {}
```
* A temporary function created a while back; should have been removed after use.

> Tip: Never name a function with t(); a search for references to the function can be tedious.
