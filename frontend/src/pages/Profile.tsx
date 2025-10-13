import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import { Order } from '../types';
import Loading from '../components/Loading';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await authService.getMyOrders();
        setOrders(response.data.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'processing':
        return 'Processando';
      case 'shipped':
        return 'Enviado';
      case 'delivered':
        return 'Entregue';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading) {
    return <Loading text="Carregando perfil..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Minha Conta</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dados Pessoais
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Meus Pedidos ({orders.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">E-mail</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CPF</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.cpf || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {user?.data_nascimento ? formatDate(user.data_nascimento) : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.telefone || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.estado || 'Não informado'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CEP</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.cep || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">UF</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.uf || 'Não informado'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Endereço</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.endereco || 'Não informado'}</p>
                  </div>
                  {user?.complemento && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Complemento</label>
                      <p className="mt-1 text-sm text-gray-900">{user.complemento}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Histórico de Pedidos</h3>
              
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Você ainda não fez nenhum pedido.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            Pedido #{order.order_number}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Realizado em {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusText(order.status)}
                          </span>
                          <p className="text-lg font-bold text-gray-900 mt-1">
                            {formatCurrency(order.total)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center py-2 border-t border-gray-100">
                            <div>
                              <p className="font-medium text-gray-900">{item.product_name}</p>
                              <p className="text-sm text-gray-500">
                                Quantidade: {item.quantity} | Preço unitário: {formatCurrency(item.price)}
                              </p>
                            </div>
                            <p className="font-medium text-gray-900">
                              {formatCurrency(item.total)}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Frete:</span>
                          <span>{formatCurrency(order.shipping_cost)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg mt-2">
                          <span>Total:</span>
                          <span>{formatCurrency(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;