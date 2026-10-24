import React, { useState } from 'react';
import { mergeManagedProducts, useManagedProducts } from '../lib/catalog';
import { ShoppingCart, Leaf, Droplets, Filter, Scaling as Seedling, SprayCan as Spray } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import OrderModal from '../components/OrderModal';

const Products: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { addToCart } = useCart();
  const managedProducts = useManagedProducts();

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

  const originalProducts: Product[] = [
    {
      id: 1,
      name: 'Rebearth Pro',
      description: 'REBEARTH acts as a catalyst in the critical early stages of plant development, enhancing both abiotic and biotic stress resilience, improving photosynthetic efficiency, and fostering a healthy, symbiotic rhizosphere environment.',
      price: 1500,
      image: 'https://images.pexels.com/photos/32584556/pexels-photo-32584556.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
      category: 'Fertilizers'
    },
    {
      id: 2,
      name: 'Rebearth 5.0',
      description: 'Rebearth 5.0 is a bio-stimulation technology that mimics natural processes to help plants achieve optimum productivity. Using ionic charge harmonization, it stimulates soil microbiology.',
      price: 200,
      image: 'https://images.pexels.com/photos/32584683/pexels-photo-32584683.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Organic Biostimulants'
    },
    {
      id: 3,
      name: 'Tomato - ITAI F1',
      description: 'High-quality hybrid tomato seeds with excellent disease resistance and superior yield potential.',
      price: 450,
      image: 'https://images.pexels.com/photos/32586272/pexels-photo-32586272.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
    {
      id: 4,
      name: 'Monkey Repellant',
      description: 'This is a 100% organic solution that repels monkeys and other primates from the garden. It does not kill them but rather hinders them from entering the garden.',
      price: 1900,
      image: 'https://images.pexels.com/photos/32585149/pexels-photo-32585149.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Repellants'
    },
    {
      id: 5,
      name: 'Squash-Montana F1',
      description: 'Premium capsicum seeds with high germination rate and excellent fruit quality.',
      price: 650,
      image: 'https://images.pexels.com/photos/32586298/pexels-photo-32586298.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
    {
      id: 6,
      name: 'Lucerne-Aurora',
      description: 'High-yielding cucumber variety suitable for greenhouse and open field cultivation.',
      price: 400,
      image: 'https://images.pexels.com/photos/32586364/pexels-photo-32586364.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
    {
      id: 7,
      name: 'Hot Pepper-Long red slim cayenne',
      description: 'Premium lettuce seeds with crisp texture and excellent shelf life.',
      price: 350,
      image: 'https://images.pexels.com/photos/32586414/pexels-photo-32586414.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
    {
      id: 8,
      name: 'Carrot-Kuroda',
      description: 'Nutritious spinach variety with fast growth and high vitamin content.',
      price: 300,
      image: 'https://images.pexels.com/photos/32586467/pexels-photo-32586467.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
    {
      id: 9,
      name: 'Chinesse Cabbage-Prima F1',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586474/pexels-photo-32586474.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
    {
      id: 10,
      name: 'Swiss Chard-Fordhook Giant',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586548/pexels-photo-32586548.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
     {
      id: 11,
      name: 'Cabbage F1-Delta',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586565/pexels-photo-32586565.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
   {
      id: 11,
      name: 'Cucumber-Pluto F1',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586573/pexels-photo-32586573.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
   {
      id: 12,
      name: 'Tomato F1-Ekon',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586592/pexels-photo-32586592.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
   {
      id: 13,
      name: 'Sweet Pepper F1-Gala',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586604/pexels-photo-32586604.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
   {
      id: 14,
      name: 'Sweet Pepper-Yolo Wonder',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586628/pexels-photo-32586628.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
   {
      id: 15,
      name: 'Water Melon F1-Kagera',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586664/pexels-photo-32586664.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
   {
      id: 16,
      name: 'Squash-Waltham Butternut',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586703/pexels-photo-32586703.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
     {
      id: 17,
      name: 'Collard',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586714/pexels-photo-32586714.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    }, 
    {
      id: 18,
      name: 'Okra-Clemson Spineless',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586722/pexels-photo-32586722.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
      {
      id: 19,
      name: 'Beetroot-Detroit Dark Red',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586717/pexels-photo-32586717.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
     {
      id: 20,
      name: 'Leek-Italian Giant',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586725/pexels-photo-32586725.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
     {
      id: 21,
      name: 'Sweet Pepper-California Wonder',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586717/pexels-photo-32586717.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
     {
      id: 22,
      name: 'Lettuce-Great Lakes',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586750/pexels-photo-32586750.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
     {
      id: 23,
      name: 'Cabbage F1-Delta',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586751/pexels-photo-32586751.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    }, 
    {
      id: 24,
      name: 'Eggplant-Black Beauty',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586752/pexels-photo-32586752.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
    {
      id: 25,
      name: 'Sweet Pepper-Red Gold F1',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586759/pexels-photo-32586759.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
    {
      id: 26,
      name: 'Sweet Pepper-Yellow Gold F1',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586756/pexels-photo-32586756.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
    {
      id: 27,
      name: 'Onion-Texas Grano 502 PRR',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586780/pexels-photo-32586780.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
    {
      id: 28,
      name: 'Mustard-Florida Broadleaf',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586770/pexels-photo-32586770.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
    {
      id: 29,
      name: 'Broccoli F1-Fast Bro',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586787/pexels-photo-32586787.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    },
    {
      id: 30,
      name: 'Lucerne-Aurora',
      description: 'Hardy kale variety with excellent nutritional value and disease resistance.',
      price: 280,
      image: 'https://images.pexels.com/photos/32586785/pexels-photo-32586785.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load',
      category: 'Seeds'
    }
  ];
  const products = mergeManagedProducts(originalProducts, managedProducts);

  const categories = ['All', ...Array.from(new Set(products.map(product => product.category)))];

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Fertilizers':
        return <Leaf className="h-5 w-5" />;
      case 'Repellants':
        return <Spray className="h-5 w-5" />;
      case 'Seeds':
        return <Seedling className="h-5 w-5" />;
      case 'Organic Biostimulants':
        return <Droplets className="h-5 w-5" />;
      default:
        return <Leaf className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-pattern">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-navy-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 animate-fade-in-up">
              Our Products
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto leading-relaxed animate-slide-in-left">
              Discover our comprehensive range of agricultural solutions designed to help you 
              achieve better yields and sustainable farming practices.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Filter by category:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-green-600 to-navy-800 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700 hover:shadow-md'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
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
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-green-600 to-navy-800 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 shadow-lg">
                      {getCategoryIcon(product.category)}
                      <span>{product.category}</span>
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-green-600 transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
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

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Need Help Choosing the Right Product?
          </h2>
          <p className="text-lg text-white opacity-90 mb-8 max-w-2xl mx-auto">
            Our agricultural experts are here to help you find the perfect solution for your farming needs.
          </p>
          <Link
            to="/contact"
            className="bg-white text-green-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2 shadow-lg"
          >
            <span>Contact Our Experts</span>
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
    </div>
  );
};

export default Products;