import React from 'react';
import { 
  Plus, 
  Package, 
  Barcode, 
  FolderTree, 
  Layers, 
  Boxes, 
  Building2, 
  ArrowLeftRight 
} from 'lucide-react';
import { ProductHydrated } from '../types/product';

export type SystemModule = 'products' | 'inventory';

interface HeaderProps {
  currentModule: SystemModule;
  onSelectModule: (module: SystemModule) => void;
  products: ProductHydrated[];
  totalBarcodesCount: number;
  totalCategoriesCount: number;
  totalUomsCount: number;
  totalWarehousesCount: number;
  totalLocationsCount: number;
  totalMovementsCount: number;
  onOpenAddModal: () => void;
  onOpenCategoryManager: () => void;
  onOpenUomManager: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  onSelectModule,
  products,
  totalBarcodesCount,
  totalCategoriesCount,
  totalUomsCount,
  totalWarehousesCount,
  totalLocationsCount,
  totalMovementsCount,
  onOpenAddModal,
  onOpenCategoryManager,
  onOpenUomManager,
}) => {
  const activeProducts = products.filter((p) => p.status === 'active').length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Module Switcher Bar */}
        <div className="pt-3 pb-2 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 ml-2">نظام ERP:</span>
            <button
              type="button"
              onClick={() => onSelectModule('products')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                currentModule === 'products'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Module 01: سجل الأصناف (Product Master)</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectModule('inventory')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                currentModule === 'inventory'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Module 02: المخزون وحركات المستودعات (Inventory)</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span>Enterprise Ledger ERP</span>
            <span>•</span>
            <span>Saudi Market Standard</span>
          </div>
        </div>

        {/* Module Specific Top Bar */}
        <div className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand & Module Identification */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {currentModule === 'products' ? 'M01' : 'M02'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                  {currentModule === 'products'
                    ? 'سجل الأصناف الرئيسي (Product Master)'
                    : 'المخزون وحركات المستودعات (Inventory & Stock Movements)'}
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 rounded border border-slate-200">
                  {currentModule === 'products' ? 'v1.1-Relational' : 'v2.0-Ledger'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentModule === 'products'
                  ? 'إدارة المعرّفات الموحدة، شجرة التصنيفات، وحدات القياس، والباركودات المتعددة'
                  : 'المستودعات، مواقع التخزين الهرمية، دفتر حركات المخزون (Ledger)، والمناقلات الذرية'}
              </p>
            </div>
          </div>

          {/* Action Buttons for Module 01 */}
          {currentModule === 'products' && (
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
          )}

        </div>

        {/* Metric Strip (Clean ERP KPIs) */}
        <div className="py-2.5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          
          {currentModule === 'products' ? (
            <>
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
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-slate-600">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500">المستودعات المسجلة:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{totalWarehousesCount}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500">مواقع التخزين:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{totalLocationsCount}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <Boxes className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500">حركات سجل المخزون (Ledger):</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{totalMovementsCount}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-600">
                <ArrowLeftRight className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500">الأصناف المؤهلة للحركة:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {products.filter((p) => p.status === 'active' && p.type === 'product').length}
                </span>
              </div>
            </>
          )}

        </div>

      </div>
    </header>
  );
};
