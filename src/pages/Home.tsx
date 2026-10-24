import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Target, Award, Users, ShoppingCart, Wrench, Phone } from 'lucide-react';
import Carousel from '../components/Carousel';
import CustomerReviews from '../components/CustomerReviews';
import { useCart } from '../context/CartContext';
import OrderModal from '../components/OrderModal';
import { Product } from '../types';
import { mergeManagedProducts, useManagedProducts } from '../lib/catalog';
import { supabase } from '../lib/supabase';

const Home: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const { addToCart } = useCart();
  const managedProducts = useManagedProducts();
  const defaultSiteCopy = {
    hero_title: 'WELCOME TO REBEARTH', hero_accent: 'SOLUTIONS', hero_subtitle: 'Rebearth Solutions Limited drives sustainability in agriculture, blending innovation with eco-conscious solutions to secure a productive and resilient future.',
    why_title: 'Why Choose Rebearth Solutions Limited?', why_description: 'Rebearth Solutions Limited stands out as a leader in promoting sustainable agricultural practices and environmental stewardship. With a strong foundation rooted in innovation and excellence, we offer expert guidance and tailored solutions in agriculture and carbon credit projects. Our mission is to empower farmers and businesses to adopt eco-friendly practices that enhance productivity while protecting the environment, ensuring a healthier planet for future generations. By choosing Rebearth Solutions, you partner with a dedicated team committed to driving positive change and fostering sustainability in agriculture.',
    features: [
      { title: 'Sustainable Solutions', description: 'Eco-friendly agricultural practices that protect our environment.' },
      { title: 'Precision Agriculture', description: 'Advanced technology and data-driven approaches.' },
      { title: 'Quality Assurance', description: 'Premium products backed by rigorous testing.' },
      { title: 'Expert Support', description: 'Dedicated team of agricultural specialists.' },
    ],
    products_title: 'Featured Products', products_description: 'Discover our most popular agricultural solutions designed to help you achieve better yields and sustainable farming practices.',
    services_title: 'Our Services', services_description: 'Comprehensive agricultural services designed to support your farming operations from planning to harvest.',
    services: [
      { title: 'Agricultural Consulting', description: 'Expert advice on crop management, soil health, and sustainable farming practices.' },
      { title: 'Green House Management', description: 'Provide reliable greenhouse maintenance services to help farmers achieve maximum yields.' },
      { title: '24/7 Support', description: 'Round-the-clock technical support and emergency assistance.' },
    ],
    cta_title: 'Ready to Transform Your Farm?', cta_description: 'Get in touch with our agricultural experts and discover how our solutions can help you achieve your farming goals.',
  };
  const [siteCopy, setSiteCopy] = useState(defaultSiteCopy);
  useEffect(() => {
    let alive = true;
    supabase.from('site_content').select('key,value').like('key', 'home_%').then(({ data }) => {
      if (!alive || !data) return;
      const rows = Object.fromEntries(data.map((row: any) => [row.key.replace(/^home_/, ''), row.value]));
      setSiteCopy(old => {
        const next: any = { ...old };
        for (const [key, value] of Object.entries(rows)) {
          if (key === 'features' || key === 'services') {
            try { const parsed = JSON.parse(value as string); if (Array.isArray(parsed)) next[key] = parsed; } catch { /* retain the built-in content */ }
          } else next[key] = value;
        }
        return next;
      });
    });
    return () => { alive = false; };
  }, []);

  const handleOrderProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsOrderModalOpen(true);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  const closeOrderModal = () => {
    setSelectedProduct(null);
    setIsOrderModalOpen(false);
  };

  const originalFeaturedProducts: Product[] = [
    {
      id: 1,
      name: 'Rebearth Pro',
      description: 'Advanced bio-stimulation technology for enhanced plant development.',
      price: 1500,
      image: 'https://images.pexels.com/photos/32584556/pexels-photo-32584556.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
      category: 'Fertilizers'
    },
    {
      id: 2,
      name: 'Rebearth 5.0',
      description: 'Ionic charge harmonization for optimal plant productivity.',
      price: 200,
      image: 'https://images.pexels.com/photos/32584683/pexels-photo-32584683.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Organic Biostimulants'
    },
    {
      id: 3,
      name: 'Monkey Repellant',
      description: '100% organic solution for protecting crops from primates.',
      price: 1900,
      image: 'https://images.pexels.com/photos/32585149/pexels-photo-32585149.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Repellants'
    }
  ];
  const featuredProducts = mergeManagedProducts(originalFeaturedProducts, managedProducts).slice(0, 3);

  const features = [
    {
      icon: <Leaf className="h-8 w-8" />,
      title: siteCopy.features[0]?.title ?? '',
      description: siteCopy.features[0]?.description ?? ''
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: siteCopy.features[1]?.title ?? '',
      description: siteCopy.features[1]?.description ?? ''
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: siteCopy.features[2]?.title ?? '',
      description: siteCopy.features[2]?.description ?? ''
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: siteCopy.features[3]?.title ?? '',
      description: siteCopy.features[3]?.description ?? ''
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <Carousel />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 z-10" />
        
        {/* Content */}
        <div className="relative z-20 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in-up">
            {siteCopy.hero_title}
            <span className="text-green-400 block animate-pulse"> {siteCopy.hero_accent}</span>
          </h1>
          <p className="text-lg sm:text-xl mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed animate-slide-in-left">
            {siteCopy.hero_subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-right">
            <Link 
              to="/products"
              className="btn-primary inline-flex items-center justify-center space-x-2 shadow-2xl"
            >
              <span>Explore Products</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              to="/contact"
              className="btn-secondary inline-flex items-center justify-center shadow-2xl"
            >
              Get In Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
              {siteCopy.why_title}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {siteCopy.why_description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 card-hover group"
              >
                <div className="text-green-600 mb-4 icon-hover">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-hover">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
              {siteCopy.products_title}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {siteCopy.products_description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 card-hover"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 text-hover">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-green-600">
                      KES {product.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-navy-800 hover:from-green-500 hover:to-navy-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => handleOrderProduct(product)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Quick Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/products"
              className="btn-primary inline-flex items-center space-x-2 shadow-lg"
            >
              <span>View All Products</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <CustomerReviews />

      {/* Services Preview Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-navy-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
              {siteCopy.services_title}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {siteCopy.services_description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 card-hover group">
              <div className="text-green-600 mb-6 icon-hover">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-hover">
                {siteCopy.services[0]?.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {siteCopy.services[0]?.description}
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 card-hover group">
              <div className="text-green-600 mb-6 icon-hover">
                <Wrench className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-hover">
                {siteCopy.services[1]?.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {siteCopy.services[1]?.description}
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-105 card-hover group">
              <div className="text-green-600 mb-6 icon-hover">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-hover">
                {siteCopy.services[2]?.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {siteCopy.services[2]?.description}
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/services"
              className="btn-primary inline-flex items-center space-x-2 shadow-lg"
            >
              <span>View All Services</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 animate-fade-in-up">
            {siteCopy.cta_title}
          </h2>
          <p className="text-lg text-white opacity-90 mb-8 max-w-2xl mx-auto">
            {siteCopy.cta_description}
          </p>
          <Link
            to="/contact"
            className="bg-white text-green-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2 shadow-2xl"
          >
            <span>Contact Us Today</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Order Modal */}
      {isOrderModalOpen && selectedProduct && (
        <OrderModal
          product={selectedProduct}
          onClose={closeOrderModal}
        />
      )}
    </>
  );
};

export default Home;
