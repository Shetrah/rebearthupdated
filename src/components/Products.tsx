import React from 'react';
import { ShoppingCart, Leaf, Droplets, Zap, Shield } from 'lucide-react';
import { Product } from '../types';

interface ProductsProps {
  onOrderProduct: (product: Product) => void;
}

const Products: React.FC<ProductsProps> = ({ onOrderProduct }) => {
  const products: Product[] = [
    {
      id: 1,
      name: 'EcoGrow Fertilizer',
      description: 'Organic, nutrient-rich fertilizer that promotes healthy plant growth while maintaining soil integrity.',
      price: 89.99,
      image: 'https://images.pexels.com/photos/1112080/pexels-photo-1112080.jpeg',
      category: 'Fertilizers'
    },
    {
      id: 2,
      name: 'Smart Irrigation System',
      description: 'Automated irrigation solution with moisture sensors and weather integration for optimal water management.',
      price: 299.99,
      image: 'https://images.pexels.com/photos/1570968/pexels-photo-1570968.jpeg',
      category: 'Equipment'
    },
    {
      id: 3,
      name: 'BioShield Pesticide',
      description: 'Environmentally safe pesticide that effectively protects crops without harming beneficial insects.',
      price: 45.99,
      image: 'https://images.pexels.com/photos/974314/pexels-photo-974314.jpeg',
      category: 'Protection'
    },
    {
      id: 4,
      name: 'Soil Health Monitor',
      description: 'Advanced soil testing device that provides real-time data on pH, nutrients, and moisture levels.',
      price: 199.99,
      image: 'https://images.pexels.com/photos/296230/pexels-photo-296230.jpeg',
      category: 'Technology'
    },
    {
      id: 5,
      name: 'Crop Booster Supplement',
      description: 'Natural growth enhancer that increases crop yield and improves plant resistance to diseases.',
      price: 65.99,
      image: 'https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg',
      category: 'Supplements'
    },
    {
      id: 6,
      name: 'Greenhouse Climate Control',
      description: 'Automated climate control system for greenhouses with temperature, humidity, and ventilation management.',
      price: 499.99,
      image: 'https://images.pexels.com/photos/1570968/pexels-photo-1570968.jpeg',
      category: 'Equipment'
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Fertilizers':
        return <Leaf className="h-5 w-5" />;
      case 'Equipment':
        return <Zap className="h-5 w-5" />;
      case 'Protection':
        return <Shield className="h-5 w-5" />;
      case 'Technology':
        return <Zap className="h-5 w-5" />;
      case 'Supplements':
        return <Droplets className="h-5 w-5" />;
      default:
        return <Leaf className="h-5 w-5" />;
    }
  };

  return (
    <section id="products" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Our Products
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our comprehensive range of agricultural solutions designed to help you 
            achieve better yields and sustainable farming practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    {getCategoryIcon(product.category)}
                    <span>{product.category}</span>
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-600">
                    ${product.price}
                  </div>
                  <button
                    onClick={() => onOrderProduct(product)}
                    className="bg-navy-800 hover:bg-navy-900 text-white px-6 py-2 rounded-full flex items-center space-x-2 transition-all duration-300 transform hover:scale-105"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Order Now</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;