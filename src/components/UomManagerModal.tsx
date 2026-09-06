import React, { useState } from 'react';
import { X, Plus, Trash2, Layers } from 'lucide-react';
import { UnitOfMeasure, CreateUomInput } from '../types/product';

interface UomManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  uoms: UnitOfMeasure[];
  onAddUom: (input: CreateUomInput) => void;
  onDeleteUom?: (uomId: string) => void;
  usedUomIds?: Set<string>;
}

export const UomManagerModal: React.FC<UomManagerModalProps> = ({
  isOpen,
  onClose,
  uoms,
  onAddUom,
  onDeleteUom,
  usedUomIds = new Set(),
}) => {
  const [formData, setFormData] = useState<CreateUomInput>({
    nameAr: '',
    nameEn: '',
    code: '',
  });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr.trim()) {
      setError('اسم وحدة القياس بالعربية مطلوب.');
      return;
    }
    if (!formData.code.trim()) {
      setError('رمز وحدة القياس (Code) مطلوب وفريد.');
      return;
    }

    const isDuplicateCode = uoms.some(
      (u) => u.code.trim().toUpperCase() === formData.code.trim().toUpperCase()
    );
    if (isDuplicateCode) {
      setError('رمز الوحدة (Code) مستخدم مسبقاً.');
      return;
    }

    onAddUom({
      nameAr: formData.nameAr.trim(),
      nameEn: formData.nameEn?.trim() || undefined,
      code: formData.code.trim().toUpperCase(),
    });

    setFormData({
      nameAr: '',
      nameEn: '',
      code: '',
    });
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">إدارة وحدات القياس (Units of Measure)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              تعريف الوحدات القياسية المرجعية للأصناف (Base UoM)
            </p>
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
        <div className="overflow-y-auto p-5 space-y-6 flex-1">
          
          {/* Add UoM Form */}
          <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="text-xs font-bold text-slate-800">إضافة وحدة قياس جديدة</div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  اسم الوحدة (عربي) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, nameAr: e.target.value }));
                    if (error) setError(null);
                  }}
                  placeholder="مثال: حبة، كرتون، كجم..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  الاسم (إنجليزي)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={formData.nameEn || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value }))}
                  placeholder="Piece, Carton..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 text-left"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  رمز الوحدة (Code) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={formData.code}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }));
                    if (error) setError(null);
                  }}
                  placeholder="PCS, CTN, KG"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 text-left uppercase"
                />
              </div>
            </div>

            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>حفظ الوحدة</span>
              </button>
            </div>
          </form>

          {/* UoMs List or Professional Empty State */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>قائمة وحدات القياس المسجلة</span>
              <span className="font-mono text-[11px] text-slate-500 font-normal">
                {uoms.length} وحدة
              </span>
            </div>

            {uoms.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2 stroke-1" />
                <p className="text-sm font-semibold text-slate-700">لا توجد وحدات قياس حتى الآن</p>
                <p className="text-xs text-slate-500 mt-1">
                  استخدم النموذج أعلاه لإضافة أول وحدة قياس (مثل: حبة PCS، كرتون CTN).
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 text-xs">
                {uoms.map((uom) => {
                  const isUsed = usedUomIds.has(uom.id);

                  return (
                    <div key={uom.id} className="p-3 bg-white flex items-center justify-between gap-2 hover:bg-slate-50">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-800 font-mono font-bold">
                          {uom.code}
                        </span>
                        <div>
                          <span className="font-semibold text-slate-900">{uom.nameAr}</span>
                          {uom.nameEn && (
                            <span className="text-slate-400 text-[11px] mr-1.5 font-sans">
                              ({uom.nameEn})
                            </span>
                          )}
                        </div>
                      </div>

                      {onDeleteUom && (
                        <button
                          type="button"
                          onClick={() => onDeleteUom(uom.id)}
                          disabled={isUsed}
                          className={`p-1.5 rounded transition-colors ${
                            isUsed
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-rose-600 hover:bg-rose-50 cursor-pointer'
                          }`}
                          title={isUsed ? 'لا يمكن الحذف لأن هذه الوحدة مستخدمة في أصناف مسجلة' : 'حذف وحدة القياس'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 flex justify-end bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md text-xs font-semibold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
