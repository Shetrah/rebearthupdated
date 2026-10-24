import React, { useEffect, useState } from 'react';
import { Award, Globe, Heart, History, Leaf, Target, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

const defaults: Record<string, string> = {
  about_title: 'About Rebearth Solutions',
  about_intro: 'Pioneering the future of agriculture through innovation, sustainability, and unwavering commitment to farmers worldwide.',
  about_mission_title: 'Our Mission',
  about_mission: 'Our mission is to provide an accessible and sustainable approach to health by promoting the consumption of natural foods. We believe that everyone deserves the right to quality agricultural products, making healthy eating a fundamental right rather than a luxury. By fostering partnerships within the agricultural community, we aim to create a system that prioritizes affordability and nutrition, ensuring that all individuals can benefit from the power of wholesome food for their well-being.',
  about_mission_followup: "Through innovation, research, and collaboration, we're building a more sustainable and productive agricultural future that benefits both farmers and the environment.",
  about_mission_image: 'https://images.pexels.com/photos/32585381/pexels-photo-32585381.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
  about_features_title: 'What Sets Us Apart',
  about_feature_1_title: 'Sustainable Solutions', about_feature_1_text: 'Eco-friendly agricultural practices that protect our environment while maximizing productivity.',
  about_feature_2_title: 'Precision Agriculture', about_feature_2_text: 'Advanced technology and data-driven approaches to optimize crop yields and resource usage.',
  about_feature_3_title: 'Quality Assurance', about_feature_3_text: 'Premium products and services backed by rigorous testing and continuous improvement.',
  about_feature_4_title: 'Expert Support', about_feature_4_text: 'Dedicated team of agricultural specialists providing ongoing guidance and technical support.',
  about_values_title: 'Our Core Values',
  about_values_intro: 'These fundamental principles guide our decisions and shape our approach to serving the agricultural community.',
  about_value_1_title: 'Passion for Agriculture', about_value_1_text: 'We are deeply committed to advancing agricultural practices and supporting smallholder farmers all over the region.',
  about_value_2_title: 'Environmental Stewardship', about_value_2_text: 'Protecting our planet through sustainable farming solutions and eco-friendly practices.',
  about_value_3_title: 'Innovation Legacy', about_value_3_text: 'Building on decades of agricultural expertise to create cutting-edge solutions for tomorrow.',
  about_story_title: 'Our Story',
  about_story: 'At Rebearth Solutions, we are motivated by a profound conviction in the inherent order of nature and the limitless potential of humanity to coexist harmoniously with it. We are geared in restoring balance not only in the soil but also within our lives, fostering a holistic approach that ultimately contributes to a more balanced and sustainable world. We envision a future where individuals, communities, and ecosystems thrive together, guided by principles of respect, stewardship, and interconnectedness. Through our efforts, we aim to inspire a collective movement towards environmental harmony and personal well-being.',
  about_story_image: 'https://images.pexels.com/photos/32585404/pexels-photo-32585404.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
  about_team_title: 'Our Expert Team',
  about_team_intro: 'Meet the dedicated professionals who make Rebearth Solutions a leader in agricultural innovation and customer service.',
  about_team_1_title: 'Agricultural Scientists', about_team_1_count: '3+', about_team_1_text: 'PhD-level researchers developing cutting-edge solutions',
  about_team_2_title: 'Field Specialists', about_team_2_count: '10+', about_team_2_text: 'On-ground experts providing direct farmer support',
  about_team_3_title: 'Technical Engineers', about_team_3_count: '2+', about_team_3_text: 'Innovation specialists creating next-gen equipment',
  about_team_4_title: 'Customer Success', about_team_4_count: '13+', about_team_4_text: 'Dedicated support team ensuring client satisfaction',
};

const About: React.FC = () => {
  const [copy, setCopy] = useState(defaults);
  useEffect(() => {
    let alive = true;
    supabase.from('site_content').select('key,value').like('key', 'about_%').then(({ data }) => {
      if (!alive || !data) return;
      setCopy(current => ({ ...current, ...Object.fromEntries(data.map(row => [row.key, row.value])) }));
    });
    return () => { alive = false; };
  }, []);
  const text = (key: string) => copy[key] ?? defaults[key] ?? '';

  const features = [Leaf, Target, Award, Users].map((Icon, index) => ({ Icon, title: text(`about_feature_${index + 1}_title`), description: text(`about_feature_${index + 1}_text`) }));
  const values = [Heart, Globe, History].map((Icon, index) => ({ Icon, title: text(`about_value_${index + 1}_title`), description: text(`about_value_${index + 1}_text`) }));
  const team = [1, 2, 3, 4].map(index => ({ role: text(`about_team_${index}_title`), count: text(`about_team_${index}_count`), description: text(`about_team_${index}_text`) }));

  return <div className="min-h-screen bg-pattern">
    <section className="bg-gradient-to-r from-green-600 to-navy-800 py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="mb-6 text-4xl font-bold sm:text-5xl">{text('about_title')}</h1>
        <p className="mx-auto max-w-3xl text-xl leading-relaxed text-green-100">{text('about_intro')}</p>
      </div>
    </section>

    <section className="bg-white py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
          <h2 className="mb-6 text-3xl font-bold text-gray-900">{text('about_mission_title')}</h2>
          <p className="mb-6 text-lg leading-relaxed text-gray-600">{text('about_mission')}</p>
          <p className="text-lg leading-relaxed text-gray-600">{text('about_mission_followup')}</p>
        </div>
        <img src={text('about_mission_image')} alt="Modern farming" className="h-96 w-full rounded-2xl object-cover shadow-lg" />
      </div>
    </section>

    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 sm:text-4xl">{text('about_features_title')}</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ Icon, title, description }) => <article key={title} className="rounded-xl bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
            <Icon className="mb-4 h-8 w-8 text-green-600" />
            <h3 className="mb-3 text-xl font-semibold text-gray-900">{title}</h3>
            <p className="leading-relaxed text-gray-600">{description}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">{text('about_values_title')}</h2>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">{text('about_values_intro')}</p>
        </div>
        <div className="grid gap-12 md:grid-cols-3">
          {values.map(({ Icon, title, description }) => <article key={title} className="text-center">
            <Icon className="mx-auto mb-6 h-12 w-12 text-green-600" />
            <h3 className="mb-4 text-2xl font-semibold text-gray-900">{title}</h3>
            <p className="text-lg leading-relaxed text-gray-600">{description}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section className="bg-gray-50 py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <img src={text('about_story_image')} alt="Agricultural research" className="h-96 w-full rounded-2xl object-cover shadow-lg" />
        <div>
          <h2 className="mb-6 text-3xl font-bold text-gray-900">{text('about_story_title')}</h2>
          <p className="text-lg leading-relaxed text-gray-600">{text('about_story')}</p>
        </div>
      </div>
    </section>

    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">{text('about_team_title')}</h2>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">{text('about_team_intro')}</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {team.map(person => <article key={person.role} className="rounded-xl bg-gray-50 p-6 text-center transition hover:shadow-lg">
            <p className="mb-2 text-3xl font-bold text-green-600">{person.count}</p>
            <h3 className="mb-3 text-xl font-semibold text-gray-900">{person.role}</h3>
            <p className="leading-relaxed text-gray-600">{person.description}</p>
          </article>)}
        </div>
      </div>
    </section>
  </div>;
};

export default About;
