import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircleIcon, ClockIcon, DocumentIcon } from '@heroicons/react/24/outline';
import Loading from '../components/Loading';
import { Order } from '../types';
import { orderService } from '../services/api';
import { formatPrice } from '../utils/format';

const OrderSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(location.state?.order || null);
  const [paymentInfo, setPaymentInfo] = useState<any>(location.state?.payment || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (!order && id) {
      const fetchOrder = async () => {
        try {
          const response = await orderService.getById(Number(id));
          setOrder(response.data.data);
        } catch (error) {
          console.error('Error fetching order:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchOrder();
    }
  }, [id, order]);

  if (loading) {
    return <Loading text="Carregando informações do pedido..." />;
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Pedido não encontrado
          </h1>
          <Link to="/" className="text-primary-600 hover:text-primary-700">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'approved':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'approved':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'pending':
        return <ClockIcon className="h-6 w-6 text-yellow-600" />;
      default:
        return <DocumentIcon className="h-6 w-6 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircleIcon className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Pedido Realizado com Sucesso!
        </h1>
        <p className="text-gray-600">
          Seu pedido <span className="font-semibold">{order.order_number}</span> foi criado
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Detalhes do Pedido
          </h2>

          <div className="space-y-4 mb-6">
            <div>
              <span className="text-sm text-gray-500">Número do Pedido</span>
              <p className="font-semibold">{order.order_number}</p>
            </div>

            <div>
              <span className="text-sm text-gray-500">Status do Pedido</span>
              <div className="flex items-center mt-1">
                {getStatusIcon(order.status)}
                <span className={`ml-2 font-medium ${getStatusColor(order.status)}`}>
                  {order.status === 'pending' && 'Pendente'}
                  {order.status === 'processing' && 'Processando'}
                  {order.status === 'shipped' && 'Enviado'}
                  {order.status === 'delivered' && 'Entregue'}
                  {order.status === 'cancelled' && 'Cancelado'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-500">Status do Pagamento</span>
              <div className="flex items-center mt-1">
                {getStatusIcon(order.payment_status)}
                <span className={`ml-2 font-medium ${getStatusColor(order.payment_status)}`}>
                  {order.payment_status === 'pending' && 'Pendente'}
                  {order.payment_status === 'paid' && 'Pago'}
                  {order.payment_status === 'failed' && 'Falhou'}
                  {order.payment_status === 'refunded' && 'Reembolsado'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-500">Forma de Pagamento</span>
              <p className="font-medium">
                {order.payment_method === 'credit_card' && 'Cartão de Crédito'}
                {order.payment_method === 'pix' && 'PIX'}
                {order.payment_method === 'boleto' && 'Boleto Bancário'}
              </p>
            </div>

            <div>
              <span className="text-sm text-gray-500">Total</span>
              <p className="text-xl font-bold text-gray-900">
                {formatPrice(order.total)}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Informações de Entrega</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{order.customer_name}</p>
              <p>{order.customer_email}</p>
              <p>{order.customer_phone}</p>
              <p className="mt-2">{order.shipping_address}</p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Informações de Pagamento
          </h2>

          {/* PIX Payment */}
          {order.payment_method === 'pix' && paymentInfo && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-medium text-blue-900 mb-2">
                  Pagamento via PIX
                </h3>
                <p className="text-blue-800 text-sm mb-4">
                  Use o código PIX abaixo para realizar o pagamento:
                </p>
                
                {paymentInfo.qr_code && (
                  <div className="bg-white p-4 rounded border text-center">
                    <div className="bg-gray-200 h-48 rounded mb-4 flex items-center justify-center">
                      <span className="text-gray-500">QR Code PIX</span>
                    </div>
                    <div className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                      {paymentInfo.qr_code}
                    </div>
                  </div>
                )}
                
                <p className="text-blue-800 text-sm mt-4">
                  ⏰ Prazo para pagamento: 30 minutos
                </p>
              </div>
            </div>
          )}

          {/* Boleto Payment */}
          {order.payment_method === 'boleto' && paymentInfo && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h3 className="font-medium text-yellow-900 mb-2">
                  Pagamento via Boleto
                </h3>
                <p className="text-yellow-800 text-sm mb-4">
                  O boleto foi enviado para seu email e também pode ser acessado através do link abaixo:
                </p>
                
                {paymentInfo.payment_url && (
                  <a
                    href={paymentInfo.payment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                  >
                    <DocumentIcon className="h-5 w-5 mr-2" />
                    Visualizar Boleto
                  </a>
                )}
                
                <p className="text-yellow-800 text-sm mt-4">
                  ⏰ Prazo para pagamento: 3 dias úteis
                </p>
              </div>
            </div>
          )}

          {/* Credit Card Payment */}
          {order.payment_method === 'credit_card' && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="font-medium text-green-900 mb-2">
                Pagamento Aprovado
              </h3>
              <p className="text-green-800 text-sm">
                Seu pagamento foi processado com sucesso. Você receberá um email de confirmação em breve.
              </p>
            </div>
          )}

          {/* Order Items */}
          <div className="mt-8">
            <h3 className="font-semibold text-gray-900 mb-4">Itens do Pedido</h3>
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-sm text-gray-500">
                      Quantidade: {item.quantity} | {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="font-medium">
                    {formatPrice(item.total)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span>{formatPrice(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="text-center mt-8 space-x-4">
        <Link
          to="/products"
          className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-colors"
        >
          Continuar Comprando
        </Link>
        
        <Link
          to="/"
          className="inline-flex items-center bg-gray-100 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition-colors"
        >
          Voltar ao Início
        </Link>
      </div>

      {/* Additional Info */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">O que acontece agora?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <p className="font-medium">Confirmação</p>
            <p>Você receberá um email com a confirmação do pedido</p>
          </div>
          
          <div className="text-center">
            <div className="bg-yellow-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <span className="text-yellow-600 font-bold">2</span>
            </div>
            <p className="font-medium">Preparação</p>
            <p>Seu pedido será preparado em até 2 dias úteis</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <span className="text-green-600 font-bold">3</span>
            </div>
            <p className="font-medium">Entrega</p>
            <p>Você receberá seu pedido em até 7 dias úteis</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;