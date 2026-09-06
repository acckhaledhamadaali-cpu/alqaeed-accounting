import React from 'react';
import { Archive, ArchiveRestore, X } from 'lucide-react';
import { Product } from '../types/product';

interface ArchiveConfirmModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirm: (product: Product) => void;
}

export const ArchiveConfirmModal: React.FC<ArchiveConfirmModalProps> = ({
  isOpen,
  product,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !product) return null;

  const isArchived = product.status === 'archived';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            {isArchived ? (
              <ArchiveRestore className="w-4 h-4 text-slate-700" />
            ) : (
              <Archive className="w-4 h-4 text-slate-700" />
            )}
            <h3 className="text-sm font-bold text-slate-900">
              {isArchived ? 'تأكيد استعادة الصنف' : 'تأكيد أرشفة الصنف'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3 text-xs sm:text-sm">
          <p className="text-slate-700 leading-relaxed">
            {isArchived ? (
              <>
                هل ترغب في إعادة تنشيط الصنف <strong className="text-slate-900">"{product.nameAr}"</strong>؟
                سيصبح الصنف متاحاً للعمليات التشغيلية مجدداً.
              </>
            ) : (
              <>
                هل ترغب في أرشفة الصنف <strong className="text-slate-900">"{product.nameAr}"</strong>؟
                الأرشفة تحفظ سجل الصنف وباركوداته دون حذفه من قاعدة البيانات، مع منع اختياره في الحركات الجديدة.
              </>
            )}
          </p>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 font-mono text-xs text-slate-600">
            <div>SKU: {product.sku}</div>
            <div>ID: {product.id}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => onConfirm(product)}
            className={`px-4 py-1.5 rounded text-xs font-semibold text-white transition-colors cursor-pointer ${
              isArchived
                ? 'bg-slate-900 hover:bg-slate-800'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {isArchived ? 'تأكيد الاستعادة' : 'تأكيد الأرشفة'}
          </button>
        </div>

      </div>
    </div>
  );
};
