import React, { useState } from 'react';
import { 
  X, 
  Box, 
  Wrench, 
  Barcode as BarcodeIcon, 
  Calendar, 
  Tag, 
  Layers, 
  Archive, 
  CheckCircle2, 
  Image as ImageIcon,
  Edit3,
  ArchiveRestore,
  ShieldAlert,
  Copy,
  Check,
  GitFork
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${isService ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              {isService ? <Wrench className="w-5 h-5" /> : <Box className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                بطاقة تعريف الصنف (Product Card)
              </h3>
              <span className="text-xs text-slate-400 font-mono">ID: {product.id}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          
          {/* Main Identity & Image */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-4 border-b border-slate-100">
            <div className="w-24 h-24 rounded-xl bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center overflow-hidden">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.nameAr}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-10 h-10 text-slate-300" />
              )}
            </div>
            <div className="flex-1 text-center sm:text-right space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {isArchived ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    مؤرشف
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    نشط في النظام
                  </span>
                )}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isService ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {isService ? 'خدمة (Service)' : 'منتج (Product)'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                {product.nameAr}
              </h2>
              {product.nameEn && (
                <p className="text-sm text-slate-500 font-sans dir-ltr sm:text-right">
                  {product.nameEn}
                </p>
              )}
            </div>
          </div>

          {/* Barcodes Section (1:M Multiple Barcodes) */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BarcodeIcon className="w-4 h-4 text-emerald-600" />
                <span>الباركودات المسجلة (علاقة 1 : متعدد)</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 bg-white border border-slate-200 rounded font-semibold text-slate-600">
                {product.barcodes.length} باركود مسجل
              </span>
            </div>
            
            {/* Primary Barcode Visual Display */}
            {primaryBarcode && (
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center shadow-2xs space-y-2">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>الباركود الأساسي (Primary Barcode)</span>
                </div>

                {/* Barcode Visual Stripes */}
                <div className="flex items-center justify-center gap-[2.5px] h-11 px-2 overflow-hidden select-none">
                  {primaryBarcode.barcode.split('').map((char, index) => {
                    const num = parseInt(char, 10) || 1;
                    const widths = ['w-[1.5px]', 'w-[2px]', 'w-[3px]', 'w-[1px]', 'w-[4px]', 'w-[2.5px]', 'w-[3.5px]'];
                    const widthClass = widths[num % widths.length];
                    return (
                      <div key={index} className="flex items-center gap-[2px] h-full">
                        <div className={`h-full bg-slate-900 ${widthClass}`} />
                        <div className="h-full bg-transparent w-[1px]" />
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-base tracking-wider text-slate-900 font-bold">
                    {primaryBarcode.barcode}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(primaryBarcode.barcode, 'prim-bar')}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
                    title="نسخ الباركود الأساسي"
                  >
                    {copiedKey === 'prim-bar' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Alternative Barcodes List */}
            {alternativeBarcodes.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-slate-500">
                  الباركودات البديلة (Alternative Barcodes):
                </div>
                <div className="space-y-1.5">
                  {alternativeBarcodes.map((alt) => (
                    <div
                      key={alt.id}
                      className="bg-white px-3 py-2 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-semibold">
                          بديل
                        </span>
                        <span className="font-mono font-medium text-slate-800">{alt.barcode}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(alt.barcode, `alt-bar-${alt.id}`)}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
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

            <div className="flex items-center justify-between text-xs text-slate-600 font-mono pt-1">
              <span className="text-slate-400 font-sans">رمز SKU الموحد:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900">{product.sku}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(product.sku, 'sku-val')}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
                >
                  {copiedKey === 'sku-val' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Relational Attributes Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            
            {/* Hierarchical Category */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 col-span-2">
              <div className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>شجرة التصنيف الهرمية (Hierarchical Category)</span>
              </div>
              <div className="font-semibold text-slate-800 text-sm">
                {product.categoryPath || 'غير مصنف'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                category_id: {product.categoryId}
              </div>
            </div>

            {/* Base Unit of Measure */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 col-span-2 sm:col-span-1">
              <div className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>وحدة القياس الأساسية (Base UoM)</span>
              </div>
              <div className="font-semibold text-slate-800">
                {product.baseUom?.nameAr} ({product.baseUom?.code})
              </div>
              {product.baseUom?.nameEn && (
                <div className="text-xs text-slate-400 mt-0.5">
                  {product.baseUom.nameEn}
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 col-span-2 sm:col-span-1">
              <div className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>تاريخ الإنشاء والتحديث</span>
              </div>
              <div className="text-xs font-medium text-slate-700">
                {formatDate(product.createdAt)}
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-600">الوصف والملاحظات</div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {product.description}
              </div>
            </div>
          )}

          {/* Architectural Separation & PostgreSQL Readiness Notice */}
          <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <GitFork className="w-4 h-4 text-emerald-600" />
              <span>هيكل الجداول المقابل في PostgreSQL:</span>
            </div>
            <div className="font-mono text-[11px] bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
              • products (id, name_ar, name_en, sku, category_id, base_uom_id, type, status)<br />
              • product_barcodes (id, product_id, barcode, is_primary)<br />
              • categories (id, name_ar, name_en, parent_id, status)<br />
              • units_of_measure (id, name_ar, name_en, code, status)
            </div>
          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/70">
          <button
            type="button"
            onClick={() => {
              onClose();
              onToggleArchive(product);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              isArchived
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200'
            }`}
          >
            {isArchived ? (
              <>
                <ArchiveRestore className="w-4 h-4" />
                <span>إلغاء الأرشفة والتنشيط</span>
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
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
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>تعديل الصنف</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
