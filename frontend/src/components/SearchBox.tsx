import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { productService } from '../services/api';

interface SearchSuggestion {
  id: number;
  name: string;
  image?: string;
}

interface SearchBoxProps {
  className?: string;
  placeholder?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({ 
  className = '', 
  placeholder = 'Buscar produtos...' 
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        setLoading(true);
        const response = await productService.searchSuggestions(searchTerm);
        setSuggestions(response.data.data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    navigate(`/products/${suggestion.id}`);
    setSearchTerm('');
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-l-md focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
        />
        <button
          type="submit"
          className="absolute right-0 top-0 h-full px-4 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </form>

      {/* Search Suggestions */}
      {showSuggestions && (suggestions.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Buscando...
            </div>
          ) : (
            <ul className="py-2">
              {suggestions.map((suggestion) => (
                <li key={suggestion.id}>
                  <button
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center space-x-3"
                  >
                    {suggestion.image && (
                      <img
                        src={suggestion.image}
                        alt={suggestion.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <span className="text-sm text-gray-900">{suggestion.name}</span>
                    </div>
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;