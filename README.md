# Rebearth Solutions Website

A modern e-commerce website for agricultural solutions with M-Pesa payment integration.

## Features

- Product catalog with cart functionality
- M-Pesa STK Push payment integration
- Invoice generation and receipt download
- User authentication and profiles
- Order management system
- SMS notifications
- Responsive design

## M-Pesa Integration Setup

### 1. M-Pesa API Configuration

Replace the following placeholders in `src/lib/mpesa.ts`:

```typescript
const MPESA_CONFIG = {
  CONSUMER_KEY: 'YOUR_MPESA_CONSUMER_KEY', // Replace with your M-Pesa consumer key
  CONSUMER_SECRET: 'YOUR_MPESA_CONSUMER_SECRET', // Replace with your M-Pesa consumer secret
  BUSINESS_SHORT_CODE: '601426', // Your paybill number
  PASSKEY: 'YOUR_MPESA_PASSKEY', // Replace with your M-Pesa passkey
  CALLBACK_URL: 'https://your-domain.com/api/mpesa/callback', // Replace with your callback URL
  CONFIRMATION_URL: 'https://your-domain.com/api/mpesa/confirmation', // Replace with your confirmation URL
  VALIDATION_URL: 'https://your-domain.com/api/mpesa/validation', // Replace with your validation URL
  BASE_URL: 'https://sandbox.safaricom.co.ke', // Use https://api.safaricom.co.ke for production
};
```

### 2. Supabase Configuration

Replace the following in `src/lib/supabase.ts`:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your Supabase project URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your Supabase anon key
```

### 3. SMS API Configuration

Replace the following in `src/lib/sms.ts`:

```typescript
const SMS_CONFIG = {
  API_KEY: 'YOUR_SMS_API_KEY', // Replace with your SMS API key (e.g., Africa's Talking)
  SENDER_ID: 'REBEARTH',
  BASE_URL: 'https://api.africastalking.com/version1/messaging',
};
```

## Database Setup

1. Create a Supabase project
2. Run the migration files in the `supabase/migrations/` folder:
   - `create_invoices_table.sql`
   - `create_payments_table.sql`

## Edge Functions Setup

Deploy the following edge functions to Supabase:
- `supabase/functions/mpesa-callback/` - Handles M-Pesa payment callbacks
- `supabase/functions/mpesa-validation/` - Validates M-Pesa transactions
- `supabase/functions/mpesa-confirmation/` - Confirms M-Pesa transactions

## Environment Variables

Set up the following environment variables in your deployment:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Payment Flow

1. User adds items to cart
2. User proceeds to checkout and fills delivery information
3. System generates invoice and stores in database
4. User initiates M-Pesa payment
5. STK push is sent to user's phone
6. User enters M-Pesa PIN
7. Payment callback updates database
8. Receipt is generated and SMS confirmation sent
9. Order is marked as paid

## API Endpoints

### M-Pesa Callbacks

- `POST /functions/v1/mpesa-callback` - Handles STK push callbacks
- `POST /functions/v1/mpesa-validation` - Validates C2B transactions
- `POST /functions/v1/mpesa-confirmation` - Confirms C2B transactions

## Development

```bash
npm install
npm run dev
```

## Production Deployment

1. Update all API keys and URLs to production values
2. Change M-Pesa BASE_URL to production endpoint
3. Deploy to your hosting platform
4. Set up proper SSL certificates for callback URLs

## Security Notes

- Never expose API keys in client-side code
- Use environment variables for sensitive data
- Implement proper validation in callback endpoints
- Use HTTPS for all callback URLs
- Implement rate limiting for API endpoints