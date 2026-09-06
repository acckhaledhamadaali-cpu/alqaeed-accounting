import React, { useRef } from 'react';
import { Search, Barcode, Filter, X, RefreshCcw, Tag } from 'lucide-react';
import { ProductFilters, Category } from '../types/product';
import { buildCategoryPath } from '../data/mockProducts';

interface ProductFiltersProps {
  filters: ProductFilters;
  categories: Category[];
  sampleBarcodes: string[];
  onFilterChange: (updated: Partial<ProductFilters>) => void;
  onResetFilters: () => void;
  onBarcodeScanSimulate: (barcode: string) => void;
}

export const ProductFiltersComponent: React.FC<ProductFiltersProps> = ({
  filters,
  categories,
  sampleBarcodes,
  onFilterChange,
  onResetFilters,
  onBarcodeScanSimulate,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const hasActiveFilters =
    filters.searchQuery.trim() !== '' ||
    filters.categoryId !== 'all' ||
    filters.type !== 'all' ||
    filters.status !== 'all';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
      
      {/* Search Bar with multi-target search (Name Ar/En, SKU, Any Barcode) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            ref={searchInputRef}
            id="input-product-search"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="ابحث باسم الصنف (عربي أو إنجليزي)، أو رمز SKU، أو أي باركود (أساسي أو بديل)..."
            className="w-full pr-10 pl-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => {
                onFilterChange({ searchQuery: '' });
                searchInputRef.current?.focus();
              }}
              className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              title="مسح البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Barcode Scanner Simulation for POS readiness */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (sampleBarcodes.length > 0) {
                const randomBarcode = sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)];
                onBarcodeScanSimulate(randomBarcode);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200/80 transition-colors whitespace-nowrap cursor-pointer"
            title="محاكاة مسح باركود بواسطة قارئ الباركود"
          >
            <Barcode className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">محاكاة مسح باركود</span>
            <span className="sm:hidden">مسح تجريبي</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-3 py-2.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors whitespace-nowrap font-medium cursor-pointer"
              title="إعادة تعيين الفلاتر"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Row: Hierarchical Category, Type, Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
        
        {/* Hierarchical Category Filter */}
        <div className="space-y-1.5">
          <label htmlFor="filter-category" className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            <span>التصنيف الهرمي (Category)</span>
          </label>
          <select
            id="filter-category"
            value={filters.categoryId}
            onChange={(e) => onFilterChange({ categoryId: e.target.value })}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          >
            <option value="all">جميع التصنيفات</option>
            {categories.map((cat) => {
              const fullPath = buildCategoryPath(cat.id, categories);
              return (
                <option key={cat.id} value={cat.id}>
                  {fullPath}
                </option>
              );
            })}
          </select>
        </div>

        {/* Type Filter: Product vs Service */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>نوع الصنف (Type)</span>
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => onFilterChange({ type: 'all' })}
              className={`py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
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
              className={`py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                filters.type === 'product'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              منتج
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ type: 'service' })}
              className={`py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                filters.type === 'service'
                  ? 'bg-purple-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              خدمة
            </button>
          </div>
        </div>

        {/* Status Filter: Active vs Archived */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span>الحالة التشغيلية (Status)</span>
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => onFilterChange({ status: 'all' })}
              className={`py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
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
              className={`py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                filters.status === 'active'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              نشط
            </button>
            <button
              type="button"
              onClick={() => onFilterChange({ status: 'archived' })}
              className={`py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                filters.status === 'archived'
                  ? 'bg-amber-600 text-white shadow-2xs font-bold'
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
