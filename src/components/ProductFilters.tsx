import React, { useRef } from 'react';
import { Search, X, RotateCcw, Filter } from 'lucide-react';
import { ProductFilters, Category } from '../types/product';
import { buildCategoryPath } from '../data/mockProducts';

interface ProductFiltersProps {
  filters: ProductFilters;
  categories: Category[];
  onFilterChange: (updated: Partial<ProductFilters>) => void;
  onResetFilters: () => void;
}

export const ProductFiltersComponent: React.FC<ProductFiltersProps> = ({
  filters,
  categories,
  onFilterChange,
  onResetFilters,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const hasActiveFilters =
    filters.searchQuery.trim() !== '' ||
    filters.categoryId !== 'all' ||
    filters.type !== 'all' ||
    filters.status !== 'all';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3.5">
      
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={searchInputRef}
            id="input-product-search"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="البحث بالاسم (عربي / إنجليزي)، أو رمز SKU، أو أي باركود..."
            className="w-full pr-9 pl-9 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:bg-white transition-colors"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => {
                onFilterChange({ searchQuery: '' });
                searchInputRef.current?.focus();
              }}
              className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
              title="مسح البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors whitespace-nowrap font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط الفلاتر</span>
          </button>
        )}
      </div>

      {/* Structured Filters: Category Hierarchy, Type, Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2.5 border-t border-slate-100">
        
        {/* Category Hierarchy Filter */}
        <div className="space-y-1">
          <label htmlFor="filter-category" className="block text-xs font-semibold text-slate-700">
            التصنيف الهرمي (يشمل الفروع التابعة)
          </label>
          <select
            id="filter-category"
            value={filters.categoryId}
            onChange={(e) => onFilterChange({ categoryId: e.target.value })}
            className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800 focus:bg-white"
          >
            <option value="all">جميع التصنيفات</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {buildCategoryPath(cat.id, categories)}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            نوع الصنف (Type)
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => onFilterChange({ type: 'all' })}
              className={`py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                filters.type === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ type: 'product' })}
              className={`py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                filters.type === 'product'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              منتج
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ type: 'service' })}
              className={`py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                filters.type === 'service'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              خدمة
            </button>
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            الحالة التشغيلية (Status)
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => onFilterChange({ status: 'all' })}
              className={`py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                filters.status === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ status: 'active' })}
              className={`py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                filters.status === 'active'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              نشط
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ status: 'archived' })}
              className={`py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                filters.status === 'archived'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مؤرشف
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
