import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/format';
import { orderService } from '../services/api';

const Checkout: React.FC = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_cpf: '',
    customer_date_of_birth: '',
    shipping_address: '',
    create_account: false,
    password: '',
    password_confirmation: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Nome é obrigatório';
    }

    if (!formData.customer_email.trim()) {
      newErrors.customer_email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.customer_email)) {
      newErrors.customer_email = 'Email inválido';
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'Telefone é obrigatório';
    }

    if (!formData.customer_cpf.trim()) {
      newErrors.customer_cpf = 'CPF é obrigatório';
    } else if (formData.customer_cpf.replace(/\D/g, '').length !== 11) {
      newErrors.customer_cpf = 'CPF deve ter 11 dígitos';
    }

    if (!formData.shipping_address.trim()) {
      newErrors.shipping_address = 'Endereço é obrigatório';
    }

    if (formData.create_account) {
      if (!formData.password) {
        newErrors.password = 'Senha é obrigatória';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      }

      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Confirmação de senha não confere';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Preparar dados do pedido
      const orderData = {
        ...formData,
        customer_cpf: formData.customer_cpf.replace(/\D/g, '') // Remove formatação do CPF
      };

      const response = await orderService.create(orderData);
      
      if (response.data.success) {
        // Redirecionar para MercadoPago
        window.location.href = response.data.data.checkout_url;
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.message || 'Erro ao processar pedido');
    } finally {
      setLoading(false);
    }
  };

  const shippingCost = cart.total >= 200 ? 0 : 15;
  const total = cart.total + shippingCost;

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Informações do Cliente
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
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
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
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
                  CPF *
                </label>
                <input
                  type="text"
                  value={formData.customer_cpf}
                  onChange={(e) => {
                    const formatted = formatCPF(e.target.value);
                    if (formatted.replace(/\D/g, '').length <= 11) {
                      setFormData({ ...formData, customer_cpf: formatted });
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                    errors.customer_cpf ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="000.000.000-00"
                />
                {errors.customer_cpf && (
                  <p className="text-red-500 text-sm mt-1">{errors.customer_cpf}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value);
                    if (formatted.replace(/\D/g, '').length <= 11) {
                      setFormData({ ...formData, customer_phone: formatted });
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                    errors.customer_phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="(00) 00000-0000"
                />
                {errors.customer_phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.customer_phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={formData.customer_date_of_birth}
                  onChange={(e) => setFormData({ ...formData, customer_date_of_birth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço Completo *
              </label>
              <textarea
                rows={3}
                value={formData.shipping_address}
                onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                  errors.shipping_address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Rua, número, complemento, bairro, cidade, estado, CEP"
              />
              {errors.shipping_address && (
                <p className="text-red-500 text-sm mt-1">{errors.shipping_address}</p>
              )}
            </div>

            {/* Account Creation */}
            <div className="mt-6 border-t pt-6">
              <div className="flex items-center">
                <input
                  id="create_account"
                  type="checkbox"
                  checked={formData.create_account}
                  onChange={(e) => setFormData({ ...formData, create_account: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="create_account" className="ml-2 block text-sm text-gray-900">
                  Criar conta para futuras compras
                </label>
              </div>

              {formData.create_account && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Senha *
                    </label>
                    <input
                      type="password"
                      value={formData.password_confirmation}
                      onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                        errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.password_confirmation && (
                      <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processando...' : 'Pagar com MercadoPago'}
              </button>
            </div>
          </div>
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