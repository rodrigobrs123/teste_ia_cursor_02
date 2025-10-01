import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import Loading from '../components/Loading';
import { orderService } from '../services/api';
import { formatPrice } from '../utils/format';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
  orderItems: Array<{
    id: number;
    product_name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

const PaymentSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (id) {
          const response = await orderService.get(parseInt(id));
          if (response.data.success) {
            setOrder(response.data.data);
          } else {
            setError('Pedido não encontrado');
          }
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Erro ao carregar informações do pedido');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return <Loading text="Carregando informações do pagamento..." />;
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="mb-8">
            <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Erro ao carregar pagamento
          </h2>
          <p className="text-gray-600 mb-8">
            {error || 'Não foi possível encontrar as informações do seu pedido.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-colors"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="mb-8">
          <CheckCircleIcon className="mx-auto h-24 w-24 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pagamento Realizado com Sucesso!
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Obrigado pela sua compra, {order.customer_name}!
        </p>
        <p className="text-gray-600">
          Seu pedido foi confirmado e está sendo processado.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Order Header */}
          <div className="bg-green-50 border-b border-green-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Pedido #{order.order_number}
                </h2>
                <p className="text-sm text-gray-600">
                  Realizado em {new Date(order.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {order.payment_status === 'paid' ? 'Pago' : 'Processando'}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {paymentId && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Informações do Pagamento</h3>
              <div className="text-sm text-gray-600">
                <p>ID do Pagamento: {paymentId}</p>
                <p>Status: {status === 'approved' ? 'Aprovado' : status}</p>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Itens do Pedido</h3>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                    <p className="text-sm text-gray-600">
                      Quantidade: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="font-medium text-gray-900">
                    {formatPrice(item.total)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-6 pt-4">
              <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Próximos Passos</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
              <span>Você receberá um email de confirmação em {order.customer_email}</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
              <span>Seu pedido será preparado e enviado em até 2 dias úteis</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
              <span>Você receberá o código de rastreamento por email</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="inline-flex items-center justify-center bg-primary-600 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-colors"
          >
            Continuar Comprando
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-gray-100 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition-colors"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;