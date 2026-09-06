import React from 'react';
import { Package, Plus, Layers, CheckCircle2, Box, Wrench, Barcode } from 'lucide-react';
import { ProductHydrated } from '../types/product';

interface HeaderProps {
  products: ProductHydrated[];
  totalBarcodesCount: number;
  onOpenAddModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ products, totalBarcodesCount, onOpenAddModal }) => {
  const totalCount = products.length;
  const activeCount = products.filter((p) => p.status === 'active').length;
  const serviceCount = products.filter((p) => p.type === 'service').length;
  const productCount = products.filter((p) => p.type === 'product').length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Title & Context */}
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-md">
                  MODULE 01 — ARCHITECTURE REFACTORED
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  سجل بطاقات الأصناف (Product Master)
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                النموذج العلائقي المصحح: تعدد الباركودات (1:M)، شجرة تصنيفات هرمية، ووحدات قياس مستقلة
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <button
              id="btn-add-product"
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>إضافة صنف جديد</span>
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-2.5 flex items-center gap-3">
            <div className="p-2 bg-white rounded-md text-slate-700 shadow-2xs">
              <Layers className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">إجمالي الأصناف</div>
              <div className="text-base font-bold text-slate-900">{totalCount} صنف</div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-2.5 flex items-center gap-3">
            <div className="p-2 bg-white rounded-md text-emerald-600 shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">الأصناف النشطة</div>
              <div className="text-base font-bold text-emerald-700">{activeCount} نشط</div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-2.5 flex items-center gap-3">
            <div className="p-2 bg-white rounded-md text-blue-600 shadow-2xs">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">منتجات ملموسة</div>
              <div className="text-base font-bold text-blue-700">{productCount} منتج</div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-2.5 flex items-center gap-3">
            <div className="p-2 bg-white rounded-md text-purple-600 shadow-2xs">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">خدمات / استشارات</div>
              <div className="text-base font-bold text-purple-700">{serviceCount} خدمة</div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-2.5 flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="p-2 bg-white rounded-md text-amber-600 shadow-2xs">
              <Barcode className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">إجمالي الباركودات</div>
              <div className="text-base font-bold text-amber-700">{totalBarcodesCount} باركود (1:M)</div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
