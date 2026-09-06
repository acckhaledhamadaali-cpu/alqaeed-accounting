import React, { useState } from 'react';
import { X, Plus, Trash2, FolderTree, Check } from 'lucide-react';
import { Category, CreateCategoryInput } from '../types/product';
import { buildCategoryPath } from '../data/mockProducts';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (input: CreateCategoryInput) => void;
  onDeleteCategory?: (categoryId: string) => void;
  usedCategoryIds?: Set<string>;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
  usedCategoryIds = new Set(),
}) => {
  const [formData, setFormData] = useState<CreateCategoryInput>({
    nameAr: '',
    nameEn: '',
    parentId: null,
  });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr.trim()) {
      setError('اسم التصنيف بالعربية مطلوب.');
      return;
    }

    onAddCategory({
      nameAr: formData.nameAr.trim(),
      nameEn: formData.nameEn?.trim() || undefined,
      parentId: formData.parentId || null,
    });

    setFormData({
      nameAr: '',
      nameEn: '',
      parentId: null,
    });
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">إدارة شجرة التصنيفات (Categories)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              هيكلة التصنيفات الرئيسية والفرعية (Parent-Child)
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
          
          {/* Add Category Form */}
          <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="text-xs font-bold text-slate-800">إضافة تصنيف جديد</div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700">
                  اسم التصنيف (عربي) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, nameAr: e.target.value }));
                    if (error) setError(null);
                  }}
                  placeholder="مثال: إلكترونيات، هواتف، أجهزة لوحية..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  اسم التصنيف (إنجليزي)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={formData.nameEn || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value }))}
                  placeholder="e.g. Electronics, Mobiles..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 text-left"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700">
                  التصنيف الأب (Parent)
                </label>
                <select
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, parentId: e.target.value || null }))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800"
                >
                  <option value="">— تصنيف رئيسي (بدون أب) —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {buildCategoryPath(c.id, categories)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>حفظ التصنيف</span>
              </button>
            </div>
          </form>

          {/* Categories List or Professional Empty State */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>قائمة التصنيفات المسجلة</span>
              <span className="font-mono text-[11px] text-slate-500 font-normal">
                {categories.length} تصنيف
              </span>
            </div>

            {categories.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-8 text-center">
                <FolderTree className="w-8 h-8 text-slate-400 mx-auto mb-2 stroke-1" />
                <p className="text-sm font-semibold text-slate-700">لا توجد تصنيفات حتى الآن</p>
                <p className="text-xs text-slate-500 mt-1">
                  استخدم النموذج أعلاه لإضافة أول تصنيف رئيسي أو فرعي إلى شجرة التصنيفات.
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 text-xs">
                {categories.map((cat) => {
                  const fullPath = buildCategoryPath(cat.id, categories);
                  const isUsed = usedCategoryIds.has(cat.id);

                  return (
                    <div key={cat.id} className="p-3 bg-white flex items-center justify-between gap-2 hover:bg-slate-50">
                      <div>
                        <div className="font-semibold text-slate-900">{fullPath}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ID: {cat.id} {cat.parentId ? `| Parent: ${cat.parentId}` : '| تصنيف رئيسي'}
                        </div>
                      </div>
                      {onDeleteCategory && (
                        <button
                          type="button"
                          onClick={() => onDeleteCategory(cat.id)}
                          disabled={isUsed}
                          className={`p-1.5 rounded transition-colors ${
                            isUsed
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-rose-600 hover:bg-rose-50 cursor-pointer'
                          }`}
                          title={isUsed ? 'لا يمكن الحذف لأن هذا التصنيف مرتبط بمنتجات مسجلة' : 'حذف التصنيف'}
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
