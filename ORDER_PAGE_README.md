# Order Page Implementation

## Overview

The order page allows customers to browse menu items from a specific store, add items to cart, and place orders with UPI payment integration.

## Features Implemented

### 1. Dynamic Store-Based Ordering

- **URL Structure**: `/menu/[storename]`
- **Example**: `baseurl/menu/My%20Store%20Name`
- Dynamic routing based on store name

### 2. Menu Display

- **Categories**: Items organized by menu categories
- **Item Details**: Name, description, price, veg/non-veg indicator
- **Availability**: Only shows available items
- **Responsive Design**: Works on mobile and desktop

### 3. Shopping Cart

- **Add/Remove Items**: Quantity controls with + and - buttons
- **Real-time Updates**: Cart updates immediately
- **Total Calculation**: Shows item count and total amount
- **Persistent State**: Cart state maintained during session

### 4. Customer Information

- **Optional Fields**: Phone number and name
- **UPI Integration**: Phone number used for better UPI experience

### 5. UPI Payment Integration

- **Mobile Redirect**: Automatically opens UPI app on mobile devices
- **Desktop Fallback**: Shows UPI ID for manual payment
- **Order Tracking**: Generates unique order numbers
- **Payment URL**: `upi://pay?pa=VENDOR_UPI&pn=STORE_NAME&am=AMOUNT&cu=INR&tn=ORDER_NUMBER`

## API Endpoints Created

### Store Management

- `GET /api/store/get-by-name?name=STORE_NAME` - Get store by name
- `GET /api/stores/list` - List all active stores

### Menu Management

- `GET /api/menu/get-by-store?storeId=STORE_ID` - Get menu by store ID

### Order Management

- `POST /api/orders/create` - Create new order

## Database Integration

- **Orders**: Stored with status tracking (PENDING_PAYMENT, PAYMENT_COMPLETED, etc.)
- **Customers**: Optional customer data collection
- **Order Items**: Detailed line items with quantities and prices

## User Flow

1. **Store Discovery**: Visit `/stores` to browse available stores
2. **Menu Access**: Click on a store to go to `/menu/[storename]`
3. **Item Selection**: Browse categories and add items to cart
4. **Customer Info**: Optionally provide phone/name
5. **Payment**: Click "Pay with UPI" to initiate payment
6. **UPI Redirect**: Redirected to UPI app (mobile) or shown UPI ID (desktop)

## Technical Implementation

### Frontend

- **React**: Next.js 14 with App Router
- **State Management**: React useState for cart and form data
- **UI Components**: Shadcn/ui components with Tailwind CSS
- **Icons**: Lucide React icons
- **Responsive**: Mobile-first design

### Backend

- **Database**: PostgreSQL with Prisma ORM
- **API**: Next.js API routes
- **Validation**: Server-side validation for orders
- **Error Handling**: Comprehensive error handling

### Payment Flow

- **Order Creation**: Server creates order with PENDING_PAYMENT status
- **UPI Generation**: Dynamic UPI payment URL generation
- **Mobile Detection**: User agent detection for mobile UPI redirect
- **Order Tracking**: Unique order numbers for tracking

## Testing the Implementation

1. **Create a Store**: Use the vendor onboarding flow
2. **Add Menu Items**: Use the menu builder
3. **Visit Store Page**: Go to `/stores` and click on your store
4. **Place Order**: Add items to cart and test payment flow

## Security Considerations

- **Input Validation**: All inputs validated on server
- **SQL Injection**: Prisma ORM prevents SQL injection
- **Error Handling**: Sensitive data not exposed in error messages
- **Rate Limiting**: Consider adding for production

## Future Enhancements

- **Order Status Updates**: Real-time order tracking
- **Payment Confirmation**: Webhook integration for payment status
- **Customer Dashboard**: Order history for customers
- **Store Analytics**: Order analytics for vendors
- **Push Notifications**: Order status updates
