# Rebearth Solutions — admin, POS and Supabase setup

The existing public pages and copy have been retained. The update adds Supabase-backed customer authentication and password reset, an admin workspace, order management, a POS checkout flow, product/image management, editable homepage hero content, and a branded PDF invoice letterhead.

## 1. Configure Supabase

1. In your Supabase project, open **SQL Editor** and run `supabase/migrations/202610240001_ecommerce_admin.sql`, then `supabase/migrations/202610240002_homepage_content.sql` and `supabase/migrations/202610240003_seed_products.sql`. The product seed adds the 31 existing catalogue entries to `products`, skips names already in the table, and sets initial stock to zero for manual review.
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

Online M-Pesa payments are marked paid only by the trusted callback, which now reconciles the linked invoice and order. Deploy the updated callback with `SUPABASE_SERVICE_ROLE_KEY` configured. The POS records the selected payment method/status and emails an invoice or receipt, but automated POS M-Pesa STK prompting still requires a server-side Daraja integration configured with production credentials; never expose those credentials in browser code. Card and bank payment processing also require their own configured provider.

## 6. Database/security note

Apply the SQL migration before testing admin features. RLS intentionally restricts order, product, content, and storage management to admin users, and restricts customer order/payment reads to the signed-in owner. Review these policies against your final payment callback implementation before going live.
