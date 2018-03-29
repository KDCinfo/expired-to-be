# Web Notifications API - Process Flow (thoughts in process)

## Page Load

> If Notifications method is set to 'notifications'
  - Run [Permission Check]
    > If 'denied'
      - Set [Notification Error] (same as alarm trigger)
        "The browser's 'Notifications' permissions have been reset, so an alarm could not use the 'notifications' method.
      - Expand 'App Preferences' fly-up
        Should show error.

## Preference Panel

  <select> onChange
    > If set to "Notifications"
      - Run [Permission Check]

## Alarm Trigger

  - Run [Permission Check] --> bypass Notification.requestPermission()

    > If good ('granted'), trigger new Notification message

    > If not good ('default' or 'denied')
      - Set [Notification Error] (same as page load)
      "The browser's 'Notifications' permissions have been reset, so an alarm could not use the 'notifications' method.

      > Notification method will remain on 'Notifications'; Error will persist until;
        - Clear this on 'notification change' (per above)

## [Permission Check]

  - Clear [Notification Error]

  > If not from alarm trigger
    - Request permissions if necessary
      - If denied, set [Notification Error]

  - Return permission level (granted; denied; default)

--------------------------------------------------------------------

# 2018-03-21 - Wednesday

@3:00 PM
	- Making some progress.
	- Think I've got the process flow mostly figured out.
	- Created various `notifyError` message-related methods.
	- Working code into <select> change and page load.

@8:30 PM
	- Got a coding draft going for the 3 "notification" action locations (endpoints?).

@8:55 PM
	- Next issue; just found `Notification.requestPermission()` is non-blocking.
		(Hindsight is 20/20.)

@10:30 PM
	- Refactored to accommodate requestPermission()'s async-ness.
	- Next issue; Clicking 'X' to close the RequestNotification() popup box;
		Chrome blocks automatically after clicking the 'X' to close 3 times.
	- Cannot find anything except one answer on this.
		And it's not a solution, it's a workaround.
		Chrome will still do it, but at least my code can catch for it.

@12:15 AM
	- Stuck on... `getPermissions()` all running before its `.then()`
		I can't wait on what I'm waiting on.
		Something needs to get waited on first.
		Then we can run the `.then()` on the rest.
