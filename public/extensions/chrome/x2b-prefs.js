/**
 * Expired To Be |  https://github.com/KDCinfo/expired-to-be
 *
 * This app allows you to enter and be reminded of expiration dates.
 * It will provide notification reminders with lead times of your choosing.
 *
 * Developer: Keith D Commiskey (https://kdcinfo.com)
 * Initial Development: 2018-02 - 2018-03
 *
 * Everything in this file pertains to the Web App only.
 *
 * Nothing here should touch the Chrome Extension.
 * See @DEBUG for troubleshooting overrides.
 *
 */

//
// Set Event Listeners
//

// <button>: Web App 'About'
document.getElementById('button-toggle-webapp-help').addEventListener('click', (e) => {
  document.getElementById('app-message').classList.toggle('open');
});

// <button>: App Preferences
document.querySelector('.footer-prefs-toggle-button').addEventListener('click', (e) => {
  togglePrefs();
});

// <select>: App Preferences - Notification Method
document.getElementById('prefNotifyMethod').addEventListener('change', (e) => {
  let prefObj = { prefNotification: e.target.value };

  window.ourExpirations.clearErrors();

  if (e.target.value === 'notifications') {
    window.ourExpirations.getPermissions().then( ourPerm => {
      switch (ourPerm) {
        case 'granted':
          break;
        case 'autodeny':
          prefObj = { prefNotification: 'alerts' };
          window.ourExpirations.setError('Web-based notifications have been auto-denied by your browser for this web page/domain. ' +
                                          "'Alerts' is the fallback notification method and will be used instead.");
          break;
        case 'denied':
          prefObj = { prefNotification: 'alerts' };
          window.ourExpirations.setError('Web-based notifications have been denied for this web page/domain. ' +
                                          "'Alerts' is the fallback notification method and will be used instead.");
          break;
        case 'default':
          prefObj = { prefNotification: 'alerts' };
          window.ourExpirations.setError('Web-based notifications are currently set to default. ' +
                                          "'Alerts' is the fallback notification method and will be used instead.");
          break;
        default:
          prefObj = { prefNotification: 'alerts' };
          window.ourExpirations.setError('Web-based notifications are not supported on your device. ' +
                                          "'Alerts' is the fallback notification method and will be used instead.");
      }
      updatePrefs(prefObj);
    });
  } else {
    updatePrefs(prefObj);
  }
});

// <select>: App Preferences - Hours
document.getElementById('prefTimeHr').addEventListener('change', (e) => {
  let prefObj = {prefHours: parseInt(e.target.value, 10)};
  updatePrefs(prefObj);
});

// <select>: App Preferences - Minutes
document.getElementById('prefTimeMin').addEventListener('change', (e) => {
  let prefObj = {prefMins: parseInt(e.target.value, 10)};
  updatePrefs(prefObj);
});

// <button>: Toggle Timer/Alarms Panel
document.getElementById('button-toggle-alarms-panel').addEventListener('click', (e) => {
  let turnIt = window.ourExpirations.getPrefs().showPanel === true ? false : true,
      prefObj = {showPanel: turnIt};
  updatePrefs(prefObj);
});

//
// Toggle 'App Preferences' Menu
//

function togglePrefs(which = 'toggle') {
  showPrefNotifyOptions(); // Hide notification options if notification method is set to 'none'.
  document.querySelector('.footer-menu-div').classList.toggle('open', false); // Close List Options (if open)
  document.getElementById('app-message').classList.toggle('open', false);     // Close 'About App' (if open)
  if (which === 'close') { // Force close
    document.querySelector('.footer-prefs-div').classList.toggle('open', false); // Remove 'open' class.
  } else {
    // Close .show-import-elements
    document.querySelector('.footer-prefs-div').classList.toggle('open');
  }
  showImportTextarea('close');
}

function updatePrefs(prefObj) {
  window.ourExpirations.setPref(prefObj);
  x2bStorage.set({prefsObj: prefObj, isNew: false});
  showPrefNotifyOptions();
  window.reRender();
  showList('noClose'); // Tell showList() not to close the menu.
}

function showPrefNotifyOptions() { // Hide the notification options if set to 'none'.

  let notifyOptionsElem = document.querySelector('.notification-option');

  if (notifyOptionsElem) {
    if (window.ourExpirations.getPrefs().prefNotification.toLowerCase() === 'none') {
      notifyOptionsElem.classList.add('closed');
    } else {
      notifyOptionsElem.classList.remove('closed');
    }
  }
}

//
// Populate <select> Tags
//

const formOptions = (idx) => {
        // Pre-ES8 (Pre-ES2017)
        // <option key={idx} value={idx}>{idx.toString().length === 1 ? '0'+idx : idx}</option>
        // ES8 (ES2017) - Couldn't get to work with Jest/Testing
        // <option key={idx} value={idx}>{idx.toString().padStart(2, '0')}</option>

        const newOption = document.createElement('option');
        newOption.value = idx;
        newOption.innerText = idx.toString().length === 1 ? '0' + idx : idx;

        // return (<option value={idx}>{idx.toString().length === 1 ? '0' + idx : idx}</option>);
        return newOption;
      },
      setSelectOptions = (maxCount, stepCount = 1) => {
        let optionTags = [];
        for (let ii = 0; ii < maxCount; ii += stepCount) {
            optionTags.push( formOptions(ii) );
        }
        return optionTags;
      },
      setSelectOptionsHours = setSelectOptions( 24 ),
      setSelectOptionsMinutes = setSelectOptions( 60, 5 ); // @DEBUG: Set to 1 for per-minute timer sets.

let prefHrElem = document.getElementById('prefTimeHr'),
    prefMinElem = document.getElementById('prefTimeMin'),
    prefNotifyElem = document.getElementById('prefNotifyMethod');

// Clear previous empty <option> tags.
//
while (prefHrElem.hasChildNodes()) {
  prefHrElem.removeChild(prefHrElem.lastChild);
}
while (prefMinElem.hasChildNodes()) {
  prefMinElem.removeChild(prefMinElem.lastChild);
}

// Add each <option> element to its parent <select>.
//
setSelectOptionsHours.forEach( hr => prefHrElem.appendChild(hr));
setSelectOptionsMinutes.forEach( min => prefMinElem.appendChild(min));

//
// Populate Preferences from Storage
//
// (else populate storage with [index.html] defaults)
//

const storedExpiredPrefs = getStorageItem(localStorage, 'expiresPrefs');

if (!isEmpty(storedExpiredPrefs)) {
  window.ourExpirations.setPref(storedExpiredPrefs);
} else {
  x2bStorage.set({prefsObj: window.ourExpirations.getPrefs(), isNew: true});
}

setTimeout( () => { // 1000

  prefHrElem.value = window.ourExpirations.getPrefs().prefHours;
  prefMinElem.value = window.ourExpirations.getPrefs().prefMins;
  let prefNotifyVal = window.ourExpirations.getPrefs().prefNotification;
  prefNotifyElem.value = prefNotifyVal;

  // If 'notifications' is set as notify method, ensure we still have permissions.
  if (prefNotifyVal === 'notifications') {
    window.ourExpirations.getPermissions().then( ourPerm => {
      let prefNotifyIssue = false;
      switch (ourPerm) {
        case 'granted':
          break;
        case 'autodeny':
          prefNotifyIssue = true;
          window.ourExpirations.setError('Web-based notifications have been auto-denied by your browser. ' +
                                         "'Alerts' is the fallback notification method and will be used instead.");
          break;
        case 'denied':
          prefNotifyIssue = true;
          window.ourExpirations.setError('Web-based notifications have been denied. ' +
                                         "'Alerts' is the fallback notification method and will be used instead.");
          break;
        case 'default':
          prefNotifyIssue = true;
          window.ourExpirations.setError('Web-based notification permissions are not currently set. ' +
                                         "'Alerts' is the fallback notification method and will be used instead.");
          break;
        default:
          prefNotifyIssue = true;
          window.ourExpirations.setError('Web-based notifications are not supported on your device. ' +
                                         "'Alerts' is the fallback notification method and will be used instead.");
      }

      // Let's ensure the `toggleMenu` on initial `showList()` fires first.
      if (prefNotifyIssue) {
        updatePrefs({ prefNotification: 'alerts' });
        setTimeout( () => togglePrefs(), 1000);
      }
    });
  }

  window.reRender();

}, 10); // Giving the DOM operations a tick (or 10) to establish themselves.
