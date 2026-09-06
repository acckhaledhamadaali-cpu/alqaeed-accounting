import React, { useState } from 'react';
import { 
  Eye, 
  Edit3, 
  Archive, 
  ArchiveRestore, 
  Copy, 
  Check, 
  Plus, 
  Package 
} from 'lucide-react';
import { ProductHydrated } from '../types/product';

interface ProductListProps {
  products: ProductHydrated[];
  totalProductsCount: number;
  onViewProduct: (product: ProductHydrated) => void;
  onEditProduct: (product: ProductHydrated) => void;
  onRequestArchiveToggle: (product: ProductHydrated) => void;
  onOpenAddModal: () => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  totalProductsCount,
  onViewProduct,
  onEditProduct,
  onRequestArchiveToggle,
  onOpenAddModal,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // 1. Professional Empty State when no products exist at all
  if (totalProductsCount === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs">
        <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center mx-auto mb-3">
          <Package className="w-6 h-6 stroke-1.5" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">لا توجد منتجات حتى الآن</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
          ابدأ بإضافة أول منتج إلى سجل الماستر داتا لتعريف الأصناف والخدمات والباركودات.
        </p>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة منتج</span>
        </button>
      </div>
    );
  }

  // 2. Empty State when filter yields 0 results
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center shadow-2xs">
        <p className="text-sm font-semibold text-slate-800">لا توجد أصناف مطابقة للبحث أو الفلتر المحدد</p>
        <p className="text-xs text-slate-500 mt-1">
          جرب تغيير معايير البحث أو اختيار تصنيف آخر.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Desktop & Laptop Table View */}
      <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">الصنف</th>
                <th className="py-3 px-4">النوع</th>
                <th className="py-3 px-4">SKU / الباركود الأساسي والبدائل</th>
                <th className="py-3 px-4">شجرة التصنيف</th>
                <th className="py-3 px-4">وحدة القياس</th>
                <th className="py-3 px-4">الحالة</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => {
                const isArchived = product.status === 'archived';
                const isService = product.type === 'service';
                const primaryBarcode = product.barcodes.find((b) => b.isPrimary) || product.barcodes[0];
                const alternativeBarcodes = product.barcodes.filter((b) => !b.isPrimary);

                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isArchived ? 'bg-slate-50/50 opacity-75' : ''
                    }`}
                  >
                    {/* Name */}
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-bold text-slate-900">{product.nameAr}</div>
                        {product.nameEn && (
                          <div className="text-xs text-slate-400 font-normal dir-ltr text-right">
                            {product.nameEn}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${
                        isService
                          ? 'bg-slate-100 text-slate-700 border-slate-300'
                          : 'bg-slate-100 text-slate-800 border-slate-300'
                      }`}>
                        {isService ? 'خدمة' : 'منتج'}
                      </span>
                    </td>

                    {/* SKU & Barcodes */}
                    <td className="py-3 px-4 font-mono text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-sans">SKU:</span>
                          <span className="font-semibold text-slate-900">{product.sku}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(product.sku, `sku-${product.id}`, e)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                            title="نسخ SKU"
                          >
                            {copiedKey === `sku-${product.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        {primaryBarcode && (
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <span className="text-slate-400 font-sans">باركود (أساسي):</span>
                            <span>{primaryBarcode.barcode}</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopy(primaryBarcode.barcode, `bar-${primaryBarcode.id}`, e)}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                              title="نسخ الباركود"
                            >
                              {copiedKey === `bar-${primaryBarcode.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}

                        {alternativeBarcodes.length > 0 && (
                          <div className="text-[11px] text-slate-500 font-sans">
                            +{alternativeBarcodes.length} باركود بديل
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Category Path */}
                    <td className="py-3 px-4 text-xs text-slate-800 font-medium">
                      {product.categoryPath || '—'}
                    </td>

                    {/* Unit of Measure */}
                    <td className="py-3 px-4 text-xs text-slate-800">
                      {product.baseUom ? (
                        <span>{product.baseUom.nameAr} ({product.baseUom.code})</span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        isArchived
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isArchived ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <span>{isArchived ? 'مؤرشف' : 'نشط'}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onViewProduct(product)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="عرض تفاصيل الصنف"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditProduct(product)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="تعديل الصنف"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestArchiveToggle(product)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title={isArchived ? 'استعادة وتنشيط الصنف' : 'أرشفة الصنف'}
                        >
                          {isArchived ? (
                            <ArchiveRestore className="w-4 h-4" />
                          ) : (
                            <Archive className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tablet & Mobile Card View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-3">
        {products.map((product) => {
          const isArchived = product.status === 'archived';
          const isService = product.type === 'service';
          const primaryBarcode = product.barcodes.find((b) => b.isPrimary) || product.barcodes[0];
          const alternativeBarcodes = product.barcodes.filter((b) => !b.isPrimary);

          return (
            <div
              key={product.id}
              className={`bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3 ${
                isArchived ? 'bg-slate-50/60 opacity-80' : ''
              }`}
            >
              {/* Header inside card */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">
                    {product.nameAr}
                  </h4>
                  {product.nameEn && (
                    <p className="text-xs text-slate-400 dir-ltr text-right mt-0.5">
                      {product.nameEn}
                    </p>
                  )}
                </div>

                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                  isArchived
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  {isArchived ? 'مؤرشف' : 'نشط'}
                </span>
              </div>

              {/* Category and UOM tags */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                  {isService ? 'خدمة' : 'منتج'}
                </span>
                {product.categoryPath && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                    {product.categoryPath}
                  </span>
                )}
                {product.baseUom && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 font-mono">
                    {product.baseUom.nameAr} ({product.baseUom.code})
                  </span>
                )}
              </div>

              {/* SKU & Barcodes */}
              <div className="bg-slate-50 rounded-lg p-2.5 font-mono text-xs text-slate-700 space-y-1 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">رمز SKU:</span>
                  <span className="font-semibold text-slate-900">{product.sku}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">الباركود الأساسي:</span>
                  <span>{primaryBarcode ? primaryBarcode.barcode : '—'}</span>
                </div>
                {alternativeBarcodes.length > 0 && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-400 font-sans">باركودات بديلة:</span>
                    <span>{alternativeBarcodes.length} بديل</span>
                  </div>
                )}
              </div>

              {/* Mobile Actions */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onViewProduct(product)}
                  className="min-h-[44px] flex items-center justify-center gap-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>معاينة</span>
                </button>
                <button
                  type="button"
                  onClick={() => onEditProduct(product)}
                  className="min-h-[44px] flex items-center justify-center gap-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>تعديل</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRequestArchiveToggle(product)}
                  className="min-h-[44px] flex items-center justify-center gap-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  {isArchived ? (
                    <>
                      <ArchiveRestore className="w-4 h-4" />
                      <span>استعادة</span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4" />
                      <span>أرشفة</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
