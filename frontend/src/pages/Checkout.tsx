import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCardIcon, DevicePhoneMobileIcon, DocumentIcon } from '@heroicons/react/24/outline';
import Loading from '../components/Loading';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/format';
import { orderService } from '../services/api';
import { PaymentData } from '../types';
import mercadoPagoService from '../services/mercadopago';

const Checkout: React.FC = () => {
  const { cart, clearCart, loading: cartLoading } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping');
  const [mpInitialized, setMpInitialized] = useState(false);
  const [mpLoading, setMpLoading] = useState(true);

  // Form data
  const [shippingData, setShippingData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
  });

  const [paymentData, setPaymentData] = useState({
    payment_method: 'credit_card' as 'credit_card' | 'pix' | 'boleto',
    card_data: {
      number: '',
      holder_name: '',
      expiry_month: '',
      expiry_year: '',
      cvv: '',
    },
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialize Mercado Pago
  useEffect(() => {
    const initMercadoPago = async () => {
      try {
        await mercadoPagoService.initialize();
        setMpInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Mercado Pago:', error);
      } finally {
        setMpLoading(false);
      }
    };

    initMercadoPago();
  }, []);

  // Show loading while cart is being fetched or MP is initializing
  if (cartLoading || mpLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading text={cartLoading ? "Carregando carrinho..." : "Inicializando Mercado Pago..."} />
      </div>
    );
  }

  // If cart is null, it's still loading, so show loading state
  if (cart === null) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading text="Carregando carrinho..." />
      </div>
    );
  }

  // Only redirect to cart if we're sure the cart is loaded and empty
  if (cart && cart.items && cart.items.length === 0) {
    console.log('Cart is empty, redirecting to cart page');
    navigate('/cart');
    return null;
  }

  const validateShipping = () => {
    const newErrors: { [key: string]: string } = {};

    if (!shippingData.customer_name.trim()) {
      newErrors.customer_name = 'Nome é obrigatório';
    }

    if (!shippingData.customer_email.trim()) {
      newErrors.customer_email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(shippingData.customer_email)) {
      newErrors.customer_email = 'Email inválido';
    }

    if (!shippingData.customer_phone.trim()) {
      newErrors.customer_phone = 'Telefone é obrigatório';
    }

    if (!shippingData.shipping_address.trim()) {
      newErrors.shipping_address = 'Endereço é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    const newErrors: { [key: string]: string } = {};

    if (paymentData.payment_method === 'credit_card') {
      if (!paymentData.card_data.number.trim()) {
        newErrors.card_number = 'Número do cartão é obrigatório';
      } else if (!mercadoPagoService.validateCardNumber(paymentData.card_data.number)) {
        newErrors.card_number = 'Número do cartão inválido';
      }

      if (!paymentData.card_data.holder_name.trim()) {
        newErrors.card_holder = 'Nome do portador é obrigatório';
      }

      if (!paymentData.card_data.expiry_month) {
        newErrors.expiry_month = 'Mês é obrigatório';
      }

      if (!paymentData.card_data.expiry_year) {
        newErrors.expiry_year = 'Ano é obrigatório';
      }

      if (!mercadoPagoService.validateExpiryDate(paymentData.card_data.expiry_month, paymentData.card_data.expiry_year)) {
        newErrors.expiry_date = 'Data de validade inválida';
      }

      if (!paymentData.card_data.cvv.trim()) {
        newErrors.cvv = 'CVV é obrigatório';
      } else if (!mercadoPagoService.validateCVV(paymentData.card_data.cvv)) {
        newErrors.cvv = 'CVV inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 'shipping' && validateShipping()) {
      setStep('payment');
    } else if (step === 'payment' && validatePayment()) {
      setStep('review');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate cart one more time before submitting
      if (!cart || cart.items.length === 0) {
        alert('Carrinho está vazio. Adicione produtos antes de finalizar o pedido.');
        navigate('/products');
        return;
      }

      const orderData: PaymentData = {
        ...shippingData,
        payment_method: paymentData.payment_method,
      };

      if (paymentData.payment_method === 'credit_card') {
        // Create card token with Mercado Pago
        if (!mpInitialized) {
          throw new Error('Mercado Pago não foi inicializado. Recarregue a página e tente novamente.');
        }

        try {
          const cardToken = await mercadoPagoService.createCardToken(paymentData.card_data);
          orderData.card_token = cardToken.id;
          orderData.card_data = {
            ...paymentData.card_data,
            expiry_month: Number(paymentData.card_data.expiry_month),
            expiry_year: Number(paymentData.card_data.expiry_year),
          };
        } catch (tokenError) {
          console.error('Error creating card token:', tokenError);
          throw new Error('Erro ao processar dados do cartão. Verifique as informações e tente novamente.');
        }
      }

      console.log('Submitting order with data:', orderData);

      const response = await orderService.create(orderData);
      
      if (response.data.success) {
        await clearCart();
        navigate(`/order-success/${response.data.data.order.id}`, {
          state: { 
            order: response.data.data.order,
            payment: response.data.data.payment 
          }
        });
      } else {
        alert(response.data.message || 'Erro ao processar pedido');
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      
      let errorMessage = 'Erro ao processar pedido';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        if (error.response.data?.message?.includes('Carrinho está vazio')) {
          errorMessage = 'Carrinho está vazio. Adicione produtos antes de finalizar o pedido.';
          navigate('/products');
        } else {
          errorMessage = error.response.data?.message || 'Dados inválidos. Verifique as informações e tente novamente.';
        }
      } else if (error.response?.status === 422) {
        errorMessage = 'Dados inválidos. Verifique as informações do formulário.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.';
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const shippingCost = cart.total >= 200 ? 0 : 15;
  const total = cart.total + shippingCost;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Progress Steps */}
          <div className="flex items-center mb-8">
            {['shipping', 'payment', 'review'].map((s, index) => (
              <React.Fragment key={s}>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step === s
                      ? 'bg-primary-600 text-white'
                      : index < ['shipping', 'payment', 'review'].indexOf(step)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm ${
                  step === s ? 'text-primary-600 font-medium' : 'text-gray-500'
                }`}>
                  {s === 'shipping' ? 'Entrega' : s === 'payment' ? 'Pagamento' : 'Revisão'}
                </span>
                {index < 2 && <div className="flex-1 h-px bg-gray-300 mx-4" />}
              </React.Fragment>
            ))}
          </div>

          {/* Shipping Step */}
          {step === 'shipping' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Informações de Entrega
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={shippingData.customer_name}
                    onChange={(e) => setShippingData({ ...shippingData, customer_name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                      errors.customer_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.customer_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={shippingData.customer_email}
                    onChange={(e) => setShippingData({ ...shippingData, customer_email: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                      errors.customer_email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.customer_email && (
                    <p className="text-red-500 text-sm mt-1">{errors.customer_email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={shippingData.customer_phone}
                    onChange={(e) => setShippingData({ ...shippingData, customer_phone: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                      errors.customer_phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.customer_phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.customer_phone}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço Completo *
                </label>
                <textarea
                  rows={3}
                  value={shippingData.shipping_address}
                  onChange={(e) => setShippingData({ ...shippingData, shipping_address: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                    errors.shipping_address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Rua, número, complemento, bairro, cidade, estado, CEP"
                />
                {errors.shipping_address && (
                  <p className="text-red-500 text-sm mt-1">{errors.shipping_address}</p>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={handleNext}
                  className="bg-primary-600 text-white px-6 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Forma de Pagamento
              </h2>

              {/* Payment Method Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { key: 'credit_card', label: 'Cartão de Crédito', icon: CreditCardIcon },
                  { key: 'pix', label: 'PIX', icon: DevicePhoneMobileIcon },
                  { key: 'boleto', label: 'Boleto', icon: DocumentIcon },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setPaymentData({ ...paymentData, payment_method: key as any })}
                    className={`p-4 border rounded-lg text-center hover:bg-gray-50 ${
                      paymentData.payment_method === key
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <Icon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>

              {/* Credit Card Form */}
              {paymentData.payment_method === 'credit_card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número do Cartão *
                    </label>
                    <input
                      type="text"
                      value={paymentData.card_data.number}
                      onChange={(e) => {
                        const formattedNumber = mercadoPagoService.formatCardNumber(e.target.value);
                        setPaymentData({
                          ...paymentData,
                          card_data: { ...paymentData.card_data, number: formattedNumber }
                        });
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                        errors.card_number ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                    {errors.card_number && (
                      <p className="text-red-500 text-sm mt-1">{errors.card_number}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Portador *
                    </label>
                    <input
                      type="text"
                      value={paymentData.card_data.holder_name}
                      onChange={(e) => setPaymentData({
                        ...paymentData,
                        card_data: { ...paymentData.card_data, holder_name: e.target.value }
                      })}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                        errors.card_holder ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nome como está no cartão"
                    />
                    {errors.card_holder && (
                      <p className="text-red-500 text-sm mt-1">{errors.card_holder}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mês *
                      </label>
                      <select
                        value={paymentData.card_data.expiry_month}
                        onChange={(e) => setPaymentData({
                          ...paymentData,
                          card_data: { ...paymentData.card_data, expiry_month: e.target.value }
                        })}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                          errors.expiry_month ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Mês</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {String(i + 1).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ano *
                      </label>
                      <select
                        value={paymentData.card_data.expiry_year}
                        onChange={(e) => setPaymentData({
                          ...paymentData,
                          card_data: { ...paymentData.card_data, expiry_year: e.target.value }
                        })}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                          errors.expiry_year ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Ano</option>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() + i;
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={paymentData.card_data.cvv}
                        onChange={(e) => setPaymentData({
                          ...paymentData,
                          card_data: { ...paymentData.card_data, cvv: e.target.value }
                        })}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                          errors.cvv ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="123"
                        maxLength={3}
                      />
                      {errors.cvv && (
                        <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                      )}
                    </div>
                  </div>
                  {errors.expiry_date && (
                    <p className="text-red-500 text-sm mt-1">{errors.expiry_date}</p>
                  )}
                </div>
              )}

              {/* PIX Info */}
              {paymentData.payment_method === 'pix' && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-blue-800">
                    Após confirmar o pedido, você receberá o código PIX para pagamento.
                    O prazo para pagamento é de 30 minutos.
                  </p>
                </div>
              )}

              {/* Boleto Info */}
              {paymentData.payment_method === 'boleto' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-yellow-800">
                    Após confirmar o pedido, você receberá o boleto por email.
                    O prazo para pagamento é de 3 dias úteis.
                  </p>
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep('shipping')}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-400 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleNext}
                  className="bg-primary-600 text-white px-6 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Review Step */}
          {step === 'review' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Revisar Pedido
              </h2>

              {/* Shipping Info */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Informações de Entrega</h3>
                <div className="text-sm text-gray-600">
                  <p>{shippingData.customer_name}</p>
                  <p>{shippingData.customer_email}</p>
                  <p>{shippingData.customer_phone}</p>
                  <p className="mt-2">{shippingData.shipping_address}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Forma de Pagamento</h3>
                <p className="text-sm text-gray-600">
                  {paymentData.payment_method === 'credit_card' && 'Cartão de Crédito'}
                  {paymentData.payment_method === 'pix' && 'PIX'}
                  {paymentData.payment_method === 'boleto' && 'Boleto Bancário'}
                </p>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Itens do Pedido</h3>
                <div className="space-y-2">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product.name} x {item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep('payment')}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-400 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processando...' : 'Finalizar Pedido'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Resumo do Pedido
            </h2>

            <div className="space-y-2 mb-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="truncate mr-2">
                    {item.product.name} x {item.quantity}
                  </span>
                  <span className="font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Frete</span>
                <span>{shippingCost === 0 ? 'Grátis' : formatPrice(shippingCost)}</span>
              </div>
              
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <Loading text="Processando seu pedido..." />
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;