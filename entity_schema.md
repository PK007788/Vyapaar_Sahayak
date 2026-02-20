1. CUSTOMER_NAME
Type: String
Examples: Rahul, Pooja, Verma Traders, Lakshmi General Store
Appears In: Create_Invoice, Add_Credit, Record_Payment, Check_Balance, Send_Reminder

2. AMOUNT
Type: Integer / Float
Examples: 500, 1200, 3 hazar (→ 3000), 2.5 lakh
Appears In: Create_Invoice, Add_Credit, Record_Payment, Check_Balance, Send_Reminder

3. DATE_REFERENCE
Type: Relative or Absolute Date Expression (String → Normalized Date/Range)
Examples: Aaj, Kal, Pichle hafte, Is mahine, Last month, Abhi tak
Appears In: Create_Invoice, Add_Credit, Record_Payment, View_Sales_Summary, Check_Balance

4. ITEM_NAME
Type: String
Examples: Maggi, Chawal, Oil bottle, Soap, Rice bag, Cold drink
Appears In: Update_Inventory, Create_Invoice (future item-level billing support)

5. QUANTITY
Type: Integer + Optional Unit
Examples: 5 packet, 10 kg, 3 bottle, 2 bag, 15 soap
Appears In: Update_Inventory, Create_Invoice (future expansion)

6. PAYMENT_STATUS
Type: Categorical (FULL / PARTIAL)
Examples:
Pura paisa de diya → FULL
Aadha paisa diya → PARTIAL
Thoda payment kiya → PARTIAL
Appears In: Record_Payment, Add_Credit

7. PAYMENT_MODE
Type: Categorical (CASH / UPI / TRANSFER / OTHER) Examples:
Cash diya
UPI se bheja
Bank transfer kiya
Online payment kiya
Appears In: Record_Payment, Add_Credit (mixed payment cases)