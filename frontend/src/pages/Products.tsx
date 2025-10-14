import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FunnelIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import { Product, Category, PaginatedResponse } from '../types';
import { productService, categoryService } from '../services/api';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<PaginatedResponse<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    searchParams.get('category') ? Number(searchParams.get('category')) : undefined
  );
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  // Update search term when URL changes
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category');
    
    if (urlSearchTerm !== searchTerm) {
      setSearchTerm(urlSearchTerm);
    }
    
    if (urlCategory && Number(urlCategory) !== selectedCategory) {
      setSelectedCategory(Number(urlCategory));
    } else if (!urlCategory && selectedCategory !== undefined) {
      setSelectedCategory(undefined);
    }
  }, [searchParams]);
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc'
  );
  const [currentPage, setCurrentPage] = useState(
    searchParams.get('page') ? Number(searchParams.get('page')) : 1
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAll();
        setCategories(response.data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: any = {
          sort_by: sortBy,
          sort_order: sortOrder,
          page: currentPage,
          per_page: 12,
        };

        if (selectedCategory) {
          params.category_id = selectedCategory;
        }

        if (searchTerm && searchTerm.trim()) {
          params.search = searchTerm.trim();
        }

        console.log('Fetching products with params:', params);

        const response = await productService.getAll(params);
        
        if (response.data.success) {
          setProducts(response.data.data);
        } else {
          console.error('Failed to fetch products:', response.data.message);
          setProducts({ data: [], current_page: 1, last_page: 1, per_page: 12, total: 0 });
        }

        // Update URL params
        const newParams = new URLSearchParams();
        if (selectedCategory) newParams.set('category', selectedCategory.toString());
        if (searchTerm && searchTerm.trim()) newParams.set('search', searchTerm.trim());
        if (sortBy !== 'name') newParams.set('sort_by', sortBy);
        if (sortOrder !== 'asc') newParams.set('sort_order', sortOrder);
        if (currentPage !== 1) newParams.set('page', currentPage.toString());

        setSearchParams(newParams);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts({ data: [], current_page: 1, last_page: 1, per_page: 12, total: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchTerm, sortBy, sortOrder, currentPage]);

  const handleCategoryChange = (categoryId: number | undefined) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const renderPagination = () => {
    if (!products || products.last_page <= 1) return null;

    const pages = [];
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(products.last_page, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-2 rounded-md ${
              page === currentPage
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === products.last_page}
          className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próximo
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-semibold">Filtros</h3>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Categorias</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === undefined}
                    onChange={() => handleCategoryChange(undefined)}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Todas</span>
                </label>
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === category.id}
                      onChange={() => handleCategoryChange(category.id)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Produtos</h1>
              {products && (
                <p className="text-gray-600">
                  {products.total} produtos encontrados
                </p>
              )}
            </div>

            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    viewMode === 'grid'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    viewMode === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <ListBulletIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder as 'asc' | 'desc');
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="name-asc">Nome A-Z</option>
                <option value="name-desc">Nome Z-A</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
              </select>
            </div>
          </div>

          {/* Products Grid/List */}
          {loading ? (
            <Loading text="Carregando produtos..." />
          ) : products && products.data.length > 0 ? (
            <>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {products.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {renderPagination()}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhum produto encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;