import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { XCircleIcon } from '@heroicons/react/24/solid';
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
}

const PaymentError: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (id) {
        try {
          setLoading(true);
          const response = await orderService.get(parseInt(id));
          if (response.data.success) {
            setOrder(response.data.data);
          }
        } catch (error) {
          console.error('Error fetching order:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return <Loading text="Carregando informações..." />;
  }

  const status = searchParams.get('status');
  const statusDetail = searchParams.get('status_detail');

  const getErrorMessage = () => {
    if (status === 'rejected') {
      switch (statusDetail) {
        case 'cc_rejected_insufficient_amount':
          return 'Cartão rejeitado por saldo insuficiente.';
        case 'cc_rejected_bad_filled_security_code':
          return 'Código de segurança inválido.';
        case 'cc_rejected_bad_filled_date':
          return 'Data de vencimento inválida.';
        case 'cc_rejected_bad_filled_other':
          return 'Dados do cartão inválidos.';
        default:
          return 'Pagamento rejeitado. Verifique os dados do cartão e tente novamente.';
      }
    }
    
    if (status === 'cancelled') {
      return 'Pagamento cancelado pelo usuário.';
    }

    return 'Ocorreu um problema durante o processamento do pagamento.';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="mb-8">
          <XCircleIcon className="mx-auto h-24 w-24 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Problema no Pagamento
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          {order ? `Olá, ${order.customer_name}!` : 'Olá!'}
        </p>
        <p className="text-gray-600">
          Infelizmente não foi possível processar seu pagamento.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Error Details */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-red-900 mb-2">
            Detalhes do Problema
          </h2>
          <p className="text-red-800">
            {getErrorMessage()}
          </p>
        </div>

        {/* Order Info */}
        {order && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Informações do Pedido
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Número do Pedido:</span>
                <span className="font-medium">#{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor Total:</span>
                <span className="font-medium">{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {order.payment_status === 'failed' ? 'Pagamento Falhou' : 'Pendente'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* What to do next */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-blue-900 mb-4">O que fazer agora?</h3>
          <ul className="space-y-3 text-blue-800">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
              <span>Verifique os dados do seu cartão de crédito</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
              <span>Certifique-se de que há saldo suficiente</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
              <span>Tente novamente ou escolha outro método de pagamento</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">4</span>
              <span>Entre em contato conosco se o problema persistir</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/cart"
            className="inline-flex items-center justify-center bg-primary-600 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-colors"
          >
            Voltar ao Carrinho
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center bg-gray-100 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition-colors"
          >
            Continuar Comprando
          </Link>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Precisa de ajuda? Entre em contato conosco:
          </p>
          <div className="mt-2 space-x-4 text-sm">
            <span className="text-primary-600">📧 suporte@loja.com</span>
            <span className="text-primary-600">📞 (11) 1234-5678</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentError;