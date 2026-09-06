import React, { useState } from 'react';
import { 
  Box, 
  Wrench, 
  Edit3, 
  Archive, 
  ArchiveRestore, 
  Eye, 
  Barcode, 
  Check, 
  Copy, 
  PackageOpen, 
  Image as ImageIcon,
  Tag,
  ChevronDown
} from 'lucide-react';
import { ProductHydrated } from '../types/product';

interface ProductListProps {
  products: ProductHydrated[];
  onViewProduct: (product: ProductHydrated) => void;
  onEditProduct: (product: ProductHydrated) => void;
  onRequestArchiveToggle: (product: ProductHydrated) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onViewProduct,
  onEditProduct,
  onRequestArchiveToggle,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedBarcodesProductId, setExpandedBarcodesProductId] = useState<string | null>(null);

  const handleCopy = (text: string, key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const toggleBarcodeExpand = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedBarcodesProductId((prev) => (prev === productId ? null : productId));
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-2xs">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <PackageOpen className="w-8 h-8 stroke-1" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">لا توجد أصناف مطابقة للبحث أو الفلتر</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          جرب تغيير معايير البحث أو تصفية الحالة والتصنيف، أو قم بإضافة صنف جديد إلى سجل الماستر.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">الصنف</th>
                <th className="py-3.5 px-4">النوع</th>
                <th className="py-3.5 px-4">SKU / الباركود (1:M)</th>
                <th className="py-3.5 px-4">شجرة التصنيف</th>
                <th className="py-3.5 px-4">وحدة القياس</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {products.map((product) => {
                const isArchived = product.status === 'archived';
                const isService = product.type === 'service';
                const primaryBarcode = product.barcodes.find((b) => b.isPrimary) || product.barcodes[0];
                const alternativeBarcodes = product.barcodes.filter((b) => !b.isPrimary);
                const isExpanded = expandedBarcodesProductId === product.id;

                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isArchived ? 'bg-slate-50/40 opacity-75' : ''
                    }`}
                  >
                    {/* Name and Image */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center overflow-hidden">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.nameAr}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 leading-snug">
                            {product.nameAr}
                          </div>
                          {product.nameEn && (
                            <div className="text-xs text-slate-400 font-normal dir-ltr text-right mt-0.5">
                              {product.nameEn}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-4">
                      {isService ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          <Wrench className="w-3.5 h-3.5" />
                          <span>خدمة</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <Box className="w-3.5 h-3.5" />
                          <span>منتج</span>
                        </span>
                      )}
                    </td>

                    {/* SKU & Multiple Barcodes (1:M) */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                      <div className="flex flex-col gap-1.5">
                        {/* SKU */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-sans font-medium text-slate-400">SKU:</span>
                          <span className="font-semibold text-slate-800">{product.sku}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(product.sku, `sku-${product.id}`, e)}
                            className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                            title="نسخ SKU"
                          >
                            {copiedKey === `sku-${product.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        {/* Primary Barcode */}
                        <div className="flex items-center gap-1.5">
                          <Barcode className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-slate-800 font-medium">
                            {primaryBarcode ? primaryBarcode.barcode : 'لا يوجد'}
                          </span>
                          {primaryBarcode && (
                            <button
                              type="button"
                              onClick={(e) => handleCopy(primaryBarcode.barcode, `bar-${product.id}`, e)}
                              className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                              title="نسخ الباركود الأساسي"
                            >
                              {copiedKey === `bar-${product.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Alternative Barcodes Indicator */}
                        {alternativeBarcodes.length > 0 && (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => toggleBarcodeExpand(product.id, e)}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-sans font-semibold transition-colors cursor-pointer"
                              title="عرض الباركودات البديلة لهذا الصنف"
                            >
                              <span>+{alternativeBarcodes.length} باركود بديل</span>
                              <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>

                            {isExpanded && (
                              <div className="absolute top-full right-0 mt-1 z-30 bg-white border border-slate-200 rounded-lg shadow-lg p-2.5 min-w-[200px] space-y-1.5 animate-in fade-in">
                                <div className="text-[10px] font-sans font-bold text-slate-500 pb-1 border-b border-slate-100">
                                  الباركودات البديلة المسجلة:
                                </div>
                                {alternativeBarcodes.map((alt) => (
                                  <div key={alt.id} className="flex items-center justify-between gap-2 text-xs py-0.5">
                                    <span className="text-slate-700 font-mono">{alt.barcode}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => handleCopy(alt.barcode, `alt-${alt.id}`, e)}
                                      className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                                    >
                                      {copiedKey === `alt-${alt.id}` ? (
                                        <Check className="w-3 h-3 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Hierarchical Category */}
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-xs font-medium text-slate-800" title={product.categoryPath}>
                          {product.categoryPath || 'غير مصنف'}
                        </span>
                      </div>
                    </td>

                    {/* Unit of Measure */}
                    <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">
                      {product.baseUom ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800">{product.baseUom.nameAr}</span>
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-500">
                            {product.baseUom.code}
                          </span>
                        </div>
                      ) : (
                        <span>غير محدد</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {isArchived ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Archive className="w-3 h-3" />
                          <span>مؤرشف</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>نشط</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewProduct(product)}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="عرض بطاقة الصنف"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditProduct(product)}
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="تعديل بيانات الصنف"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestArchiveToggle(product)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isArchived
                              ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-50'
                              : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                          }`}
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

      {/* Mobile Touch Cards View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {products.map((product) => {
          const isArchived = product.status === 'archived';
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
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.nameAr}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight">
                      {product.nameAr}
                    </h4>
                    {product.nameEn && (
                      <p className="text-xs text-slate-400 dir-ltr text-right mt-0.5">
                        {product.nameEn}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                        {product.categoryPath}
                      </span>
                      {product.baseUom && (
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-mono">
                          {product.baseUom.nameAr} ({product.baseUom.code})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {isArchived ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      مؤرشف
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      نشط
                    </span>
                  )}
                </div>
              </div>

              {/* SKU & Barcodes Details */}
              <div className="bg-slate-50 rounded-lg p-2.5 font-mono text-xs text-slate-700 flex flex-col gap-1.5 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans">رمز SKU:</span>
                  <span className="font-semibold text-slate-800">{product.sku}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-sans flex items-center gap-1">
                    <Barcode className="w-3.5 h-3.5 text-emerald-600" />
                    <span>الباركود الأساسي:</span>
                  </span>
                  <span className="text-slate-800 font-medium">
                    {primaryBarcode ? primaryBarcode.barcode : '—'}
                  </span>
                </div>
                {alternativeBarcodes.length > 0 && (
                  <div className="pt-1.5 border-t border-slate-200/60 flex flex-wrap items-center gap-1">
                    <span className="text-slate-400 font-sans text-[11px]">بدائل:</span>
                    {alternativeBarcodes.map((alt) => (
                      <span key={alt.id} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-slate-700">
                        {alt.barcode}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Action Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onViewProduct(product)}
                  className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>معاينة</span>
                </button>
                <button
                  type="button"
                  onClick={() => onEditProduct(product)}
                  className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>تعديل</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRequestArchiveToggle(product)}
                  className={`min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    isArchived
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                      : 'bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border-slate-200 hover:border-amber-200'
                  }`}
                >
                  {isArchived ? (
                    <>
                      <ArchiveRestore className="w-4 h-4 text-amber-700" />
                      <span>استعادة</span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4 text-slate-500" />
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
