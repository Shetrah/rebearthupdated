-- Seed the existing homepage copy into site_content so it can be maintained
-- from Admin > Website content. ON CONFLICT preserves any existing edits.
insert into public.site_content (key, label, value) values
('home_hero_title', 'Homepage hero title', 'WELCOME TO REBEARTH'),
('home_hero_accent', 'Homepage hero accent', 'SOLUTIONS'),
('home_hero_subtitle', 'Homepage hero description', 'Rebearth Solutions Limited drives sustainability in agriculture, blending innovation with eco-conscious solutions to secure a productive and resilient future.'),
('home_why_title', 'Homepage: Why choose us heading', 'Why Choose Rebearth Solutions Limited?'),
('home_why_description', 'Homepage: Why choose us description', 'Rebearth Solutions Limited stands out as a leader in promoting sustainable agricultural practices and environmental stewardship. With a strong foundation rooted in innovation and excellence, we offer expert guidance and tailored solutions in agriculture and carbon credit projects. Our mission is to empower farmers and businesses to adopt eco-friendly practices that enhance productivity while protecting the environment, ensuring a healthier planet for future generations. By choosing Rebearth Solutions, you partner with a dedicated team committed to driving positive change and fostering sustainability in agriculture.'),
('home_features', 'Homepage feature cards (JSON)', '[{"title":"Sustainable Solutions","description":"Eco-friendly agricultural practices that protect our environment."},{"title":"Precision Agriculture","description":"Advanced technology and data-driven approaches."},{"title":"Quality Assurance","description":"Premium products backed by rigorous testing."},{"title":"Expert Support","description":"Dedicated team of agricultural specialists."}]'),
('home_products_title', 'Homepage featured products heading', 'Featured Products'),
('home_products_description', 'Homepage featured products description', 'Discover our most popular agricultural solutions designed to help you achieve better yields and sustainable farming practices.'),
('home_services_title', 'Homepage services heading', 'Our Services'),
('home_services_description', 'Homepage services description', 'Comprehensive agricultural services designed to support your farming operations from planning to harvest.'),
('home_services', 'Homepage service cards (JSON)', '[{"title":"Agricultural Consulting","description":"Expert advice on crop management, soil health, and sustainable farming practices."},{"title":"Green House Management","description":"Provide reliable greenhouse maintenance services to help farmers achieve maximum yields."},{"title":"24/7 Support","description":"Round-the-clock technical support and emergency assistance."}]'),
('home_cta_title', 'Homepage call to action heading', 'Ready to Transform Your Farm?'),
('home_cta_description', 'Homepage call to action description', 'Get in touch with our agricultural experts and discover how our solutions can help you achieve your farming goals.')
on conflict (key) do nothing;
