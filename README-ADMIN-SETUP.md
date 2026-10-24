# Rebearth Solutions — admin, POS and Supabase setup

The existing public pages and copy have been retained. The update adds Supabase-backed customer authentication and password reset, an admin workspace, order management, a POS checkout flow, product/image management, editable homepage hero content, and a branded PDF invoice letterhead.

## 1. Configure Supabase

1. In your Supabase project, open **SQL Editor** and run migrations `202610240001_ecommerce_admin.sql` through `202610240006_payhero_payments.sql` in numeric order. These include homepage content, the current product catalogue, order/invoice linking, guest checkout insert rules, and guest payment tokens.
2. In **Authentication → URL Configuration**, set your production website URL and add these redirect URLs:
   - `http://localhost:3000/reset-password`
   - `https://YOUR-DOMAIN/reset-password`
   - your deployed site URL (and `www` version if used)
3. In the project root, copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your project's URL and public anon/publishable key. Never place a Supabase service-role key in browser code.
4. In **Authentication → Email Templates**, check the reset-password email template and sender configuration. Reset links return to `/reset-password`, where the customer can set a new password.
5. Register your admin user through the website's normal sign-up form, then run this in SQL Editor, replacing the email:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL');
   ```

6. Sign out and sign back in, then open `/admin`.

## 2. What is connected

- Supabase Auth handles sign-up, sign-in, session persistence, and password reset emails.
- The `profiles` table stores customer details and admin/customer roles. RLS and a role-protection trigger prevent customers from granting themselves admin privileges.
- The `orders` table receives website checkout orders and POS sales; admins can review orders and update order status.
- The `products` table drives the public catalogue and featured product cards while preserving the original hardcoded catalogue as a fallback. The product seed imports the current 31 catalogue entries; review prices, descriptions, and stock in **Admin → Products**. Admins can add/edit products and upload images to the public `site-media` Storage bucket.
- `site_content` stores homepage headings, descriptions, feature/service cards, and carousel image URLs. Edit them from **Admin → Website content**. Feature/service card values and `hero_images` must remain valid JSON arrays; save each field to publish changes. The homepage reads its copy from Supabase and uses the original copy as a fallback if the database request fails.
- Invoices and receipts use the branded PDF layout. Checkout invoices and payment receipts, plus POS documents when a customer email is supplied, are sent as PDF attachments through the `send-document` Supabase Edge Function and Resend.

## 3. Run locally

```bash
npm install
npm run dev
```

The Vite app uses port `3000` by default. Do not commit `.env.local`.

## 4. Resend email setup

Set the Supabase function secrets `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (a sender on a domain verified in Resend), and `SUPABASE_SERVICE_ROLE_KEY`, then deploy `supabase/functions/send-document`. The function only emails a saved invoice to its saved customer email (or lets an admin email it). Configure Supabase **Authentication → SMTP Settings** with Resend SMTP credentials as well if Auth confirmation and password-reset emails must also use Resend; those messages are sent by Supabase Auth, not by the website's Resend function.

## 5. Important payment note

Online and POS M-Pesa payments use PayHero STK Push. Add `PAYHERO_BASIC_AUTH` (the PayHero Basic Auth token, kept secret), `PAYHERO_CHANNEL_ID=14421`, and a long random `PAYHERO_CALLBACK_SECRET` to Supabase Function Secrets. Deploy `payhero-stk`, `payment-status`, `send-document`, and `payhero-callback`; deploy `payhero-callback` with JWT verification disabled because PayHero calls it directly, while its callback URL still requires the random secret. Keep the Supabase service role key in Edge Function Secrets only. Payment status is confirmed by the callback before orders are marked paid. Card and bank payment processing still require their own providers.

The PayHero credentials shown in the screenshot have been shared in this chat. Rotate/revoke that API key in PayHero, then save the replacement only as the `PAYHERO_BASIC_AUTH` Supabase secret. The former Daraja values have been removed from the frontend source; rotate them too if they are still active, because older deployed bundles or Git history may contain them.

## 6. Database/security note

Apply the SQL migration before testing admin features. RLS intentionally restricts order, product, content, and storage management to admin users, and restricts customer order/payment reads to the signed-in owner. Review these policies against your final payment callback implementation before going live.

## 7. Tawk.to live chat

The site loads the configured Tawk.to widget from `VITE_TAWK_PROPERTY_ID` and `VITE_TAWK_WIDGET_ID` (the existing IDs remain as defaults). Find both IDs in the Tawk.to Dashboard under **Administration → Channels → Chat Widget → Direct Chat Link / Widget Code**. Add the IDs to the deployment environment variables and redeploy. In Tawk.to, make the property active, add the production website domain under widget settings, and ensure at least one agent is online or set the offline contact form. Test on the deployed HTTPS domain with browser extensions/ad blockers disabled; the widget script can be blocked client-side.
