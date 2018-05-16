# Expired To Be

## A Chrome Extension

## Detailed Development History

> 2018-02-06 - Tuesday

  * Began project: Copied over folders and files from 'Character Counts' (my first Chrome extension) and began editing.

@2:05 PM

  - Got "Expired To Be" stripped down to essentials.

    - Ready for development.
    - Then notifications.
    - and localState.

> 2018-02-07 - Wednesday

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

> 2018-02-08 - Thursday

@6:45 PM
    Read a little on Quokka... (very little; one screen's worth).
        Just can't get into it right now.

> 2018-02-09 - Friday

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

> 2018-02-10 - Saturday

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

> 2018-02-11 - Sunday

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

> 2018-02-12 - Monday

@10:10 PM

  - Making good progress.

@12:20 AM

  - Done with layout.

  - Done with 'Delete' function.

  - Added click listener for `activate` checkbox.

  Ready for 'De/Activate'.
  Ready for 'Edit'.

  Ready for bed.

> 2018-02-13 - Tuesday

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

> 2018-02-14 - Wednesday

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

> 2018-02-15 - Thursday

  - Sick.

@8:05 PM

  - Tried doing that Promise in the eventsPage.js, but either I can't think straight or I'm just not seeing it once I get into the code.

> 2018-02-16 - Friday

Worked on Expired To Be

  - Going good now. Found a SO solution that I was able to couple with 'darko's example code, and after a dozen or more attempts, I found how they all work together, and it makes perfect sense. (I eventually figured out all the async calls and knit them together with a small custom internal messaging system.)

  - Have eventsPage.js done; I think.

  - Also did a little matrix for status'.

> 2018-02-17 - Saturday

@12:30 PM

  - Did GistBox + 3 JS challenges

  - Worked remote all night with nephew on fixing his laptop.

> 2018-02-18 - Sunday

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
    // @TODONE:

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

> 2018-02-19 - Monday

Done with the Expiration To Be app.

  - Even took a few hours and made it a little more presentable than I thought I'd be able to.

  - Made a screenshot.

  - Just need to do write-ups, commit, publish, and promote everywhere.

@5:00 AM

  - Bed. Sleep.

> 2018-02-20 - Tuesday

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

> 2018-02-21 - Wednesday

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

> 2018-02-22 - Thursday

@2:30 - 4:00 PM

  - Started on Expired To Be - "Export List" layout.

  > Will be a drop-up menu;

  > Clear All button will join it in its current location.

@6:15 PM

  - Research: Security --> XSS --> JS + DOM

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

> 2018-02-23 - Friday

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

> 2018-02-24 - Saturday

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

> 2018-02-25 - Sunday

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

> 2018-02-26 - Monday

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

<!-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->

@10:45 PM

  - Completed progress bar.

  - Fixed a lot of flow and messaging issues with import.

@10:50 PM

  - Not done.

  - Found issues while looking at it on my phone.

@12:05 AM

  - Import - Added link to import 2 samples.

  - List Options menu - Added background `<div>` to allow for RGBA.

@2:35 AM

  - Went through code. Cleared out: [@TODO:], [console.log], [alert]
    + Quite a few @TODO:'s remain as placeholders for future releases.

@3:00 AM
- Expired To Be 1.4 Released

    - You can export your existing expiration items.

    - You can import over 500 items (the app will walk through saving each item from the list you provide).

    - I've also completed refactoring to enable a SPA version of the app, but will take some time to implement a local 'alarm' interface, and to implement an optional (and opt-in) Web/Desktop Notifications system.

@3:20 AM

  - Blogged.

  - Tweet.

  - Updated the readme some more. Committed (twice).


## X2B Version 2.0


> 2018-02-27 - Tuesday

  - Researched on browser.alarms.

    - No Edge support whatsoever.

  - Mulling over entire architectural approach.

> 2018-02-28 - Wednesday

@10:15 AM

  So; Researching using my TimerBox React component as my alarms API.

  - Researching using a React component as just part of the page.
    It has its own virtual DOM, so I'm guess I'll need to use `refs` a bit.
    Found 2 good pages to look at.

@2:05 AM

  - Going through some major architectural approach decisions.
    Working between:
      'Expired To Be' and 'Done (for now)' (and later, my 'React Native Date' component).
      GitHub, GitHub Pages (w/ Travis CI), CodePen, and local.

      Primary Goal: Have one codebase for Expired To Be main form (i.e., no pre- or post-build copying).

  - Couldn't get 'Done (for now)' working on CodePen without Babel precompile.

  - Finally the only solution that seems to work is convert all JSX to React.CreateElement().
    Shouldn't need Babel or TypeScript at that point.

> 2018-03-01 - Thursday

@5:29 PM

  - Figured out solution to my problem.

  - Wrap `popup.html` in an `index.php`.
    popup.html is read from `manifest.json` by the Chrome Extension.
    index.php is read from `travis.yml` by GitHub Pages.

      - Will be wrapped with library loads.

      - React can load via `<script>`.

      - Alarms API can load via `<script>`.

  So; 'Expired To Be' is going to be introduced to React, and React's build process. Gonna do a CRA install.

    [ cd ./expired-to-be ]

  - Moved everything except `.git` out of the `expired-to-be` folder.

  - Upgraded `npm` ( upgrade npm | upgraded npm | install npx )

  - Installed CRA (inside `expired-to-be` directory):

    [ `sudo npx create-react-app .` ]

  - Moved current extension files into their own subfolder:
    [ ./expired-to-be/public/extensions/chrome/ ]

    This will be their new home. It will be where updates to the Chrome Store will happen. And when the Chrome Store is update, so will be the GitHub Pages web app.

  - Issue: Because CRA runs with Node, it's entry point is restricted to [ `index.html` ]. This will limit the portal logic into the extension's code.

    Also, was reminded that Node doesn't interpret PHP, so redirects to `index.php` (obv) failed.

  So; Looked into parsing HTML (parse the popup.html into the CRA app).

    - I was able to separate out the Chrome extension's CSS into its own file.

    - I removed all superfluous HTML comments from HTML within `<body>` (which happened to be all of them.)

  - I found:
    [ npm install react-html-parser ]
    ! NOT !
    haha. J/k!
    While I was waiting on that package to even begin installing, I read further on their GitHub page; The package had 3 issues, the 1st of which mentioned... bundle size, and provided a most helpful link to: ...

  - [Another HTML Parser](https://github.com/remarkablemark/html-react-parser)

    [ `sudo npm install html-react-parser --save` ]

@11:40 PM

  - Success!!

  - I got the Expired To Be popup.html (and its CSS) showing up in the React App. Woot!!!

@1:10 AM

  - Found next hurdle.

  - Listeners on JavaScript = `addEventListener`;
    but React is more into `onChange`, `onSubmit`, and `onClick`.

@1:40 AM

  - Figured out solution.
    Convert `addEventListener`s to be their element-event-driven counterparts (HTML onEvent attributes).


  - Dev Tools was complaining about value being changed without an onchange.

  - Found it was the date input field.

  So; Going to use my Native Date React component for my form's date field.


  - Copied over my component: [React Form Input Date Native](https://github.com/KDCinfo/react-form-input-date-native)

  [ `sudo npm install --save react-bootstrap` ]
  [ ```sudo chown -R `whoami` .``` ]

@2:40 AM

-> expired-to-be$ `npm start`

```
module.js:472
    throw err;
    ^
Error: Cannot find module 'inherits'
    at Function.Module._resolveFilename (module.js:470:15)
    at Function.Module._load (module.js:418:25)
    at Module.require (module.js:498:17)
    at require (internal/module.js:20:19)
    at Object.<anonymous> (/usr/local/lib/node_modules/npm/node_modules/readable-stream/lib/_stream_readable.js:68:17)
    at Module._compile (module.js:571:32)
    at Object.Module._extensions..js (module.js:580:10)
    at Module.load (module.js:488:32)
    at tryModuleLoad (module.js:447:12)
    at Function.Module._load (module.js:439:3)
```

> 2018-03-02 - Friday

@11:20 AM

  - Back at fixing Node / NPM

    - Tried a few things...

  - Uninstalling / Reinstalling Node
    [https://askubuntu.com/questions/786015/how-to-remove-nodejs-from-ubuntu-16-04](https://askubuntu.com/a/786019)

    [ `sudo apt-get purge nodejs` ]
    [ `sudo apt-get autoremove` ]
    [ `sudo apt-get autoclean` ]

    [ `curl -L https://www.npmjs.org/install.sh | sh` ]

  - Fix permissions
      [ ```sudo chown -R `whoami` /usr/local/bin``` ]
      [ ```sudo chown -R `whoami` /usr/local/lib/node_modules/``` ]
      [ ```sudo chown -R `whoami` ~/.config``` ]

    [ `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash` ]

    [ `nvm install node` ]
    [ `nvm use node` ]

#### Summary of my successfull commands (from above)

  [ `cd ./expired-to-be` ]
  [ `sudo npx create-react-app .` ]
  [ `sudo npm install html-react-parser --save` ]
  [ `sudo npm install --save react-bootstrap` ]

  [ `sudo apt-get purge nodejs` ]
  [ `sudo apt-get autoremove` ]
  [ `sudo apt-get autoclean` ]
  [ ```sudo chown -R `whoami` /usr/local/bin``` ]
  [ ```sudo chown -R `whoami` /usr/local/lib/node_modules/``` ]
  [ ```sudo chown -R `whoami` ~/.config``` ]

  [ `curl -L https://www.npmjs.org/install.sh | sh` ]
  [ `curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash` ]
  [ `nvm install node` ]
  [ `nvm use node` ]

@12:15 PM

  - Looking like it's gonna start...

  - Waiting...

  - Brought up Firefox...

  - Waiting...

  - Waiting...

  - Error: 'React' must be in scope when using JSX.

  - That means... Success! We have success!!
    We have a "coding error", and not a system error. Woot!!

@3:00 - @4:30 PM

  - Created `setInterval` to run for 60 seconds waiting for `popup.html` to get appended to DOM before `popup.js` is loaded programmatically.

  - Working on figuring out event handlers on imported popup.html.

@6:05 PM

  - Updated this history file (from previous release on Mon/Tue).

Back to working on event handling (which I had started on 2018-02-28 - Wednesday @10:15 AM).

@7:00 PM
- Submitted clarification question on GitHub:
  https://github.com/remarkablemark/html-react-parser/issues/48

@2:30 AM

  - Tried doing some more coding, but got too tired.
    I did get popup.js to trigger on a React onClick.

> 2018-03-03 - Saturday

@8:40 PM

  - Another dilemma with React.

  - Writing out all these "exceptions", for this form, is becoming the "rule".

  - This is as bad as copying over the code.

  - What was the reason for running React and parsing the entire form again?

  - To use the React `<Alarms>` interface.

  - Need to consider doing that without parsing the entire form.

And in comes:

  - [/Web/API/DOMParser](https://developer.mozilla.org/en-US/docs/Web/API/)DOMParser

@11:00 PM

  - Alarms was done with "Done (for now)" which was done with TypeScript.

  - Began renaming .tsx to .js ... not worth it (then would need to strip all the code).

  - Copied pertinent TS config lines from "Done (for now)" package.json.

  - sudo npm install --> sudo: npm not found

  - npm start (no react-scripts-ts)

  - npm install (eacces error)

  - sudo apt-get update

  - sudo apt-get install npm

@12:40 AM

  - Had issues with bootstrap Types.

  - Rolled back to: "@types/react-bootstrap": "^0.0.52",

  - Had to revert `componentDidMount` from arrow to function declaration.

  - Now on to TS linting issues.

@1:05 AM

  - The TimerBox is now showing alongside the extension's form.

  - Progress.

> 2018-03-04 - Sunday

@8:05 PM

  - I did spend a few hours looking into the marriage of X2B and my TimerBox component.
    Not really sure where I'm at with it...

  - In the TimerBox, you have ...
@8:20 PM
    Taking this to draw.io ...
@2:20 AM

  - [popup.js] Got alarms and notifications schematic laid out in draw.io.

  - [TimerBox] Need to do the same with the TimerBox interface.
  Need to see where I can line these two up.

> 2018-03-05 - Monday

@12:15 PM

  - Created new draw.io .xml for TimerBox interface.

  - Cleaned out new .xml; began transposing (but drifting into doing it in an empty code file first).

  - Trying like hell to persist on this alarms interface.
  Have it running... trying to trigger a method within the React app.

@2:40 AM

  - Barely keeping eyes open, but gonna call it a night.

  - Cannot figure out how to update React's state externally.

> 2018-03-06 - Tuesday

@6:05 PM
- When it is all said and done, 4 or 5 dozen searches later...

```
  ReactDOM.render(
    <App myId={localMyId} />,
    document.getElementById('root') as HTMLElement
  );
```

  BUT:

  - ~~Don't do a setState inside lifeCycle methods when doing this !!!~~

  - ^^^ Follow-up correction on that... Added a check in `shouldComponentUpdate` to prevent that call stack race to max.

@10:25 PM

  - Finally got something working!

  - Of all the advice, the only sure-fire one that appears to work, (and is supported with articles) is to reload the `ReactDOM.render()` with updated props.

  - Typically React handles prop updating, but the prop we're sending to the root component is not maintained by React, so we need to tell it somehow, and re-rendering the component (from what I've read) is the dandy way to do it.

  - Began setting up how prop object (array of objects) and design will work.
    Created a prototype object in [popup.js], but within '!isExtension' logic.

  - `window.ourExpirations = new ExpiredToBe();`

@12:15 AM

  - Made some good progress on creating a consumable object,
    and it's signalling change in the child TimerBox component
    (incoming prop from App passed as prop to TimerBox.)

> 2018-03-07 - Wednesday

@9:30 PM

  - Looks like it's able to create (at least one) timer.

@12:30 AM

  - After a couple dozen attempts, finally got the timers to set.

  - Working with:
		[ index.tsx, TimerBox.tsx, popup.js ]
    ```
		(window as any).reRender = () => {
			ReactDOM.render(
			      <App ourExpirationItems={(window as any).ourExpirations.currentItems()} />,
			      document.getElementById('root') as HTMLElement
			    );
		componentWillReceiveProps(nextProps: any) {
		shouldComponentUpdate(nextProps: any, nextState: any) {
		componentDidUpdate(prevProps: any, prevState: any) {
		handleAppUpdate() {
    ```

  - Added to state: `currentTimerId: 0,`

  - Added to [ popup.js ]:
    ```
	        const newItem = {
	                whichEvent: 'add',
	                expiredId: timeId,
	                entryTitle: alarmId,
	                entryHours: numberHours,
	                entryMinutes: 0,
	                entryCycle: 0 // daily [hour:1 | min:2]
	              };
	        ourExpirations.addItem(newItem);
	        window.reRender();
	        ourExpirations.removeItem(newItem.expiredId);
    ```

  - Have lots of fragmented code to analyze and clean up.

  - Still not showing on the 'last' addition, but it shows every previous entry, which is further than I've gotten.

@2:25 AM

  - Migrated over to VS Code
		(TypeScriptReact syntax error highlighting was a bit nerve-wracking.)

  - Made backup of TimerBox.tsx and trimmed down comments in active version.

  - Trying to isolate why the first timer setting doesn't show the timers.

> 2018-03-08 - Thursday

@4:25 PM

  - X2B is still driving me loony.

  - I "think" it's finally totally fixed in the right way.

  - I "think".

  - I thought it was fixed 5-6 times before.

Tests:
	[ Normal | Private ] browser tabs:
		[ Empty load | Page already loaded ]
			[ Dev Tools open | Dev Tools closed ]

	Private
    -> Page Open
    -> Dev Tools [ open | closed ]
    -> Open X2B in another tab as extension
    -> Open Dev Tools
    -> Switch to extension
    -> Close Dev Tools (from behind; will also close extenion's popup)
    -> Switch back to page that was open.
    -> Refresh

@9:45 PM

  - Seems to be working as expected.

  - Watched half hour video on JavaScript event loops; call stack, web api calls, and the event queue.

  - So my diagnosis of using `setTimeout( () => {}, 0 )` was correct;
		although I was quite skeptical of using it.

@1:15 AM

  - Finished draw.io outline diagram of overall files, components, and interaction / relationships.

  - Completed half the interactive relationships between files and components.
    ```
      ourExpirations.processItem(newItem);
      window.reRender();
      ourExpirations.removeItem(newItem.expiredId);
    ```

  - I've got it down to where I just need to create and wire up the actual alarms.

> 2018-03-09 - Friday

@9:40 PM

  - I organized and noted details for 4 draw.io diagrams I've done thus far for this project.
		Goes to show it's a lot more complicated than my normal projects.
		3-4 weeks IMHO is more than fine for this project.

  - It adds a timer. So it works.
    Just gotta plug in the other 2 dozen things it needs to do that aren't documented anywhere but that I'll need to 'discover' as I continue putting it together; in addition to the handful of sprinkled @TODO:'s between the code, journal, history, keep notes, rightnote, and wherever else I may have jotted my scattered thoughts down.

  - Let's do it...!

@3:00 AM

  - The `Remove` timer works as well as adding a timer
		(it chokes on modal; which isn't integrated yet).

> 2018-03-10 - Saturday

@6:45 PM

  - It now can create timers, and remove timers.
		So little progress, so much left to do...

@3:40 AM

  - I've been painfully, slowfully, methodically, getting things to work.

  - Add, remove, update all work.

  - Issue with the 'update'... the new time is off.
	  Found major coding discrepancy between 'create' and 'update' when getting the new `setTimeout` delay times.

  - Also discovered the 'create' is the correct one.
  ```
		getTimeDiff		    22.8 days (correct)
		getTimeDiffUpdate	26.8 days (4 days off)
  ```

> 2018-03-11 - Sunday

@7:20 PM

  - Played with Done (for now) a little.
	  The `getTimeDiffUpdate` method is only used when a timer has expired, and, in the modal, the user clicks the "Done (for now)" button. It will reset the timer to its stored setting, whose cycle is either by min, hour, or daily. In none of those cases do the "hours" go over 24.

  - So it's broken, but the Done (for now) feature scope doesn't touch where its broken.

  - Still need to determine why I thought I needed a completely separate function, instead of piggybacking on the 'create's `getTimeDiff` method.

> In working in my "Done (for now)" code, I can already see how far I've come.

@8:40 PM

  - My next dilemma:
		Done (for now) is really a repeating timer, at heart.
		Expired To Be is in need of a long-term counter (repeating is unnecessary).
	I need to get the Alarms API interface (the fork of Done (for now)), working to accept more than just a start time of 24:00. If you start your browser fresh tomorrow, it'll see the timer's start time as 24, instead of 00.
	But when is the setTimeout set?

> 2018-03-12 - Monday

@5:15 PM
		Q: But when is the setTimeout set?
		A: initializeState()

@3:25 AM

  - Current problem is when page loads...
		...or was it on delete?
      (...it was likely on both.)

  - My React Alarms API needs a way to extract which alarms are in storage.
		Either by ID, or All of them. When running `showList`, need a way to know which are set. And showList is run on page load.

> 2018-03-13 - Tuesday

@4:40 PM

  - Refactored and added `getAlarms()` and `getAlarm()`.

@6:20 PM

  - The page initialization appears to be working good.

  - If an alarm doesn't exist, and should.

  - If an alarm exists, and should.

  - Did multiples of multiples with importing, toggling, and deleting in various orders.
    So far, so solid.

@11:20 PM

  - Got toggle working; both on (create) and off (remove).

@11:40 PM

  - Fixed deleteTimer -- I absentmindedly added React Alarms API code directly
		instead of just pointing to the removeTimer() function (which has that logic).

@2:30 AM

  - History file update (to now).

> 2018-03-14 - Wednesday

@12:15 PM

  - Been writing up the Readme.

@8:20 PM

  - Began implementing clearing all alarms (to go with clearing all items).
		Hit an issue with removal function not working right.

  - Figured out the issue (have to remove from the `ourExpirations` object also).

  - Added new Alarm API methods for clearing alarms.

  - Back to figuring out approach for deleting all.
		Can send each through the removal process, but not a good approach.
		Need to do all at once; clearTimeout, then remove from everywhere.
			ourExpirations.alarms []
			ourState
			ourTimeouts

  - Fixed
		Missed clearing out timerList [] along with timeoutList [] and timeoutDisplayList []

@11:45 PM

  - Figured out time disparity:
    - Per below, why #1 and #3 are one hour off from #2 and #4:
    ```
[
  {"id": 1, "title": "My 1st reminder.", "date": "2033-03-10", "leadTime": "days", "leadTimeVal": "1"},
  {"id": 2, "title": "My 2nd reminder.", "date": "2033-03-16", "leadTime": "weeks", "leadTimeVal": "1"},
  {"id": 3, "title": "My 1st reminder.", "date": "2033-03-10", "leadTime": "days", "leadTimeVal": "1"},
  {"id": 4, "title": "My 2nd reminder.", "date": "2033-03-16", "leadTime": "weeks", "leadTimeVal": "1"}
]
    ```
    - March 13, 2033 is the end of daylight savings.

@1:20 AM

  - Fixed it so you can toggle open the Alarms API interface.

> 2018-03-15 - Thursday

@7:50 PM

  - Researching implementation of Notifications API
	  __Perhaps others have had some pitfalls or gotchas I can learn from.__

Per [/microsoft-edge/dev-guide/windows-integration/web-notifications-api](https://docs.microsoft.com/en-us/microsoft-edge/dev-guide/windows-integration/web-notifications-api): It is strongly recommended that an icon be specified for each notification. This not only improves a notification from a UI point of view, but also helps alert users of where the notification is being sent from.

@4:00 AM

  - Got modal working better.

  - Setup "alert" option.

  - Started the 'notifications' option, but got tied up with the 'no refresh' after a notification.

  - 'No refresh' issue:
		When dismissing an alarm, the star doesn't go away, even though the alarm is gone.
		But could be because I've been overriding it, so it keeps getting overridden.
		Can't find where to change that '1 day' and 00:00 override.

  - Currently stuck on setting a timer 1 minute ahead
		(any overrides stay overridden even after a page refresh. Duh!)

> 2018-03-16 - Friday

@7:45 PM

  - Solved all my issues with testing notifications and modal callbacks.

  - 3 areas of fix. Wrote out all the gritty details in the [history.md] Expired To Be project file.

@11:15 PM

  - Trying to get "App Preferences" in a decent location on the screen,
	but it's HTML. First tried just doing an appendChild.
	Then using the `new DOMParser()`; a couple different ways.

@12:30 AM

  - Got the "App Preferences" button placed and clickable.

#### Root cause(s) for 2 days of confusion:

I've been manually setting the setTimeout delay value by setting:

  //   `preThen = new Date(dateValueArr[0], dateValueArr[1] - 1, dateValueArr[2] - 1, 18, 58, 0),`

  // on line # 1050, Edit the item, Save it, and let it expire. The list should update. Next refresh that alarm should show as expired.

  // Issue #1: in [index.html] getAlarms (which is actually setAlarms) I was doing a concat, but with the full list.
  //   I needed to just replace the list.

  // **Issue #2:** When testing this per the above `preThen` setting, the `between` is calc'd on the date fields.
  //   So the check above doesn't check for if the timeout is negative, because during normal operations,
  //   the `between` will always be in sync with the timeout delay's sign (pos/neg). However, will also
  //   add the check for the delay's sign as well.

  // Also added the `setAlarms` callback to everywhere `timerList` was being updated in [TimerBox] (e.g., Add).

> 2018-03-17 - Saturday

@1:35 AM

  - Got the App Prefs panel to come up.

  - Got the Preferences objects, state, storage, and API endpoints setup.
		localStorage: expiresPrefs

  - Got the `<select>` tags for hours and minutes.

  - Got the 'hours' `<select>` to properly update the state and storage.

  - Currently stuck on: Legacy data after storage structure modification.
		Storage no longer stores with 'key': 'expiresList'.
		It stores the arrays and objects directly. The storage name is the only key.
		1. Need to either forcibly update legacy stored data, or
		2. Set the ourState.forEach to properly handle the legacy 'expiresList' key.
			And hope that's all there is.

@3:40 AM

  - Fixed the localStorage and state issue.

  - Reverted back to using 'expiresList' as the key and value, because that's how `chrome.storage.sync` does it.

		Brought up a copy of [popup.js] from GitHub and compared for "expiresList".
		Fixed 2-6 locations (some were irrelevant).
		Both Extension and Web App both work; even the preferences.

> 2018-03-18 - Sunday

@3:10 PM

  - Issues with setting a 2nd preferences (minutes). When I update one, the other goes back to 0.
		Fixed how `window.ourExpirations.setPref` was updating (same issue as with Hours before).
		Now they both won't set. All `console.logs` show all the data is correct.
		Also no-go with a 5-second setTimeout (just to factor out potential race condition).

@3:15 PM

  - Found it. Am still setting hours and minutes using {key, val} instead of just sending the whole thing.

  - Disparity between sending the entire thing, and just one piece.
		`Object.assign` should take care of this.
		Refactoring so it does...

@4:00 PM

  - Fixed (thrice again).

  - Cannot return a static call to internal vars; went back to
```
		currentItems: () => this.items,
		alarmItems: () => this.alarms,
		getPrefs: () => this.prefs,
```
	Then just had to update:
```
		ReactDOM.render(
		      <App
		        ourExpirationItems={(window as any).ourExpirations.currentItems()}
```
@2:00 AM

  - Did some testing on the notifications (just the 'none' and 'alerts').
	@TODO: Don't hide with 'none'. Still need an expiration; or default to 00:00
	@TODO: After an alert, the Timers do not refresh showing the removed Timeout.

@2:15 AM

  - Backed up VirtualBox VM.
    I back up the changed files inside the VM nightly, but the VM itself... not often enough.

> 2018-03-19 - Monday

  - Sick day.

> 2018-03-20 - Tuesday

  - Sick day (mostly).

  - Also in a lull (partial mental wellness day off).

  - Began outline of Notifications functional flow in .md file.

> 2018-03-21 - Wednesday

@3:00 PM

  - Making some progress.

  - Think I've got the process flow mostly figured out.

  - Created various `notifyError` message-related methods.

  - Working code into `<select>` change and page load.

@8:30 PM

  - Got a coding draft going for the 3 "notification" action locations (endpoints?).

  - Stuck on testing locally. Chrome doesn't allow notifications on `http://`

@8:55 PM

  - Found a solution to localhost `https:`

	`BROWSER=none HTTPS=true npm start`

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

> 2018-03-22 - Thursday

  - A week of lulls? This project feels like an enigma at times.

> 2018-03-23 - Friday

@12:20 AM

  - Tried figuring out where I was on Expired...

  - Don't know.

	  - It Threw an Error when I first refreshed.

	  - Timer doesn't clear after notification.

	  - Anything post-notification doesn't work (was expecting a console.log).

  - Need lots of testing and lots of tweaks.

> 2018-03-24 - Saturday

@9:30 PM

  - Worked couple hours on X2B.
		I'm calling notifications "done".

  - On to passive notifications.
		Already looking into browser compatibility for dynamically changing favicon and <title>.
		Firefox and IE appear to be the biggest problems.

@2:15 AM

  - I "think" I've got it mostly working. Doubt it, but further testing will tell.
		Doing all this "time" stuff is vexing.

	One major issue I found is **don't create a new Date based on another new Date's `getParts()`**.
		Minutes were almost always 5 minutes ahead.

@3:05 AM

  - Issue: Creating a new timer with one that's expired will reset the expired timer.
		A: When I reset the preference Hour/Min, it reevaluates the previous alarms.
		Works as expected / designed.

  - Updated Title.

  - @TODO: Need 'expired' icon
		    `link.href = '/icon16.png';`

> 2018-03-25 - Sunday

@3:15 PM

  - Created 'expired' favicon.

  - Finished passive notification (tab title and icon change).

  - Fixed issue with alarms not clearing (being overridden) when being updated.
		Was an issue on extension also, but would never / rarely see it.

@10:00 PM

  - Ran some additional pseudo-random testing.

  - Closing all my opened browser research tabs; updating Readme.md with helpful URLs.

  - Adding in new "About This App" button in upper-right of layout (for web app only).

@12:05 AM

  - Completed dynamically adding the 'About App' toggle menu in upper-right of layout.

@1:35 AM

  - New issue (couple, actually).
		An item with alarm showed as expired due to bad logic.
		BadgeText was set on a non-expired item due to bad logic.
```
	[popup.js] # 484 Promise.all().then().forEach()
	        // @TODO: The below `if()` logic is poor.
		        // If alarm is set and active, doesn't check if it's still valid.
		        // badgeText should only increase if alarm is invalid, and item is active.
```
> 2018-03-26 - Monday

@11:40 AM

  - Finished fixing logic issues with setting expired alarms and badgeText.

  - Completed refactoring of alarm-related display logic in showList().
		Specifically, I moved all the logic from the `ourState` loop to the `Promises.all()` loop.

  - Tested both web app and Chrome extension. Everything "appears" to be working good. Need a rest.

@11:15 PM

  - Made local copy of all files for quick reference.

  - Began stripping files (comments, @TODO:'s, superfluous info).

  - Was going to do multiple imports to see how the page works vertically, but...

  - AT IT AGAIN !!! ... Next issue ...
		Some alarms, when set, expire immediately, which cause an infinite and immediate/unbreakable setTimeout loop.
		Stuck with the `alert()` box opening over and over.
		Focusing on the Dev Tools bypasses the `alert()` "pause" and it just goes and goes and runs and runs.

  - Found to fix the loop, I commented out the `createTimer()` in the [popup.js] page load.

```
        } else if (canBeActive && !isGoodAlarm) {
          console.log('2');
          trClassListItem.classList.remove('expired');
          spanClassListItem.classList.add('hidden');
          // createTimer(alarm.id, newThen, between).then( (newAlarm) => {
          //   printAlarm(alarm.id);
          //   // console.log('A new alarm has been created...', alarm.id, newAlarm);
          // });
```

  - BUT, the alarm still triggers immediately.
		I checked the `thisTimeDiff` being set on the `setTimeout` and it's (way) good.
		If I set the `setTimeout` manually it works fine.
		Very confused on these setTimeouts.

@11:45 PM

	https://stackoverflow.com/questions/16314750/settimeout-fires-immediately-if-the-delay-more-than-2147483648-milliseconds
	Per that page: The upper limit of setTimeout is 0x7FFFFFFF (or 2147483647 in decimal)
	setTimeout has a 32-bit limit of:
		2147483647 ms = 596.52323528 h = 24.8333 days
	How does Chrome's alarm do it?
	Done (for now) limits setTimeouts to daily repeats (1 day = 24 hours < 32-bit)

@11:50 PM

  - Two ways I can think of to handle this:

	1. Before setting setTimeout, if value is greater than 24 days, set the timer for 24 days.

	2. When a timer is up, have it double-check the `newThen` and `between` values;
		If still positive, create a new setTimeout.

@1:00 AM

  - Added in 24-day max limit to both `setTimeout()` calls in [TimerBox.tsx].

  - Added back the `createTimer` / `printAlarm` calls in [popup.js] #575

  - Began adding in post-timeout check
	  --> Will run a new setTimeout if there's still time left.

@3:40 AM

  - Completed running an expiring item through `createTimeout` if not complete.
		Borrowed enough logic code to make the decision between re-creating a timeout and triggering a notification.
	Tested with 15-second increments
		(it recreated itself ~7 times, and when it was done, it triggered the notification).

In other news...

@TODONE: Fixed expiration items in layout to be correct values from alarm loop. [2018-03-26]

@TODONE: Added [ID] to expiration items list for web app only (!isExtension) that correlates to the alarms in the active Alarm panel.
    But only showing the [ID] if Alarm panel is open.

> 2018-03-27 - Tuesday

@6:05 AM

  - Spent all day (and night) cleaning files (mostly in [popup.js] and [timerbox.tsx]).
		Majorly time-consuming.

  - Major refactor of wording across Readme, History, and code headers.
		Majorly time-consuming.

  - Created new Readme for `<TimerBox>` usage.

  - Updated History from 03-17 to today.

> 2018-03-28 - Wednesday

... Same day; different heading.

@7:05 AM

  - In [TimerBox.tsx]
	        // console.log('addToTimeoutQueue: ', thisTimeoutWaitMax, timerEntry);
	        // This console.log helped debug the last error:
	            // Modal not immediately removing timeout,
	            and 'existing expired timeouts' aren't coded for on page init.
	        // Solution: Expire the son of a bitch!

@7:30 AM

  - Next issue ... running `resetTimer()` immediately on Modal trigger, like the others.
	The only Modal button available triggers the `resetTimer()` callback.
	See the problem...?
	Solution: Have it run a different callback and just close the modal.

@8:30 AM

  - Fixed up the modal pretty.

  - Fixed issue: Added bind in constructor for new callback method.
		I had thought about this when I created the method, and was 95% sure I'd end up back there adding it in, but wanted to see if it really did fail for lack of a bind. Has something to do with being called out of scope, so `this` stays relevant. Duh!!! :P

@8:40 AM

  - Fixed item list header titles not wrapping on (the wider) Web App (just made them all wrap, all the time, <br/>'cause they should).

  - Tested more on Chrome extension.

@9:50 AM

  - Finally got all `console.log()`'s removed (a couple were buried in some subcomponents).

@10:05 AM

  - Found edge-case bug.
		Set empty form to "Days" (lead time); Click either 'New' or 'Reset'.
		"Days" changes back to "Weeks", but the number field now goes to 70 instead of 10.

  - Learned from FED Slack that my website portfolio is "a bit old design".
  Good insight... first feedback I've gotten on it... ever.
  Created it in 2015 in an effort to learn Zurb Foundation 5.

@12:40 PM

  - Made some additional tweaks to the UI (e.g., <th> headings in alarm panel).

@6:35 AM

  - Looked through all draw.io diagrams.

  - Finished updating Readme.

> 2018-03-29 - Thursday

@7:55 AM

  - Did first local prod build (npm run build).

  - Got Testing working. Due to my non-React (plain JS) factory function supplying the data store and communication callbacks with React, it took an hour or so to figure it out... (npm test).

@11:20 AM

  - Had some more testing issues to figure out when switching between testing, build, and start.
		When I ran one, and fixed it, the other broke.

    - Primary solution:

		Added 'src/__tests__' to tsconfig.json exclude.
		Added // tslint:disable and others to no avail, but left in.

  - Got them all working now.

@12:15 PM

  - Got a successful build out through Travis CI  to GitHub Pages.

  - First issue
```
Uncaught TypeError: Cannot read property 'split' of undefined
    at t.createTimeout (TimerBox.tsx:386)
    at t.addRemoveTimeout (TimerBox.tsx:309)
    at TimerBox.tsx:101
```
@8:00 PM

	- Looking into production-level localStorage conflict(s) with Done (for now).

	Ran Done (for now) in another terminal, but error didn't throw.

		- Hindsight: It's a different domain (:3001).

		- Copying over the `timerList` from either
			Using :3001 or the new Production storage data throws the error, as expected.

@10:05 PM

	- Still designing how Timers vs Alarms will layout and coexist.

@11:05 PM

	- Think that's all done with. Alarms listing layout is done.

	- Will need to update `Done (for now)` when all is said and done.

@11:35 PM

  - Committed to GitHub for Travis build and more testing.

@2:00 AM

  - Fixed conflict with Done (for now) storage.

  - Fixed 'deleteAllTimeouts()' by creating a 'removeAllTimers()' which does not remove 'Done (for now)' timers.

  - Removed defunct 'deleteAllTimeouts()'.

@2:45 AM

  - Testing: Opera works good.

	- Fixed: Item update not refreshing "days left".

@3:10 AM
		Chrome mobile not sending notifications...

	- 1 SO says Chrome / Android = No Notifications, but it's oooold.
		https://stackoverflow.com/questions/21361968/notification-api-in-android-chrome-browser

	- Other results all included using `serviceWorkers`.

> 2018-03-30 - Friday

@6:40 PM

  - Fixed MS Edge issue showing 'prefs updated' on first page load.

  - Removed deprecated MS CSS style.

@9:55 PM

  - Fixed FireFox (Win10) layout issue: Right side of form was a bit off the page.

  - Fixed FireFox (Ubuntu) layout issue: Right side of form was worse.

  - Trying a fix for the 'toggle alarms panel' button height issue on iPad.

  - Fixed MS Edge not showing import progress bar: Doesn't support `classList.replace()`

@12:40 AM

  - Final commit covering a range of bugs, tweaks, and slight enhancements.

> 2018-03-31 - Saturday

@7:00 PM

  - Fixed issue with Chrome extension `badgeIconText` miscount when deleting alarms.

    * Moved `badgeTextCount` initialization into `Promise.all()` block.

    * Removed call to `showList()` from within the `deleteTimer` function.

      Just like the `createTimer` function (right above it), `deleteTimer` should not run `showList()` because they both can be called numerous times from within `showList()` itself.

@2:50 AM

  - Updated Chrome web store with `.zip` of X2B 2.0 files.

  - Integrated X2B SPA `alarms` with Done (for now) SPA `timers`.

  - Got Done (for now) upgraded to React 16.2. Got tests working again. Got Travis CI build working.

  Although references to Done (for now) updates belong in the Done (for now) Readme, it became an extension of this project as well.

> 2018-04-24 - Tuesday

  - Been working on fixing X2b; Hitting SPA with an expiration throws errors.
  `runPassiveNotification` is not defined (initially saw this on my live site (production)).

@4:20 AM

  - Got 3 things fixed; 2 commited (will commit the 3rd tomorrow night).

  1. Put GA tracking on X2b SPA
  2. Issue with loading page having an active expired item.
    - Took most of the day to find the root cause.
    - Issue was when expired item + updating prefs = pref msg overwritten with expired msg
  3. Fixed reset form issue with allowing >10 weeks.

> 2018-04-25 - Wednesday

Committed changes from yesterday.

  - Also updated Chrome extension.

> 2018-04-26 - Thursday

https://stackoverflow.com/questions/50053991/github-potential-security-vulnerability-error-for-hoek-node-module

@7:45 AM

  - Got X2B and Redux418 both fixed.
  - kdcinfo/f6 -- Still working on last 3 hoek 2.16.3 versions (node-sass, request, hawk).

> 2018-05-08 - Tuesday

@11:30 PM

  - Tried implementing W3 ARIA Data Grids with Sorting.
    * Way too much boilerplate!

  - Found X2B data source (`ourState`).
    * Using that to inject a 'last sorted by' preference.
    * Default is 1a (Title; Ascending)

@6:05 AM

  - Got sorting working.
  - Got up/down arrows (for sorting) laid out.

> 2018-05-09 - Wednesday

@6:50 AM

  - Completed X2B sorting.
  - Got formatting completed (included swapping pagination arrow/title sides).

@7:15 AM

  - Fixed messaging not reflecting expired items in Chrome extension.

> 2018-05-10 - Thursday

Began watching videos for better Jest testing.

  - `npm i --save-dev enzyme enzyme-adapter-react-16`

@10:40 PM

  - New issue... `npm` says there are 80 vulnerabilities (low level).

  * Something to do with...

```
    Removing:   "hoek": "^5.0.3",
    Added and removed:  "deep-extend": "^0.5.1",
```

Upgraded React TypeScript to 3.0.0 -- `react-scripts-ts@3.0.0`

  - Resolved all of the `randomatic` errors.
  - Cut `deep-extend` from 11 to 9 errors.

  - Opened a GitHub issue with `create-react-app-typescript` regarding the remaining 9 vulnerabilities: [npm audit security report - package: deep-extend](https://github.com/wmonk/create-react-app-typescript/issues/319)

@2:15 AM

  - Began getting back into Jest testing.

  * Reinstalled `enzyme`.

  - Realized the React testing would only test the <TimerBox />. (D'oh!) It will NOT be testing the user interface, which is a JavaScript application.
  - Looking up: testing javascript applications

@3:45 AM

Downgraded back to React `2.15.1` and TypeScript `2.8.3`. `3.0.0` was a blocker.

  - Opened another GitHub issue: [Error: Cannot find module 'react-dev-utils/workspaceUtils'](https://github.com/wmonk/create-react-app-typescript/issues/320)

## Code Notes: `Timer`

[TimerAlertPrompt.tsx]

  > {isTimer ? (<ButtonSnooze />) : null}
  > {isTimer ? (<DivTitle />) : null}
  > {isTimer ? (<ButtonDoneForNow />) : null}
  > {isTimer ? null : (<ButtonCloseModal />)}
  > {isTimer ? (<DivSubtitle />) : null}
  > {isTimer ? (<ButtonDisable />) : null}
