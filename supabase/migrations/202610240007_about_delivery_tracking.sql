-- Delivery tracking fields and editable About page copy.
alter table public.orders add column if not exists tracking_number text;
alter table public.orders add column if not exists delivery_note text;

-- Retire the legacy public write/read policies; guest order lookup is mediated by the edge function.
drop policy if exists "Allow public access to invoices" on public.invoices;
drop policy if exists "Allow public access to payments" on public.payments;

insert into public.site_content (key, label, value) values
('about_title', 'About / Page title', 'About Rebearth Solutions'),
('about_intro', 'About / Introductory text', 'Pioneering the future of agriculture through innovation, sustainability, and unwavering commitment to farmers worldwide.'),
('about_mission_title', 'About / Mission heading', 'Our Mission'),
('about_mission', 'About / Mission text', 'Our mission is to provide an accessible and sustainable approach to health by promoting the consumption of natural foods. We believe that everyone deserves the right to quality agricultural products, making healthy eating a fundamental right rather than a luxury. By fostering partnerships within the agricultural community, we aim to create a system that prioritizes affordability and nutrition, ensuring that all individuals can benefit from the power of wholesome food for their well-being.'),
('about_mission_followup', 'About / Mission supporting text', 'Through innovation, research, and collaboration, we are building a more sustainable and productive agricultural future that benefits both farmers and the environment.'),
('about_mission_image', 'About / Mission image URL', 'https://images.pexels.com/photos/32585381/pexels-photo-32585381.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load'),
('about_features_title', 'About / What sets us apart heading', 'What Sets Us Apart'),
('about_feature_1_title', 'About / Feature 1 heading', 'Sustainable Solutions'),
('about_feature_1_text', 'About / Feature 1 description', 'Eco-friendly agricultural practices that protect our environment while maximizing productivity.'),
('about_feature_2_title', 'About / Feature 2 heading', 'Precision Agriculture'),
('about_feature_2_text', 'About / Feature 2 description', 'Advanced technology and data-driven approaches to optimize crop yields and resource usage.'),
('about_feature_3_title', 'About / Feature 3 heading', 'Quality Assurance'),
('about_feature_3_text', 'About / Feature 3 description', 'Premium products and services backed by rigorous testing and continuous improvement.'),
('about_feature_4_title', 'About / Feature 4 heading', 'Expert Support'),
('about_feature_4_text', 'About / Feature 4 description', 'Dedicated team of agricultural specialists providing ongoing guidance and technical support.'),
('about_values_title', 'About / Values heading', 'Our Core Values'),
('about_values_intro', 'About / Values introduction', 'These fundamental principles guide our decisions and shape our approach to serving the agricultural community.'),
('about_value_1_title', 'About / Value 1 heading', 'Passion for Agriculture'),
('about_value_1_text', 'About / Value 1 description', 'We are deeply committed to advancing agricultural practices and supporting smallholder farmers all over the region.'),
('about_value_2_title', 'About / Value 2 heading', 'Environmental Stewardship'),
('about_value_2_text', 'About / Value 2 description', 'Protecting our planet through sustainable farming solutions and eco-friendly practices.'),
('about_value_3_title', 'About / Value 3 heading', 'Innovation Legacy'),
('about_value_3_text', 'About / Value 3 description', 'Building on decades of agricultural expertise to create cutting-edge solutions for tomorrow.'),
('about_story_title', 'About / Story heading', 'Our Story'),
('about_story', 'About / Story text', 'At Rebearth Solutions, we are motivated by a profound conviction in the inherent order of nature and the limitless potential of humanity to coexist harmoniously with it. We are geared in restoring balance not only in the soil but also within our lives, fostering a holistic approach that contributes to a more balanced and sustainable world. We envision a future where individuals, communities, and ecosystems thrive together, guided by respect, stewardship, and interconnectedness. Through our efforts, we aim to inspire a collective movement towards environmental harmony and personal well-being.'),
('about_story_image', 'About / Story image URL', 'https://images.pexels.com/photos/32585404/pexels-photo-32585404.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load'),
('about_team_title', 'About / Team heading', 'Our Expert Team'),
('about_team_intro', 'About / Team introduction', 'Meet the dedicated professionals who make Rebearth Solutions a leader in agricultural innovation and customer service.'),
('about_team_1_title', 'About / Team role 1', 'Agricultural Scientists'),
('about_team_1_count', 'About / Team count 1', '3+'),
('about_team_1_text', 'About / Team description 1', 'PhD-level researchers developing cutting-edge solutions'),
('about_team_2_title', 'About / Team role 2', 'Field Specialists'),
('about_team_2_count', 'About / Team count 2', '10+'),
('about_team_2_text', 'About / Team description 2', 'On-ground experts providing direct farmer support'),
('about_team_3_title', 'About / Team role 3', 'Technical Engineers'),
('about_team_3_count', 'About / Team count 3', '2+'),
('about_team_3_text', 'About / Team description 3', 'Innovation specialists creating next-generation equipment'),
('about_team_4_title', 'About / Team role 4', 'Customer Success'),
('about_team_4_count', 'About / Team count 4', '13+'),
('about_team_4_text', 'About / Team description 4', 'Dedicated support team ensuring client satisfaction')
on conflict (key) do nothing;
