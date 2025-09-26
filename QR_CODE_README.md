# QR Code Implementation

## Overview

The QR code functionality allows vendors to generate and share QR codes that customers can scan to directly access their store's menu and place orders.

## Features Implemented

### 1. Automatic QR Code Generation

- **Store Creation**: QR codes are automatically generated when stores are created
- **URL Generation**: QR codes contain the store's unique menu URL (`/menu/[storename]`)
- **Database Storage**: QR codes are stored as base64 data URLs in the database

### 2. QR Code Management API

- **GET /api/store/qr-code?email=EMAIL** - Retrieve existing QR code
- **POST /api/store/qr-code** - Generate/regenerate QR code
- **Automatic Regeneration**: QR codes are regenerated when store names change

### 3. Dashboard Integration

- **Real QR Display**: Shows actual QR code image instead of placeholder
- **Download Functionality**: Download QR code as PNG file
- **View Menu Button**: Opens store menu in new tab
- **Regenerate Option**: Manually regenerate QR code if needed
- **Store URL Display**: Shows the full store URL for reference

### 4. QR Code Features

- **High Quality**: 300x300px resolution with proper margins
- **Standard Colors**: Black on white for maximum compatibility
- **Error Correction**: Built-in error correction for damaged codes
- **Mobile Optimized**: Works with all QR code scanner apps

## Technical Implementation

### QR Code Generation

```typescript
// lib/qr-generator.ts
export async function generateStoreQRCode(
  storeName: string,
  baseURL?: string
): Promise<string>;
```

### Database Integration

- QR codes stored in `stores.qrCode` field as base64 data URLs
- Automatic generation during store creation
- Regeneration when store names change

### Dashboard UI

- Loading states during QR generation
- Error handling for failed generation
- Responsive design for mobile/desktop
- Download functionality using HTML5 download attribute

## Store Creation Flow with QR Codes

1. **Onboarding Process**

   - Store created → QR code generated automatically
   - QR code stored in database
   - Ready for immediate use

2. **Vendor Creation API**

   - New store → Generate QR code
   - Store name change → Regenerate QR code
   - Existing store → Keep existing QR code

3. **Dashboard Display**
   - Load QR code on dashboard load
   - Display actual QR image
   - Enable download and view functions

## Usage Workflow

### For Vendors:

1. Complete onboarding (QR code generated automatically)
2. Go to dashboard → QR Code section
3. Download QR code image
4. Print and display QR code at store location
5. Share QR code digitally with customers

### For Customers:

1. Scan QR code with phone camera or QR scanner app
2. Automatically redirected to store menu page
3. Browse menu items and add to cart
4. Place order with UPI payment

## QR Code URL Structure

```
https://domain.com/menu/Store%20Name
```

## Error Handling

- **Missing Store**: Graceful error handling
- **Generation Failure**: Retry mechanism
- **Network Issues**: Loading states and error messages
- **Invalid URLs**: Validation and sanitization

## Security Considerations

- **URL Encoding**: Store names properly encoded in URLs
- **Input Validation**: All inputs validated before QR generation
- **Base64 Storage**: Secure storage of QR code data
- **Access Control**: Only store owners can regenerate QR codes

## Future Enhancements

- **Custom QR Styling**: Brand colors and logos
- **Analytics**: Track QR code scans
- **Batch Generation**: Generate multiple QR codes
- **Print Templates**: Pre-formatted printable versions
- **Dynamic QR Codes**: Update without reprinting

## Testing the Implementation

1. **Create a Store**: Complete vendor onboarding
2. **Check Dashboard**: QR code should appear automatically
3. **Download QR**: Test download functionality
4. **Scan QR**: Use phone to scan and verify redirection
5. **Place Order**: Complete the customer journey

## Dependencies

- `qrcode`: QR code generation library
- `@types/qrcode`: TypeScript definitions
- Next.js Image optimization (optional)
- Prisma for database storage
