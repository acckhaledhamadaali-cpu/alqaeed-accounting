import React from 'react';
import { Plus, Package, Barcode, FolderTree, Layers } from 'lucide-react';
import { ProductHydrated } from '../types/product';

interface HeaderProps {
  products: ProductHydrated[];
  totalBarcodesCount: number;
  totalCategoriesCount: number;
  totalUomsCount: number;
  onOpenAddModal: () => void;
  onOpenCategoryManager: () => void;
  onOpenUomManager: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  products,
  totalBarcodesCount,
  totalCategoriesCount,
  totalUomsCount,
  onOpenAddModal,
  onOpenCategoryManager,
  onOpenUomManager,
}) => {
  const activeProducts = products.filter((p) => p.status === 'active').length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Bar */}
        <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand & Module Identification */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
              M01
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                  سجل الأصناف الرئيسي (Product Master)
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200">
                  v1.1-Relational
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                إدارة المعرّفات الموحدة، شجرة التصنيفات، وحدات القياس، والباركودات المتعددة
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={onOpenCategoryManager}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
              title="إدارة شجرة التصنيفات الهرمية"
            >
              <FolderTree className="w-4 h-4 text-slate-500" />
              <span>التصنيفات ({totalCategoriesCount})</span>
            </button>

            <button
              type="button"
              onClick={onOpenUomManager}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
              title="إدارة وحدات القياس"
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span>وحدات القياس ({totalUomsCount})</span>
            </button>

            <button
              type="button"
              id="btn-add-product"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صنف جديد</span>
            </button>
          </div>

        </div>

        {/* Metric Strip (Clean ERP KPIs) */}
        <div className="py-2.5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          
          <div className="flex items-center gap-2 text-slate-600">
            <Package className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-slate-500">إجمالي الأصناف:</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{products.length}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="text-slate-500">أصناف نشطة:</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{activeProducts}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Barcode className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-slate-500">الباركودات المسجلة:</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{totalBarcodesCount}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <FolderTree className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-slate-500">التصنيفات:</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{totalCategoriesCount}</span>
          </div>

        </div>

      </div>
    </header>
  );
};
