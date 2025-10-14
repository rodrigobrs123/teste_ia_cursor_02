import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Product } from '../types';
import { formatPrice } from '../utils/format';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [error, setError] = useState('');

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock === 0 || isAdding) return;
    
    try {
      setIsAdding(true);
      setError('');
      await addToCart(product.id, 1);
      
      // Show success feedback
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
      
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      setError(error.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsAdding(false);
    }
  };

  const currentPrice = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
        <img
          src={product.images[0] || '/images/placeholder-product.jpg'}
          alt={product.name}
          className="h-48 w-full object-cover object-center group-hover:opacity-75 transition-opacity"
        />
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          {product.featured && (
            <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded">
              Destaque
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {product.short_description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          
          {hasDiscount && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
              -{Math.round(((product.price - product.sale_price!) / product.price) * 100)}%
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {product.stock > 0 ? `${product.stock} em estoque` : 'Fora de estoque'}
          </span>
          
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAdding}
            className={`p-2 rounded-md transition-all duration-200 ${
              addedToCart
                ? 'bg-green-600 text-white'
                : product.stock === 0 || isAdding
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
            title={
              product.stock === 0 
                ? 'Produto fora de estoque' 
                : isAdding 
                ? 'Adicionando...' 
                : addedToCart 
                ? 'Adicionado ao carrinho!' 
                : 'Adicionar ao carrinho'
            }
          >
            {isAdding ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : addedToCart ? (
              <CheckIcon className="h-5 w-5" />
            ) : (
              <ShoppingCartIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        
        {error && (
          <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;