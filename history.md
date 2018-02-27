# Expired To Be

## A Chrome Extension

## Detailed Development History

### 2018-02-06 - Tuesday

* Began project: Copied over folders and files from 'Character Counts' (my first Chrome extension) and began editing.

@2:05 PM
    - Got "Expired To Be" stripped down to essentials.
    Ready for development.
    Then notifications.
    and localState.

### 2018-02-07 - Wednesday

@2:30 AM
    - Made it a couple hours... gonna head back to bed.
    Starting new projects is exhausting for me.
@7:30 PM
Figured out doing the Chrome Storage .get() Async-ly... wrapping in a Promise.
    - Ready to work on saving the form into Chrome Storage.

Watched through an async/await video.
    - Forked their Gist with examples... nice to have options!!
Watching through a GraphQL video now.
    - I wanna get back to my Chrome Extension, but this is good stuff Maynard!!
Bookmarked the GraphQL video (below) (it's near 50 min... another time...)

### 2018-02-08 - Thursday

@6:45 PM
    Read a little on Quokka... (very little; one screen's worth).
        Just can't get into it right now.

### 2018-02-09 - Friday

Tried using Quokka...
    - Live updates only available in the Pro edition.
    - Eh!? What use is it then... that was the whole reason I installed it! :-/
    - Oh thee well.

@6:30 PM
    - Got a little coding in between life and not feeling well.

@7:30 PM
    - It's only 7:30 PM and I'm making a little progress.

@8:30 PM
    - Think I'm starting to spin my wheels.
    - Got state pretty much setup.
    - Got all the code pretty much up to the split between saving new and existing.
        - I've got the 'new' part near done (maybe all, but that's where I'm spinning).

@9:00 PM
    - This app got kinda complicated kinda fast
        (i.e., well that escalated quickly!)
    Found that for setting timeouts or intervals, you need to do a "background_page".
    Per a SO question
        (it "was" -1; I upped it to 0; no one should get negatives for asking a question!)
        The 2nd answer (which was 0; I upped it) pointed me to:
            https://developer.chrome.com/apps/alarms
    Looking at chrome.alarms now (which also has a repetition duration).

@9:50 PM
    https://developer.chrome.com/apps/app_codelab_basics
    Sooo... After reading through and setting up everything now as
        a Chrome (background) App, on Step 2, it reads,

        Important: Chrome will be removing support for Chrome Apps.
        Read the announcement and learn more about migrating your app.

    I'm going down a deprecated path.
    I get to start again... back to extensions.
    Alarms led me to their apps... wth?! Guess I'll figure it out.
    Back to extensions... :)

@10:05 PM
    Reading back through the chrome.alarms API docs, it would seem they should be enough.
    Reading through https://developers.chrome.com/apps/migration
        I do need a "hosted" page for these... so folks can access their lists offline. D'oh!
    I can do the hosted page later... https://kdcinfo.com/app/expired2b/

@11:30 PM
    Got the alarm working.
        Set it. 1 min later... console.log worked.
        Set it. Closed popup. Opened popup. Worked.
        Set it. Closed popup. Opened another window's F12. Nada.
    Reading further on `alarms`...
        https://developer.chrome.com/extensions/event_pages
    Moving on to Event Pages
        ...Tomorrow.

@1:25 AM
    - Got caught up in a little chat in FED Slack '_help' channel on Chrome Extensions.
        > I don't have any special dev tools for extensions... gotta reload every time.
    Tried some more stuff on the Alarms.
        Don't need notifications... those are for the System Tray notifications.
        Somehow or some why the syncing ain't syncing.

### 2018-02-10 - Saturday

My biggest dilemma is how to notify the user of an alarm.
    - Notifications
    - Try an alert?
    - Have a hosted page and have the tab's count update from 0, 1, 2, ...
    - E-mail?
    -

@6:10 PM
    - Still can't get it. How to notify users...???
    Nothing works once that popup is closed.

@6:35 PM
    - I don't think "background" is what I want.
        That appears to be for when Chrome closes (to keep stuff running).
        Um, no thx.
    I think what I'm trying to do is to build an "app" via an "extension".
        Square peg, round hole? Maybe? Maybe not?

@6:50 PM
    - I took another route... I got the icon to change (even after the popup is closed.)
    Now time to try if background dev tools aren't open.

@9:45 PM
    I FINALLY found my way through the muck that is UX design.
    I was indeed trying to force the extension to be an app.
    In realizing its limitations, I refactored my requirements (read: expectations).
        I instead went by way of a better 'extension notification' system,
        being "icon badge text".
    I figured out how to get and store a numbering system onto the icon itself;
        ..."in the background" !!!
        With any tab open, or no tabs open (the next time Chrome is opened),
            the numbers should calculate and appear. :D

### 2018-02-11 - Sunday

@8:50 PM
  - Got time differences figured out.
  Had to long-form the date creation for both current date and expiration date.
  Creating a new date does so with timezone offset.
  Creating a date from an HTML5 date input field, it only provides the yyyy-mm-dd

@12:05 AM
  - I'm wearing down...

@2:15 AM
  - Great progress!!!
  Got the expiration items showing nicely in a list.
  Got the "Clear All" to work correctly (incorrect expectations; 4 things to clear)
    Storage (async)
    Alarms (async)
    DOM Nodes
    ourState (local state; should be same as storage)

### 2018-02-12 - Monday

@10:10 PM
  - Making good progress.

@12:20 AM
  - Done with layout.
  - Done with 'Delete' function.
  - Added click listener for `activate` checkbox.

  Ready for 'De/Activate'.
  Ready for 'Edit'.

  Ready for bed.

### 2018-02-13 - Tuesday

@5:45 PM
  - Completed 'active' toggle from list.
  - Completed row color for 'expired but active' items (lightsalmon).

@7:15 PM
  - Fixed 'expired but active' count not updating in the icon badge text.
  - Completed adding 'expired but active' in [eventPage.js] so badge text is updated on the load of the extension.
    Did a little searching and couldn't find anything on best practice.
    All I know is all 3 environments are `closed`
      (background/eventPage, popup.js, and the content page).
  - Also added setting icon badge backgroundColor to orange (else it was blue by default).
    Don't think I still need it in popup.js, but ... /shrug

@9:20 PM
  Found out I already coded the delete part.
  Merged Edit and Delete into one event for click event handlers.

  Trying to find out why when I edit an item, it won't save.
  That is until I found...
  ```} else {
    // Existing ID; needs to update itself in the list.
  ```
  I haven't written it yet. :P :o D'oh !!!

@10:30 PM
  - The Edit and Delete are both working Beautifully!!!
  The icon badge updates exactly as it should.

A few more @TODO's and I think I'm home free.

  "What does 'Active' mean?"

  I would think active means there's a timer that's active.
    But we can't have negative timers.
    So we can't have active negatives (or zeros, even).
  Or does active mean it's in the green... positive? (not bearing any alarms.)
  I think I need to redo all the 'active' sections.
    It should reflect live alarms.
  Well, shit...

@DONE:
   // Finish 'item' HTML layout.
   // Add 'item' delete.
   // Add 'item' edit.

@12:30 AM
  @DONE:
   // Auto-update the date field.
   // Auto-update the Val field based on SelectName option.

  - Also fixed some aesthetic alignment issues.

Still to do --> Change 'active' to 'alarm' and refactor all 'active' code.
  - Also, if in "edit" mode on an item; provide a way to create a 'new' item.

### 2018-02-14 - Wednesday

- Fixed "between" time display formatting issue.

- Need to think through how to show alarms on each items.
  chrome.alarms is an async call (side effect).

Options:
  Hold up entire "showList()" function -- put in the chrome.alarms callback.
  Store each alarm per item (add a field to the state) and control manually.

@8:35 PM
Just thought of another plan:
Run a `Promise` on the getting the alarm individually
put in a placeholder first, and update it based on either a resolve or reject (reject if no alarms).
  individual promises should be fine, right?
  can I do a promise up front; just get all the alarms.
    then check if each one is in that returned array.

@10:20 PM
  Got stuck trying to put 'alarm status' while creating the showList() DOM table.
  Posted question in FED Slack.
    Got stuck with option 2: Gonna move on with my first option
      (run a post-function and append them after-the-fact).

  Reply to my question (I used this, in addition to an answer on Stack Overflow.)

  - darko [2018-02-15 at 2:02 AM] in #javascript
    what you can do on the front end is generate your table first, and in the process create your api calls and push them to an array.
    ```
    const callsToMake = [];
    for ( let row of rows ) {
        callsToMake.push(Api.get(row.field.id));
         // the rest of the generation part
    }
    Promise.all(callsToMake)
    .then(result => {
         // do something on fulfilled
    });
    ```

@2:20 AM
  Completed 'active alarms' layout showing which items have active alarms set.
    Used the blue outline color that Chrome uses for their outline.
  Set outlines too; for non-Chrome outliners.
  Adjusted "Save" button (0.75 orange).

  At some point earlier I also:
    - Created a Reset button and set to reset form with current current itemId.
    - Created a New button and set to set form to all default values.

### 2018-02-15 - Thursday

  - Sick.

@8:05 PM
  - Tried doing that Promise in the eventsPage.js, but either I can't think straight or I'm just not seeing it once I get into the code.

### 2018-02-16 - Friday

Worked on Expired To Be
  - Going good now. Found a SO solution that I was able to couple with 'darko's example code, and after a dozen or more attempts, I found how they all work together, and it makes perfect sense. (I eventually figured out all the async calls and knit them together with a small custom internal messaging system.)
  - Have eventsPage.js done; I think.
  - Also did a little matrix for status'.

### 2018-02-17 - Saturday

@12:30 PM
  - Did GistBox + 3 JS challenges
  - Worked remote all night with nephew on fixing his laptop.

### 2018-02-18 - Sunday

@11:00 PM
  - Been making good progress most of the day.

I think all the logic is done.
  - Need to implement user update notification system.

@2:50 AM
  - Leaving off on:
    function setItemEdit(itemId) {
  - And need message notification system.

## To Do Accomplishments

[2018-02-13 - 2018-02-20]

```javascript
    // @TODO:

       // X Active but no alarm: Warn with Icon Badge Text and TR row highlighting (when popup is open).
       // X After edit -> save, it only says timer was created. // Fixed `message` function.
       // X Edit, Delete, Save -> Creates alarm; No storage. // Post-delete, zeroed out form ID.
       // X After any save, clear form for new. // saveChanges() --> updateForm();

       // X Still need to indicate if an 'edit' item is in the form (where ID is non-zero).
          // Can be done inside showIt() AND when Edit is clicked (and `.input-new`).

       // Clean up all notification messages (and re-hide ID in <form>).
          // No more 'errors'; just messages / notifications.
          // `Clear All` should provide a message.

       // X 'item' de/activate -- per alarms.
       // X Analyze alarms; Create, edit, delete, ...
          // X Clear Alarm: You can deactivate an active alarm.
          // X Set Alarm:   You can activate a deactivated item (with a proper between).
             // X If you try to set active, and date has passed, provide a notification.
             // 'active' can be set on an expired item, but only programmatically (i.e.,
             // it can only end up in that state by way of an alarm passing.)

        // @TONOTDO:
        // This alarm is undefined. It isn't on. Should we check it's ID with 'active'?
        // In walking back through the entire code, what I'm looking for here appears to be an impossible state:
        // Active but no alarm.
           // X You cannot turn off an alarm without deactivating it.
           // If you clear the alarm manually, then you're missing the app's purpose.
              // The item will just stay active until such time as you change or delete it.
           // It is possible to save it in an expired state, but it will not set an alarm.
           // If an alarm passes, it'll stay in 'active' state, which will trigger the expiration flags.
           // Those flags are:
              // 1) Extension Icon (badge text), and
              // 2) A semi-translucent light-red row highlighting with a semi-opaque ["Expired"] stamp on it.
        // All that in mind, I think I'm done. Backup code with notes. Strip superfluous notes. Commit to Git.

        // @TODONE: change .extension to .runtime
           // (1 place; eventPage.js -> chrome.runtime.onMessage)
```

## Detailed Development History (continued)

[2018-02-19 - 20__-__-__]

### 2018-02-19 - Monday

Done with the Expiration To Be app.
  - Even took a few hours and made it a little more presentable than I thought I'd be able to.
  - Made a screenshot.

  - Just need to do write-ups, commit, publish, and promote everywhere.

@5:00 AM
  - Bed. Sleep.

### 2018-02-20 - Tuesday

@1:30 AM
    - Code is complete.
    - Manual testing complete.
    - Code backed up.
    - Superfluous code stripping in process.

@5:00 AM
    - Completed applying a semi-acceptable design.
    - Finished cleaning up code.

@9:30 PM
  - Split out `history` page from readme and caught it up to now.

@10:30 PM
  - Created public GitHub repo: expired-to-be

@11:30 PM
  - Created and uploaded to Chrome Store.

@11:45 PM
  - Committed all code to GitHub.

@1:30 AM
  - Made first update to extension on Chrome Store.
    (filled in outer edges of extension panel with orange to complement the outer orange border.)

@2:05 AM
  - Made second update to extension on Chrome Store.
    (added confirmation alert on "Clear All" button.)
    (also on clear all, added zeroing out of the form's ID.)

### 2018-02-21 - Wednesday

New issue was posted on GitHub.

  - Looks to be iOS-related. Need to recreate.
  - I got Chrome installed on my iPad, but no extensions (it's considered mobile; even if Requesting Desktop Site). Google search said it's possible: Perhaps something has changed since those results.
  - I installed Chromium on Ubuntu. 4 hours later got it working. Looks "okay".
  - Posted response in GitHub about CSS or font being the issue.
  - Tried another Unicode character: I determined that, because of the major displacement with the iOS version, I cannot, in any good way, make any of these work (without an environment to work in). I then just considered applying a left border; thick; 5px should work. I then adjusted the padding: Made it the same as the 'Item Edited' indicator in the table below, so consistency is good.
  - Tested on Ubuntu and Windows. Should be solid with a border-left.
  - Updated the Chrome web store.
  - Updated issue ticket and closed.
  - Committed files to GitHub. `Issue resolved. Decorative Unicode character replaced with CSS border-left: 5px;`

### 2018-02-22 - Thursday

@2:30 - 4:00 PM
  - Started on Expired To Be - "Export List" layout.

  > Will be a drop-up menu;

  > Clear All button will join it in its current location.

@6:15 PM
  - Research: Security → XSS → JS + DOM

@8:30 PM
  - Went through more XSS research.
  - Implemented 2 Escape functions.
    Testing characters (25): <_>-\/!@#$%^&*();'?+"[`~]
    The web's `escape` and `unescape` (which I found on Sat; 2 days hence), does the same thing as these two functions, but does not handle the `/` (forward slash) as recommended by OWASP. Additional details provided in the code.
  - Moving back to Export... XSS research had me tied up all day.

@12:45 AM
  - Got Expired To Be "drop-up menu" working.
    - Menu Layout Oops: Somehow missed 'padding: 0'
        and was just seeing '-webkit-margin-left-start' and such.
    - Researched best approaches to transforming the menu's height.
        Went with `scale(1, 0)` and `scale(1, 1)`
          `transform: scale(1, 0); transform-origin: bottom left;`.
    - Researched best approaches to clicking outside of the menu button and menu areas.
        [https://css-tricks.com/dangers-stopping-event-propagation/](https://css-tricks.com/dangers-stopping-event-propagation/)

### 2018-02-23 - Friday

@12:55 PM
  - Got storage "get" separated out into its own closure object named `x2bStorage`.

@2:15 PM
  - Got popup.html to come up on iPad.

  > Loaded up another VM and set to go through wireless adapter.

  > iPad doesn't like using the hostname, so using IP address (192.168.43.xxx).
  - Need to fix errors.

@4:00 PM
  - iPad now shows page with a sample item object.
  - Had to use alerts to know when code was broke.
  - iPad doesn't like passing undefined objects (i.e., chrome, chrome.storage, chrome.alarms).

@12:30 AM
  - Got x2bStorage setup for `get` and halfway with `set` (and `clearItem`).
  - Feels like I made a lot of progress, 
      and it feels like I haven't 'cause I've been working on this for the last 2-3 hours or so.
  Need to finish this part up so I can do the export, so I can then do the SPA page
    (React is doubtful; more likely just plain HTML/CSS/JS).

### 2018-02-24 - Saturday

Wrote out my environment setup:

> My laptop connects to both an ethernet (switch/fw/modem) and wireless (my mobile hotspot). I host two Ubuntu Server 16.04 VMs:

  1. Wired (Ubuntu with Desktop Interface)
     - Uses wired LAN adapter, which goes through the ethernet.
     - Can hit the internet (do updates, hit sites, etc.)
     - My iPad cannot hit the VM (different networks).

  2. Wireless (Ubuntu Terminal Server)
     - Goes through VBox host-only; wireless adapter,
     - which goes through my phone's hotspot.
     - Can not hit the internet.
     - My iPad can hit the VM (because it's on the same (wireless) network).

@6:10 PM
  - Been working on outlining Expired To Be
    (primarily storage, alarms, and notifications).
  - Have a draw.io diagram flow half done.

@10:05 PM
  - Wrote out entire functional diagram in draw.io and published with Google Drive. URL is in popup.js at top and in Readme.md.
  - Changed entire interface font (didn't realize how bad the font was until I saw it on the iPad - all cursive and 90% illegible). Can't wait to get this updated in the Chrome Store.

@2:20 AM
  - Figured out my iPad problem.
    Tested localStorage; it worked.
    Was a problem with my code.
      The `} else {` wasn't returning a `Promise`.
      Failing silently... ... ... (albeit not really 'failing', just how it works.)
  - Also figured out issue with clearing an item.
    My lack of understanding between Storage and localStorage.
    `Storage` (initial case) represents the parent API element of
      localStorage and sessionStorage.
    `storage` (lowercase) is a param in 2 custom helper functions at the bottom of the app.

### 2018-02-25 - Sunday

@5:50 PM
  - Fixed a couple more additional found bugs.
  - Finished [Happy Paths file](assets/x2b-happy-paths.md).
  - Updated `Readme.md`.
  - Updated `history.md`.

@3:55 AM
  - Calling it a night.
  - Got Export working.
  - Got Import working.
    Need to close import stuff on List Options menu open or close.
    A few other @TODO: items I sprinkled in the code.

### 2018-02-26 - Monday

@1:40 PM
  - Wrote out RAM consumption levels post-reboot.

    GB | Event
    -- | -----
    3.9 - 4 | before reboot
    2.9 - 3 | clean
    4.6 | vm #1 (ubuntu with desktop)
    5.1 | vm logged in
    6.4 | vm #2 (ubuntu terminal-only)
    6.6 | vm logged in
    6.8 | opened windows file explorer
    6.9 | z: and y: mapped drive connects
    6.8 | closed explorer
    7.1 | sublime text 3 (9 +1 untitled +1 small find results)
    8.5 | chrome (3 windows; +6 +4 +2 = 12 tabs; a light day)

  - Cleaned up some 'import' code. Messages are better and more relevant.

@4:00 PM
  - Got import fully working.
    - All @TODO items are done except 2.
    - Started on import progress bar.

  - @TODONE:
    x Allow importing of ID's if unique.
    x Tested import max length (cut it down to 12)
    x Close 'n' elements when List Options is opened (or closed, or both).
    x When opening List Options; hide the import stuff (if open)
    x Put small 3-4px radius on List Options popup and 2-3 input fields.

  - @TODECIDE: Should we allow for duplicate names?
    - Currently it does (ID's are used for uniqueness).
    - Should it inform/ask the user if an item already exists?
    - Perhaps they have a long list and didn't know.
    - How would this affect import? Can't just assign a new 'title'.
    - Could do pref setting for Insert (fail dupes) or always Overwrite.
    - Decision: Allow duplicates; @TODO: Add sorting.

@12:05 AM
  - Import - Progress bar is complete.
  - Import - Added link to import 2 samples.
  - List Options menu - Added background <div> to allow for RGBA.

@2:35 AM
  - Went through code. Cleared out: [@TODO:], [console.log], [alert]
    + Quite a few @TODO:'s remain as placeholders for future releases.

## @TODO:

  - Implement 'alarms' interface for non-extension users.
  - Implement 'notifications' based on 'alarms' interface.
  - Add sorting.
