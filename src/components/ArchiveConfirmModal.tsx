import React from 'react';
import { AlertTriangle, Archive, ArchiveRestore, X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl shrink-0 ${
              isArchived ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {isArchived ? (
                <ArchiveRestore className="w-6 h-6" />
              ) : (
                <Archive className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                {isArchived ? 'تأكيد إلغاء أرشفة الصنف' : 'تأكيد أرشفة الصنف'}
              </h3>
              
              <div className="text-sm text-slate-600 space-y-1.5 leading-relaxed">
                <p>
                  هل أنت متأكد من {isArchived ? 'إعادة تنشيط' : 'أرشفة'} الصنف:
                </p>
                <p className="font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg text-sm border border-slate-200">
                  {product.nameAr}
                </p>
              </div>

              {!isArchived && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2 mt-3">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">سياسة حفظ السجلات التاريخية:</span> لن يتم حذف الصنف نهائياً. الصنف المؤرشف لن يظهر في قوائم المبيعات ونقاط البيع الجديدة، ولكن تظل بياناته وسجلاته محفوظة.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(product);
              onClose();
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors cursor-pointer ${
              isArchived
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {isArchived ? (
              <>
                <ArchiveRestore className="w-4 h-4" />
                <span>نعم، أعد التنشيط</span>
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                <span>نعم، قم بالأرشفة</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
