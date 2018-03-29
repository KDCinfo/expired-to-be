# TimerBox Component Usage Clarification

`TimerBox` is an 'integrated' Alarms API. "Integrated" meaning it was implemented directly in the Expired To Be app, but was not made to stand as its own API.

## Timers

The 'Timers API' is used in the [Done (for now)](https://github.com/KDCinfo/done-for-now) Web App.

  - Recurring setTimeouts
  - Active | Not Active
  - 3 Cycles                    [min, hr, day]
  - 3 Time's Up options         [snooze, disable, done (for now)]
  - 1 Notification option       [modals (passive)]

## Alarms (e.g., for Expired Items)

The 'Alarms API' is used in the [Expired To Be](https://github.com/KDCinfo/expired-to-be) Web App. The X2B app still contains the code for Timers (such as setting a recurring setTimeout, and snoozing), but Timers were not implemented as a part of Expired To Be. A separate API could be created from this `src`, and developed to support both Timers and Alarms.

  - On | Off                    (setTimeout either exists or doesn't exist)
  - 0 Cycles                    [n > now() || n <= now()]
  - 1 Time's Up option          [disable (delete timeout)]
  - 3 (4*) Notification options [alerts|web notifications|modals|none*]

## Notification Options
  [ ] web notifications
  [ ] alerts
  [ ] modals (passive-only)
  [ ] none (passive-only)

## API Breakdown

The following was pulled from the `TimerBox.tsx` code:

> Timers   - Can be active/non-active [id, title, presetTargetTime, timeOfDay, cycle, active]

> Timeouts - Contains only active Timers [Timer ID, setTimeout ID]

// Timer - Add
    // this.setTimer(...params) // From <form> submit
    // --> this.addRemoveTimeout --> (lastId+1)

// Timer - Toggle Activation
    // ID passed in

    // Timer - ON
        // Create/Start Timeout: this.addRemoveTimeout(timerId, 'add')
        // Toggle Timer on: this.toggleTimeout('on')

    // Timer - OFF
        // Remove/Clear Timeout: this.addRemoveTimeout(timerId, 'remove')
        // Toggle Timer off: this.toggleTimeout('off')

// Timer - Remove
    // From <Timers /> Listing
    // If timer is active: this.addRemoveTimeout(timerId, 'remove')
    // Remove from timerList: this.removeTimer(timerId)

    // Text PADDING: Pre-ES8 (pre-ES2017) (i.e., the old-fashioned way)
        // entryHoursPad = entryHours.toString().length === 1 ? '0'+entryHours : entryHours,
        // entryMinutesPad = entryMinutes.toString().length === 1 ? '0'+entryMinutes : entryMinutes,
    // Text PADDING: ES8 (ES2017) (i.e., the new way)
        // Couldn't get padStart() to work in testing, so went back to pre-ES8
            // (installed babel-preset-2017 and added to [.babelrc] file)
        // entryHoursPad = entryHours.toString().padStart(2, '0'),
        // entryMinutesPad = entryMinutes.toString().padStart(2, '0'),
