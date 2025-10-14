import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, HeartIcon, ShareIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Loading from '../components/Loading';
import { Product } from '../types';
import { productService } from '../services/api';
import { formatPrice } from '../utils/format';
import { useCart } from '../contexts/CartContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await productService.getById(Number(id));
        setProduct(response.data.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAddingToCart(true);
      setError('');
      await addToCart(product.id, quantity);
      
      // Show success message with better UX
      const successMessage = `${quantity} ${quantity === 1 ? 'item adicionado' : 'itens adicionados'} ao carrinho!`;
      
      // You could replace this alert with a toast notification
      alert(successMessage);
      
      // Reset quantity to 1 after successful addition
      setQuantity(1);
      
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      setError(error.message || 'Erro ao adicionar produto ao carrinho');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    try {
      setBuyingNow(true);
      setError('');
      
      // Add product to cart first
      await addToCart(product.id, quantity);
      
      // Navigate to cart page for checkout
      navigate('/cart');
      
    } catch (error: any) {
      console.error('Error during buy now:', error);
      setError(error.message || 'Erro ao processar compra');
    } finally {
      setBuyingNow(false);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return <Loading text="Carregando produto..." />;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h1>
          <Link to="/products" className="text-primary-600 hover:text-primary-700">
            Voltar para produtos
          </Link>
        </div>
      </div>
    );
  }

  const currentPrice = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-primary-600">Início</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary-600">Produtos</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link 
              to={`/products?category=${product.category.id}`} 
              className="hover:text-primary-600"
            >
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden mb-4">
            <img
              src={product.images[selectedImage] || '/images/placeholder-product.jpg'}
              alt={product.name}
              className="w-full h-96 object-cover object-center"
            />
          </div>
          
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <img
                    src={image || '/images/placeholder-product.jpg'}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-20 object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600">SKU: {product.sku}</p>
              {product.brand && (
                <p className="text-gray-600">Marca: {product.brand}</p>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-2 rounded-full border border-gray-300 hover:bg-gray-50"
              >
                {isFavorite ? (
                  <HeartIconSolid className="h-6 w-6 text-red-500" />
                ) : (
                  <HeartIcon className="h-6 w-6 text-gray-400" />
                )}
              </button>
              <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-50">
                <ShareIcon className="h-6 w-6 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-2">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                    -{Math.round(((product.price - product.sale_price!) / product.price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-600">
              ou 12x de {formatPrice(currentPrice / 12)} sem juros
            </p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Especificações</h3>
              <ul className="space-y-1">
                {product.specifications.map((spec, index) => (
                  <li key={index} className="text-gray-600 text-sm">
                    • {spec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <p className="text-green-600 font-medium">
                ✓ {product.stock} unidades em estoque
              </p>
            ) : (
              <p className="text-red-600 font-medium">
                ✗ Produto fora de estoque
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}

          {/* Quantity and Add to Cart */}
          {product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Quantidade:</span>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-center min-w-[3rem]">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                    className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart || buyingNow}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-md font-medium hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed transition-colors"
              >
                {addingToCart ? 'Adicionando...' : 'Adicionar ao Carrinho'}
              </button>

              <button 
                onClick={handleBuyNow}
                disabled={buyingNow || addingToCart}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-md font-medium hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
              >
                {buyingNow ? 'Processando...' : 'Comprar Agora'}
              </button>
            </div>
          )}

          {/* Shipping Info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Informações de Entrega</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Frete grátis para compras acima de R$ 200</li>
              <li>• Entrega em até 7 dias úteis</li>
              <li>• Troca garantida em até 30 dias</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="mt-12">
        <Link
          to="/products"
          className="inline-flex items-center text-primary-600 hover:text-primary-700"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Voltar para produtos
        </Link>
      </div>
    </div>
  );
};

export default ProductDetail;