import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">SportShop</h3>
            <p className="text-gray-400 mb-4">
              Sua loja especializada em artigos esportivos com os melhores produtos e preços.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297L3.381 17.44c1.217 1.119 2.838 1.8 4.617 1.8c3.598 0 6.522-2.924 6.522-6.522S12.596 6.196 8.998 6.196c-1.779 0-3.4.681-4.617 1.8l1.745 1.749c.875-.807 2.026-1.297 3.323-1.297c2.451 0 4.441 1.99 4.441 4.441s-1.99 4.441-4.441 4.441z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-gray-400 hover:text-white">Produtos</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white">Sobre Nós</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contato</Link></li>
              <li><Link to="/help" className="text-gray-400 hover:text-white">Ajuda</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-bold mb-4">Atendimento</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Segunda a Sexta: 8h às 18h</li>
              <li>Sábado: 8h às 14h</li>
              <li>Telefone: (11) 99999-9999</li>
              <li>Email: contato@sportshop.com</li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-lg font-bold mb-4">Formas de Pagamento</h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white rounded p-2 flex items-center justify-center">
                <span className="text-xs text-gray-800 font-bold">VISA</span>
              </div>
              <div className="bg-white rounded p-2 flex items-center justify-center">
                <span className="text-xs text-gray-800 font-bold">MASTER</span>
              </div>
              <div className="bg-white rounded p-2 flex items-center justify-center">
                <span className="text-xs text-gray-800 font-bold">PIX</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">Ambiente seguro e protegido</p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 SportShop. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;