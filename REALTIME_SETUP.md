# Supabase Realtime Setup for Orders

This document explains how to enable Supabase Realtime for instant order updates on the vendor orders page.

## Prerequisites

1. Supabase project with your database
2. Orders table already created (via Prisma migrations)

## Steps to Enable Realtime

### 1. Enable Realtime for Orders Table

In your Supabase dashboard:

1. Go to **Database** → **Tables**
2. Find the `orders` table
3. Click on the table name to open table details
4. Go to the **Settings** tab
5. Toggle **Enable Realtime** to ON

Alternatively, you can run this SQL command in the Supabase SQL Editor:

```sql
-- Enable realtime for the orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

### 2. Verify Realtime is Working

You can test the realtime functionality by:

1. Opening the vendor orders page
2. Look for the connection status indicator in the top-right corner
3. The status should show "Live Updates" with a green dot when connected
4. Create a test order from the customer side and see it appear instantly

### 3. Environment Variables

Make sure these environment variables are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## How It Works

The implementation:

1. **Subscribes to Changes**: Listens for INSERT and UPDATE events on the `orders` table
2. **Filters by Store**: Only receives updates for orders belonging to the vendor's store
3. **Updates UI Instantly**: When a new order is created or status is updated, the UI updates without page refresh
4. **Connection Status**: Shows real-time connection status to the vendor

## Features

- ✅ **New Orders**: Instantly appear in the "Incoming Order Requests" section
- ✅ **Status Updates**: Order status changes are reflected immediately
- ✅ **Connection Status**: Visual indicator shows if realtime is working
- ✅ **Automatic Reconnection**: Handles connection drops gracefully
- ✅ **Cleanup**: Properly unsubscribes when component unmounts

## Troubleshooting

If realtime is not working:

1. Check if Realtime is enabled for the `orders` table in Supabase dashboard
2. Verify environment variables are correct
3. Check browser console for any connection errors
4. Ensure your Supabase project has Realtime enabled (should be enabled by default)

## Security Note

The current implementation uses the public anon key. For production, consider implementing proper Row Level Security (RLS) policies to ensure vendors only see their own orders.
