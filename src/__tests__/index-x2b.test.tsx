/*
    I know nothing about testing, and have no idea if
    including all the code as I have below is correct
    or not (as it's done in the main [index.js] file).

    But... the below passed the 2 core tests:
        // Do snapshots align and measure up?
        // Plain and simple --> Does it load?
*/
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as renderer from 'react-test-renderer';

declare var Notification: any;

// The tests included below, although they do pass, are incomplete
// and meant only to serve as a base for testing (PRs are welcome)

    // Tests Include:
    // Jest Snapshots
    // Does it Crash?

// This article is a good resource for component testing
// https://www.sitepoint.com/test-react-components-jest/

// Using LocalStorage with Testing
    // Mock-up moved to: `../utilities/functions.ts`
    // Mock-up is now also `typed` with `TypeScript`

// [describe] Optional --> For logical grouping.

// Tests can be wrapped in either [test] or [it]

/* tslint:disable */
function htmlEscape(str: string) {
    const ourStr = str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\//g, '&#x2F;'); // forward slash is included as it helps end an HTML entity
    return ourStr;
}

function htmlUnescape(str: string) {
    const ourStr = str
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&#x2F;/g, '/');
    return ourStr;
}
/* tslint:enable */

//
// Expired To Be [Web App] - STATE MANAGEMENT
//

// var ExpiredToBe = function(this: any): any {
function ExpiredToBe(this: any): {} {
    // if (!(this instanceof ExpiredToBe)) {
    //     return new ExpiredToBe();
    // }
    this.items = []; // Item objects (item ID and whichEvent) to be passed to our TimerBox `alarms` API.
    this.alarms = [];
    this.prefs = {
        prefNotification: 'alerts', // alerts|modals|notifications|none (only passive)
        prefAlarmMsg: 'An alarm has expired.',
        prefCycle: 0,       // 0 = 'daily'; Snooze is not currently integrated (cycle only affects Timers).
        prefHours: 9,       // [0-23] 0 = Midnight (tonight), 1 AM, etc.
        prefMins: 0,        // [0-55] 0 = Top of the hour.
        prefSnoozeTime: 5,  // Used for Timers (not currently integrated).
        showPanel: false,   // The Alarms panel (visual display) is currently only intended for informative output.
        allowTimers: false  // Timers are coded but not currently integrated as they are on 'Done (for now)'.
    };
    this.notifyError = '';
    // Item to Process:
    // item[] = {
    //   whichEvent: 'add',        whichEvent: 'remove',  //   whichEvent: 'update',
    //   expiredId: timeId,        expiredId: timeId,     //   expiredId: timeId
    //   entryTitle: alarmId,                             //   entryTitle: alarmId
    //   entryPresetTargetTime: 0,                        //   resetTargetTime: 0,
    //   entryHours: numberHours,                         //   entryHours: numberHours
    //   entryMinutes: 0,                                 //   entryMinutes: 0
    //   entryCycle: 0 // daily [hr:1 | min:2]            //   entryCycle: 0
    // };
    this.removeLocalAlarm = (itemId: number) => {
        let thisAlarms = this.alarms.slice();
        thisAlarms = thisAlarms.filter((elem: any) => elem.id !== itemId);
        this.alarms = thisAlarms;
    };
    this.clearErrMsg = () => {
        this.notifyError = '';
        this.updateErrorMsg();
    };
    this.updateErrorMsg = () => {
        let ourElem = document.getElementById('notify-error') as HTMLElement;
        ourElem.innerText = htmlUnescape(this.notifyError);
    };
    this.getPermReturn = (isAlarm = false) => {

        return new Promise( (resolve, reject) => {
        this.clearErrMsg();

        // Return Strings: none|granted|denied|default

        if (!('Notification' in window)) {
            resolve('none'); // Device does not support desktop notification

        } else if (isAlarm) {
            resolve(Notification.permission);

        } else if (Notification.permission === 'granted') {
            // Let's check whether notification permissions have alredy been granted
            // If it's okay let's create a notification
            // var notification = new Notification('Hi there!');
            resolve('granted');

        } else if (Notification.permission === 'default') {
            // Otherwise, we need to ask the user for permission
            // else if (Notification.permission !== 'denied' || Notification.permission === 'default') {

            try {

            Notification.requestPermission().then((permission: string) => {

                if (permission === 'denied' || permission === 'granted') {
                // User denied|granted permissions
                resolve(permission);
                }

                if (permission === 'default') {

                    if (Notification.permission === 'denied') {
                        // The browser has decided to automatically deny permission.
                        // https://stackoverflow.com/questions/47263967/...
                        // ...chrome-treats-default-result-from-notification-requestpermission-as-denied#answer-47516416
                        resolve('autodeny');
                    }
                    resolve(permission);
                } else {
                    resolve(permission);
                }
            });

            } catch (error) {
            // Safari doesn't return a promise for requestPermissions and it throws a TypeError.
            // It takes a callback as the first argument instead.
                if (error instanceof TypeError) {
                    Notification.requestPermission((permission: string) => {
                        resolve(permission);
                    });
                } else {
                    throw error;
                }
            }
        } else if (Notification.permission === 'default') {

            if (Notification.permission === 'denied') {
                resolve('denied');
            }
            resolve('default');

        } else {
            resolve('denied');
        }
        });
    };
    return {
        currentItems: () => this.items,
        alarmItems: () => this.alarms,
        getPrefs: () => this.prefs,
        setPref: (ourPrefs: any) => {
            let whichData = Object.assign({}, this.prefs, ourPrefs);
            this.prefs = whichData;
        },
        setAlarms: (ourAlarms: any) => {
            this.alarms = ourAlarms;
        },
        getAlarm: (itemId: number) => this.alarms.find(
            (alarm: any) => parseInt(alarm.title.substr(4), 10) === itemId
        ),
        refreshAlarms: () => {
            showList(); // @TONOTE: This doesn't exist yet, but it will when [popup.js] is loaded.
        },
        removeAlarm: (itemId: number) => {
            this.removeLocalAlarm(itemId);
        },
        processItem: (itemObj: any) => {
            if (itemObj.whichEvent === 'remove') {
                this.removeLocalAlarm(itemObj.expiredId);
            } else if (itemObj.whichEvent === 'clearall') {
                this.alarms.length = 0;
            }
            this.items.push(itemObj);
        },
        removeItem: (itemId: number) => {
            let thisIdx = this.items.findIndex( (item: any) => item.id === itemId );
            let newItems = this.items.slice();
            newItems.splice(thisIdx, 1);
            this.items = newItems;
        },
        //
        // Get Web Notifications API Permissions
        //
        // https://developer.mozilla.org/en-US/docs/Web/API/Notification/permission
        // https://stackoverflow.com/questions/38114266/web-notifications-not-appearing-in-safari#answer-39282539
        //
        getPermissions: (isAlarm = false) => {
            // Let's check if the browser supports notifications
            return this.getPermReturn().then( (thisPerm: any) => {
                return thisPerm; // 2018-03-23 - Gotta return something so you have something to be returned. :P
            });
        },
        setError: (errMsg: any) => {
            this.notifyError = htmlEscape(errMsg);
            this.updateErrorMsg();
        },
        clearErrors: () => {
            this.clearErrMsg();
        },
        updatePassiveNotification: () => {
            runPassiveNotification('1');
        },
        triggerAlarm: (timerId: number) => {

            this.getPermReturn(true).then( (thisPerm: string) => {

                // updatePassiveNotification(); // props call to `updatePassiveNotification` is done separate and first.
                if (thisPerm === 'granted') {
                    let msgTxt = 'One of your Expiration items is set to expire!',
                        msg = new Notification( 'Expired To Be', {
                                    body: msgTxt + ' Your Expiration items are at: https://kdcinfo.com/expired-to-be',
                                    icon: 'icon32.png'
                                });

                    msg.addEventListener( 'click', (event: any) => {
                        // message(msgTxt, true);
                        parent.focus();
                        window.focus();
                        event.target.close();
                    });
                } else {
                    message('An expiration alarm was triggered, ' +
                            'but notification permissions have been revoked since the alarm was originally set.',
                            true);
                }
            });
        }
    };
}

declare global {
    interface Window { ourExpirations: any; }
}

/* tslint:disable */
// tslint:disable-next-line
// window.ourExpirations = (ExpiredToBe());
/* tslint:enable */

window.ourExpirations = new ExpiredToBe();
// window['ourExpirations'] = new ExpiredToBe();
// (window as any).ourExpirationItems = new ExpiredToBe();
// /* tslint:disable */window.ourExpirationItems = new ExpiredToBe();/* tslint:enable */
// Game.prototype.createBoard = function() {

import TimerBox from '../App';

describe('TimerBox:', () => {

    test('Jest Snapshot', () => {
        const component = renderer.create(
            <TimerBox
                ourExpirationItems={(window as any).ourExpirations.currentItems()}
                setAlarms={(window as any).ourExpirations.setAlarms}
                refreshAlarms={(window as any).ourExpirations.refreshAlarms}
                prefs={(window as any).ourExpirations.getPrefs()}
                triggerAlarm={(window as any).ourExpirations.triggerAlarm}
                updatePassiveNotification={(window as any).ourExpirations.updatePassiveNotification}
            />
        );
        let tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });

    it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(
            <TimerBox
                ourExpirationItems={(window as any).ourExpirations.currentItems()}
                setAlarms={(window as any).ourExpirations.setAlarms}
                refreshAlarms={(window as any).ourExpirations.refreshAlarms}
                prefs={(window as any).ourExpirations.getPrefs()}
                triggerAlarm={(window as any).ourExpirations.triggerAlarm}
                updatePassiveNotification={(window as any).ourExpirations.updatePassiveNotification}
            />,
            div);
    });
});
