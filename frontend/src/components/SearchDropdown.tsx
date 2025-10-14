import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Product } from '../types';
import { productService } from '../services/api';
import { formatPrice } from '../utils/format';

interface SearchDropdownProps {
  onSearch: (term: string) => void;
  className?: string;
  placeholder?: string;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({ 
  onSearch, 
  className = '', 
  placeholder = 'Buscar produtos...' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch suggestions when search term changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim().length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      try {
        setLoading(true);
        const response = await productService.getAll({
          search: searchTerm.trim(),
          per_page: 8 // Limit suggestions to 8 items
        });
        
        if (response.data.success) {
          setSuggestions(response.data.data.data);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
      setSearchTerm('');
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = () => {
    setIsOpen(false);
    setSearchTerm('');
    inputRef.current?.blur();
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:ring-primary-500 focus:border-primary-500 pr-12"
        />
        <button
          type="submit"
          className="absolute right-0 top-0 h-full px-4 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 transition-colors"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Buscando produtos...
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {suggestions.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  onClick={handleSuggestionClick}
                  className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-md overflow-hidden mr-3">
                    <img
                      src={product.images[0] || '/images/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">
                      {product.category?.name}
                    </p>
                    <p className="text-sm font-semibold text-primary-600">
                      {formatPrice(product.sale_price || product.price)}
                    </p>
                  </div>
                </Link>
              ))}
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    onSearch(searchTerm);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className="w-full text-left text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Ver todos os resultados para "{searchTerm}"
                </button>
              </div>
            </>
          ) : searchTerm.trim().length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              Nenhum produto encontrado para "{searchTerm}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;