# Rebearth Solutions — admin, POS and Supabase setup

The existing public pages and copy have been retained. The update adds Supabase-backed customer authentication and password reset, an admin workspace, order management, a POS checkout flow, product/image management, editable homepage hero content, and a branded PDF invoice letterhead.

## 1. Configure Supabase

1. In your Supabase project, open **SQL Editor** and run `supabase/migrations/202610240001_ecommerce_admin.sql`.
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
- The `products` table drives the public catalogue and featured product cards while preserving the original hardcoded catalogue as a fallback. Admins can add/edit products and upload images to the public `site-media` Storage bucket.
- `site_content` stores homepage hero title, accent, subtitle, and carousel image URLs. The original values are seeded by the migration; edit them from **Admin → Website content**. The `hero_images` value must remain a valid JSON array of image URLs.
- PDF invoices use the existing Rebearth logo and green brand letterhead.

## 3. Run locally

```bash
npm install
npm run dev
```

The Vite app uses port `3000` by default. Do not commit `.env.local`.

## 4. Important payment note

The POS records a sale and marks payment as pending; it does not pretend to confirm a card or M-Pesa payment. Existing M-Pesa STK initiation still depends on the configured payment gateway/backend and callback flow. Do not mark orders paid based only on a browser response; payment completion should be confirmed by a trusted server-side callback using a server-only credential.

## 5. Database/security note

Apply the SQL migration before testing admin features. RLS intentionally restricts order, product, content, and storage management to admin users, and restricts customer order/payment reads to the signed-in owner. Review these policies against your final payment callback implementation before going live.
