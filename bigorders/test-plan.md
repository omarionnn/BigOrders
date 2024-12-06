# Restaurant Order System Test Plan

## Test Environment Setup
- Frontend URL: http://localhost:3002
- Backend URL: http://localhost:5001
- Browser: Chrome (latest version)
- Browser Developer Tools should be open to Console tab

## 1. Menu Loading Tests
### Test Case 1.1: Menu Item Display
1. Navigate to restaurant menu page
2. Open browser console
3. Verify console logs show:
   - "Loading menu items for restaurant: [id]"
   - "Menu items loaded: [data]"
   - "Processed menu items: [data]"
4. Expected: Each menu item should have:
   - name (string)
   - price (number)
   - description (string)
   - category (string)

### Test Case 1.2: Menu Item Validation
1. Check browser console for any errors
2. Verify all prices are valid numbers
3. Verify no items are missing required fields

## 2. Cart Operation Tests
### Test Case 2.1: Adding Items to Cart
1. Select a menu item
2. Set quantity (test with 1, 2, and 10)
3. Add special instructions (optional)
4. Click "Add to Cart"
5. Expected console logs:
   - "CartContext: Adding to cart: [item details]"
   - Should show correct price type and quantity type

### Test Case 2.2: Cart Item Validation
1. Open cart
2. For each item verify:
   - Item name is present
   - Price is a valid number
   - Quantity is a valid number
   - Subtotal is correctly calculated (price * quantity)
3. Check console for any validation errors

## 3. Checkout Process Tests
### Test Case 3.1: Pre-Checkout Validation
1. Open cart
2. Click checkout button
3. Verify these conditions are checked:
   - User is logged in
   - Active order exists
   - Cart has items
4. Expected: Appropriate error message if any condition fails

### Test Case 3.2: Item Submission
1. Proceed with checkout
2. Monitor console logs for:
   - "Current order: [order details]"
   - "Raw cart items: [items]"
   - "Processing cart item: [details]"
   - "Converted values: [price/quantity]"
   - "Formatted item: [final format]"
   - "Final formatted items: [all items]"

### Test Case 3.3: Error Handling
1. If checkout fails, verify:
   - Error message is displayed to user
   - Console shows detailed error information
   - Cart state remains unchanged

## How to Report Issues

When reporting issues, include the following information:

1. Test Case ID (e.g., "Test Case 2.1")
2. Steps to Reproduce:
   - Numbered list of actions taken
   - Include specific values used (quantities, prices, etc.)
   - Note any special conditions

3. Expected Behavior:
   - What should have happened

4. Actual Behavior:
   - What actually happened
   - Include exact error messages
   - Include relevant console logs

5. Console Output:
   - Copy relevant console logs
   - Include any error stack traces

6. Screenshots:
   - Browser view showing the issue
   - Console errors if applicable
   - Network tab for API calls if relevant

Example Issue Report:
```
Test Case: 2.1 - Adding Items to Cart

Steps to Reproduce:
1. Selected "Burger" menu item
2. Set quantity to 2
3. Added special instruction "No onions"
4. Clicked "Add to Cart"

Expected Behavior:
- Item should be added to cart
- Console should show successful addition
- Cart count should update to 2

Actual Behavior:
- Console showed NaN error for price
- Item was not added to cart
- No error message shown to user

Console Output:
[Copy/paste relevant console logs]

Screenshots:
[Attach relevant screenshots]

Additional Notes:
- Error only occurs with items priced above $20
- Browser: Chrome Version 96.0.4664.110
```
