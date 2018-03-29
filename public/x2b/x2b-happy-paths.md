# Expired To Be

## Happy Paths

1. New, empty page load.

   > No list. No 'List Options' button.

2. No changes; save.

   > Message: All fields are required in order to setup a proper expiration item.

3. Enter title; save.

   > Title cannot be greater than 25 characters.

   > 1 item added. New form.
   
   > Message: Your expiration item was successfully created. @TODO: Implement local alarms interface: Create Timer.

4. Save again.

   > Message: All fields are required in order to setup a proper expiration item.

5. Edit item; save.

   > 1 item added. New form.
   
   > Message: Your expiration item was successfully updated. @TODO: Implement local alarms interface: Create Timer.

6. Delete item.

   > Selected item removed. Same (empty) form.
   
   > Message: Clearing... Your expiration item was successfully removed.

7. Edit item; Delete item.

   > 1 item removed. Form ID zeroed out; form contents remain.
   
   > Message: No expirations; Storage is empty.

8. Save.

   > 1 item added. New form.
   
   > Message: Your expiration item was successfully created. @TODO: Implement local alarms interface: Create Timer.

9. Added 3 items. Removed middle item. Added new item.

   > New item ID should be 4 (2 is empty; 3 is highest in `ourState`).

10. Add expired item.

    > Item saved; Not active, no alarm.
   
    > Message: Your expiration item was successfully created. @TODO: Implement local alarms interface: Delete Timer.

11. Toggle an active item OFF.

    > Checkbox should uncheck.
   
    > Message: Your expiration item was successfully updated. @TODO: Implement local alarms interface: Remove.

12. Toggle an non-active item ON.

    > Checkbox should check.
   
    > Message: Your expiration item was successfully updated. @TODO: Implement local alarms interface: Create.

13. Toggle a non-active expired item ON.

    > Checkbox should stay unchecked.
   
    > Message: Cannot create and activate an expired alarm. Please set a lead time that is at least 1 day ahead.

14. Lead Time dropdowns

    > Neither 'weeks' nor 'days' will allow the Lead Time number field to go below 1.

    _ Changing 'weeks' to 'days'

    > Lead Time number field will max out at 70.

    _ Changing 'days' to 'weeks'

    > Lead Time number field will max out at 10, and reset to 10 if > 10.

15. Reset button

    > Reset button will reset current form's item to the item's original values (from `ourState`) (empty if new).

16. New button

    > New button will zero out the form and clear reset the form fields to empty/default values.

17. List Options: Clear All

    > All items in list should disappear. List Options button should disappear.
   
    > Message: No expirations; Storage is empty.

18. List Options: Export All

    > A file should be saved to browser's download location, or the browser may open the file in a new tab. The filename is: 'x2b-expires-list.json'.

    > Subsequent saves when a file with that filename exists may save as: 'x2b-expires-list (1).json'.
   
    > Message: Your 'X2B Expires List' file has either been saved, or opened for you to save.

19. List Options: Import

    > @TODO:
