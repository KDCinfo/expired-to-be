import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.css';

// // // // // // // // // //
// [TimerBox.js]
//
import TimerBox from './components/TimerBox';

/**
 * [TimerBox] Alarm API Usage Details:
 *
 * https://github.com/KDCinfo/expired-to-be/src
 *
 */

/**
 *
 * All [TypeScript Interfaces] are at the bottom of this file.
 *
 */

class App extends React.Component<AppProps, {}> {

  render() {
    return (
      <div className="appz">
        <TimerBox
          ourExpirationItems={this.props.ourExpirationItems}
          setAlarms={this.props.setAlarms}
          refreshAlarms={this.props.refreshAlarms}
          prefs={this.props.prefs}
          triggerAlarm={this.props.triggerAlarm}
          updatePassiveNotification={this.props.updatePassiveNotification}
        />
      </div>
    );
  }
}

// `reRender` is to paint the TimerBox; initially and post-alarm actions.
(window as any).reRender = () => {
    ReactDOM.render(
      <App
        ourExpirationItems={(window as any).ourExpirations.currentItems()}
        setAlarms={(window as any).ourExpirations.setAlarms}
        refreshAlarms={(window as any).ourExpirations.refreshAlarms}
        prefs={(window as any).ourExpirations.getPrefs()}
        triggerAlarm={(window as any).ourExpirations.triggerAlarm}
        updatePassiveNotification={(window as any).ourExpirations.updatePassiveNotification}
      />,
      document.getElementById('root') as HTMLElement
    );
};

// `getPopup` will render the Chrome extension's HTML, then it will load the extension's JS script file.
const getPopup = () => {
  let domApplyTo = document.getElementById('web-root') as HTMLElement;

  async function fetchAsync(getUrl: string) {
    let response = await fetch(getUrl, { method: 'GET' });
    let data = await response.text();
    return data;
  }

  const initParser = new DOMParser(),
        nowGetScript = () => {
          let popupScript = document.createElement('script');
          // popupScript.src = '%PUBLIC_URL%/extensions/chrome/popup.js';
          popupScript.src = 'extensions/chrome/popup.js';
          popupScript.async = false;                        // This is on purpose; we need this available immediately.
          domApplyTo.appendChild(popupScript);              // console.log('popup.js is here.');
        },
        nowGetPrefsScript = () => {
          let popupPrefsScript = document.createElement('script');
          popupPrefsScript.src = 'extensions/chrome/x2b-prefs.js';
          popupPrefsScript.async = false;                   // This is on purpose; we need this available immediately.
          domApplyTo.appendChild(popupPrefsScript);         // console.log('popup.js is here.');
        },
        nowGetAboutMenu = () => {
          let domTopBoxH1 = document.querySelector('#topBox h1') as HTMLElement,
              domTopBoxH1Parent = domTopBoxH1.parentNode as HTMLElement,
              aboutMenu = `<div id="webapp-help">
                  <button type="button" id="button-toggle-webapp-help">About this App</button>
                  <div id="app-message">
                    <p>This web app allows for the setting and reminders for 'things that expire'.</p>
                    <p>In order for the alarm notifications to work, this browser tab should remain open;
                      but you can continue your browsing activities in other tabs.</p>
                    <p>If you would prefer to always have it on without having to keep a browser tab open,
                      you can also run this as a <a
                        href="https://chrome.google.com/webstore/detail/expired-to-be/kamjiblbgmiobifooelpmlkojmadmcan"
                      >Chrome browser extension</a>.</p>
                  </div>
                </div>`,
              docAbout = initParser.parseFromString(aboutMenu, 'text/html');
              // 00 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789 123456789|

          domTopBoxH1Parent.insertBefore(
            docAbout.getElementById('webapp-help') as HTMLElement,
            domTopBoxH1.nextSibling);
        },
        applyPrefs = () => {
          let x2bApplyTo = document.querySelector('.input-options') as HTMLElement;

          fetchAsync('extensions/chrome/x2b-prefs.html').then( prefData => {
            const prefsData = prefData.trim(),
                  docPrefs = initParser.parseFromString(prefsData, 'text/html'),
                  div1 = docPrefs.querySelectorAll('.x2b')[0],
                  div2 = docPrefs.querySelectorAll('.x2b')[1];

            x2bApplyTo.appendChild(div1);
            x2bApplyTo.appendChild(div2);

            nowGetPrefsScript();
            nowGetAboutMenu();
            (window as any).reRender(); // Update the Timer App to reflect any new Timers.

          }).catch( e => {
            console.log('And the --X2B-- catch(e) error is:');
            console.error(e);
          });
        };

  fetchAsync('extensions/chrome/popup.html').then( data => {
    const dataLeftIdx = data.indexOf('<body>') + 6,
          dataRightIdx = data.indexOf('<script') - 1,
          newData = data.substring(dataLeftIdx, dataRightIdx).trim();

    let doc = initParser.parseFromString(newData, 'text/html');
              // returns an HTMLDocument, which is a Document.

    domApplyTo.appendChild(doc.querySelector('div') as HTMLElement); // console.log('popup.html is here');

    nowGetScript();
    applyPrefs();

  }).catch( e => {
    console.log('And the catch(e) error is:');
    console.error(e);
  });
};

// Initial painting of TimerBox App.
(window as any).reRender();

// TimerBox is our (non-Chrome extension) 'Alarms API': We need to let the `reRender` of the TimerBox
// DOM painting clear the call stack before launching our 'Expired To Be' HTML and its related script.
//
// For this, neither `DOMContentLoaded` nor 'window.onload' sufficed, as neither always triggered.
// document.addEventListener('DOMContentLoaded', (window as any).getPopup, false);
setTimeout( () => {
              getPopup();
            },
            100);

/**
 * INTERFACES
 */
interface TimerListState {
  id: number;
  title: string;
  presetTargetTime: number;
  timeOfDay: string;
  cycle: number;
  active: boolean;
}

interface AppProps {
  ourExpirationItems: ExpirationItems[];
  setAlarms: () => TimerListState[];
  refreshAlarms: () => void;
  prefs: Prefs;
  triggerAlarm: (timerId: number) => Promise<string>;
  updatePassiveNotification: () => void;
}

interface ExpirationItems {
  whichEvent: string;   // whichEvent: "add"
  expiredId: number;    // expiredId: 2
  entryTitle: string;   // entryTitle: "x2b-2"
  entryPresetTargetTime: number; // 0 or positive futuer date in milliseconds
  entryHours: number;   // entryHours: 552  // [0|24|48|...] // 552 / 24 = 23 (days)
  entryMinutes: number; // entryMinutes: 0
  entryCycle: number;   // entryCycle: 0    // 0: daily // @TODO: allow to override snooze; off|on[daily|hourly]
}

interface Prefs {
  prefHours: number;
  prefMins: number;
  prefNotification: string;
  showPanel: boolean;
  allowTimers: boolean;
}
