import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Edit3, 
  Archive, 
  ArchiveRestore 
} from 'lucide-react';
import { ProductHydrated } from '../types/product';

interface ProductDetailModalProps {
  product: ProductHydrated | null;
  onClose: () => void;
  onEdit: (product: ProductHydrated) => void;
  onToggleArchive: (product: ProductHydrated) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onEdit,
  onToggleArchive,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!product) return null;

  const isArchived = product.status === 'archived';
  const isService = product.type === 'service';
  const primaryBarcode = product.barcodes.find((b) => b.isPrimary) || product.barcodes[0];
  const alternativeBarcodes = product.barcodes.filter((b) => !b.isPrimary);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              بطاقة تعريف الصنف (Product Master Card)
            </h3>
            <span className="text-xs text-slate-400 font-mono">ID: {product.id}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1 text-xs sm:text-sm">
          
          {/* Identity & Status */}
          <div className="pb-3 border-b border-slate-100 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
                  isArchived
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  {isArchived ? 'مؤرشف' : 'نشط'}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {isService ? 'خدمة' : 'منتج ملموس'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {product.nameAr}
              </h2>
              {product.nameEn && (
                <p className="text-xs text-slate-400 dir-ltr text-right mt-0.5">
                  {product.nameEn}
                </p>
              )}
            </div>

            {/* SKU */}
            <div className="text-left font-mono">
              <span className="text-[11px] text-slate-400 font-sans block">رمز SKU</span>
              <span className="font-bold text-slate-900">{product.sku}</span>
            </div>
          </div>

          {/* Barcodes Section (1:M with persistent IDs) */}
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-2.5">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>الباركودات المسجلة للصنف (1:M Barcodes)</span>
              <span className="font-mono text-slate-500 font-normal">
                {product.barcodes.length} باركود
              </span>
            </div>

            {/* Primary Barcode */}
            {primaryBarcode && (
              <div className="bg-white p-2.5 rounded border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded text-[10px] font-semibold">
                      الأساسي
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {primaryBarcode.barcode}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Barcode ID: {primaryBarcode.id}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(primaryBarcode.barcode, 'prim-bar')}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title="نسخ"
                >
                  {copiedKey === 'prim-bar' ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}

            {/* Alternative Barcodes */}
            {alternativeBarcodes.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="text-[11px] font-semibold text-slate-600">الباركودات البديلة:</div>
                <div className="space-y-1">
                  {alternativeBarcodes.map((alt) => (
                    <div
                      key={alt.id}
                      className="bg-white px-2.5 py-1.5 rounded border border-slate-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px]">
                          بديل
                        </span>
                        <span className="font-mono font-medium text-slate-800">
                          {alt.barcode}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({alt.id})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(alt.barcode, `alt-bar-${alt.id}`)}
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="نسخ"
                      >
                        {copiedKey === `alt-bar-${alt.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Relational Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            
            {/* Category Hierarchy */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 block mb-0.5">التصنيف الهرمي</span>
              <span className="font-semibold text-slate-900 text-sm">
                {product.categoryPath || '—'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block mt-1">
                CategoryID: {product.categoryId}
              </span>
            </div>

            {/* Base UoM */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 block mb-0.5">وحدة القياس الأساسية</span>
              <span className="font-semibold text-slate-900 text-sm">
                {product.baseUom ? `${product.baseUom.nameAr} (${product.baseUom.code})` : '—'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block mt-1">
                BaseUomID: {product.baseUomId}
              </span>
            </div>

            {/* Dates */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 sm:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-slate-600">
                <div>
                  <span className="text-slate-400">تاريخ الإنشاء: </span>
                  <span className="font-mono">{formatDate(product.createdAt)}</span>
                </div>
                <div>
                  <span className="text-slate-400">آخر تحديث: </span>
                  <span className="font-mono">{formatDate(product.updatedAt)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-700">الوصف والملاحظات</div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-800 leading-relaxed text-xs">
                {product.description}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={() => {
              onClose();
              onToggleArchive(product);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded bg-white hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isArchived ? (
              <>
                <ArchiveRestore className="w-3.5 h-3.5" />
                <span>إلغاء الأرشفة</span>
              </>
            ) : (
              <>
                <Archive className="w-3.5 h-3.5" />
                <span>أرشفة الصنف</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(product);
              }}
              className="inline-flex items-center gap-1 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>تعديل الصنف</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
