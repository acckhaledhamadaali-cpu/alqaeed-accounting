import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { 
  ProductHydrated, 
  CreateProductFormInput, 
  Category, 
  UnitOfMeasure, 
  ProductBarcode,
  BarcodeInput 
} from '../types/product';
import { buildCategoryPath } from '../data/masterDataUtils';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductFormInput) => void;
  productToEdit?: ProductHydrated | null;
  existingProducts: ProductHydrated[];
  categories: Category[];
  uoms: UnitOfMeasure[];
  allBarcodes: ProductBarcode[];
  onOpenCategoryManager: () => void;
  onOpenUomManager: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  productToEdit,
  existingProducts,
  categories,
  uoms,
  allBarcodes,
  onOpenCategoryManager,
  onOpenUomManager,
}) => {
  const isEditing = !!productToEdit;

  const [formData, setFormData] = useState<CreateProductFormInput>({
    nameAr: '',
    nameEn: '',
    sku: '',
    categoryId: '',
    baseUomId: '',
    type: 'product',
    status: 'active',
    description: '',
    imageUrl: '',
    barcodes: [{ barcode: '', isPrimary: true }],
  });

  const [errors, setErrors] = useState<{
    nameAr?: string;
    sku?: string;
    categoryId?: string;
    baseUomId?: string;
    barcodesGeneral?: string;
    barcodeItems?: Record<number, string>;
  }>({});

  useEffect(() => {
    if (productToEdit) {
      // PRESERVE EXISTING BARCODE IDs
      const editBarcodes: BarcodeInput[] = productToEdit.barcodes.length > 0
        ? productToEdit.barcodes.map((b) => ({
            id: b.id, // Preserved exact existing ID!
            barcode: b.barcode,
            isPrimary: b.isPrimary,
          }))
        : [{ barcode: '', isPrimary: true }];

      // Ensure exactly 1 is primary
      const primaryCount = editBarcodes.filter((b) => b.isPrimary).length;
      if (primaryCount !== 1 && editBarcodes.length > 0) {
        editBarcodes.forEach((b, idx) => {
          b.isPrimary = idx === 0;
        });
      }

      setFormData({
        nameAr: productToEdit.nameAr,
        nameEn: productToEdit.nameEn || '',
        sku: productToEdit.sku,
        categoryId: productToEdit.categoryId,
        baseUomId: productToEdit.baseUomId,
        type: productToEdit.type,
        status: productToEdit.status,
        description: productToEdit.description || '',
        imageUrl: productToEdit.imageUrl || '',
        barcodes: editBarcodes,
      });
    } else {
      setFormData({
        nameAr: '',
        nameEn: '',
        sku: '',
        categoryId: categories[0]?.id || '',
        baseUomId: uoms[0]?.id || '',
        type: 'product',
        status: 'active',
        description: '',
        imageUrl: '',
        barcodes: [{ barcode: '', isPrimary: true }],
      });
    }
    setErrors({});
  }, [productToEdit, isOpen, categories, uoms]);

  if (!isOpen) return null;

  // Add Alternative Barcode row (id is undefined for new barcodes)
  const handleAddAlternativeBarcode = () => {
    setFormData((prev) => ({
      ...prev,
      barcodes: [...prev.barcodes, { barcode: '', isPrimary: false }],
    }));
  };

  // Remove Barcode row (only removes the specific row)
  const handleRemoveBarcode = (index: number) => {
    if (formData.barcodes.length <= 1) return;

    setFormData((prev) => {
      const isRemovingPrimary = prev.barcodes[index]?.isPrimary;
      const nextBars = prev.barcodes.filter((_, i) => i !== index);

      // If we removed the primary barcode, designate the first remaining as primary
      if (isRemovingPrimary && nextBars.length > 0) {
        nextBars[0].isPrimary = true;
      }

      return { ...prev, barcodes: nextBars };
    });
  };

  // Change Barcode text (keeps the existing id intact!)
  const handleBarcodeChange = (index: number, val: string) => {
    setFormData((prev) => {
      const nextBars = [...prev.barcodes];
      nextBars[index] = { ...nextBars[index], barcode: val };
      return { ...prev, barcodes: nextBars };
    });

    if (errors.barcodeItems?.[index]) {
      setErrors((prev) => {
        const nextItems = { ...prev.barcodeItems };
        delete nextItems[index];
        return { ...prev, barcodeItems: nextItems };
      });
    }
  };

  // Radio selection: Exactly ONE primary barcode
  const handleSetPrimaryBarcode = (index: number) => {
    setFormData((prev) => {
      const nextBars = prev.barcodes.map((b, i) => ({
        ...b,
        isPrimary: i === index, // Automatically unsets all others!
      }));
      return { ...prev, barcodes: nextBars };
    });

    if (errors.barcodesGeneral) {
      setErrors((prev) => ({ ...prev, barcodesGeneral: undefined }));
    }
  };

  // Strict Validation
  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    const itemErrors: Record<number, string> = {};

    // 1. Name Ar
    if (!formData.nameAr.trim()) {
      newErrors.nameAr = 'اسم الصنف بالعربية إلزامي.';
    }

    // 2. SKU
    if (!formData.sku.trim()) {
      newErrors.sku = 'رمز SKU إلزامي.';
    } else {
      const isDuplicateSku = existingProducts.some(
        (p) =>
          p.sku.trim().toLowerCase() === formData.sku.trim().toLowerCase() &&
          p.id !== productToEdit?.id
      );
      if (isDuplicateSku) {
        newErrors.sku = 'رمز SKU مستخدم لصنف آخر. يجب أن يكون فريداً.';
      }
    }

    // 3. Category & UoM
    if (!formData.categoryId) {
      newErrors.categoryId = 'يرجى اختيار التصنيف التابع له الصنف.';
    }
    if (!formData.baseUomId) {
      newErrors.baseUomId = 'يرجى اختيار وحدة القياس الأساسية.';
    }

    // 4. Primary Barcode & Uniqueness Rules
    const primaryCount = formData.barcodes.filter((b) => b.isPrimary).length;
    if (primaryCount !== 1) {
      newErrors.barcodesGeneral = 'يجب تحديد باركود أساسي واحد فقط للصنف.';
    }

    const seenBarcodesInForm = new Set<string>();
    // Barcodes belonging to other products in system
    const otherProductBarcodes = allBarcodes.filter(
      (b) => b.productId !== productToEdit?.id
    );

    formData.barcodes.forEach((bItem, idx) => {
      const code = bItem.barcode.trim();
      if (!code) {
        if (bItem.isPrimary) {
          itemErrors[idx] = 'قيمة الباركود الأساسي مطلوبة.';
        } else {
          itemErrors[idx] = 'يرجى إدخال قيمة الباركود أو حذف هذا السطر.';
        }
        return;
      }

      // Check duplicates within the same product form
      if (seenBarcodesInForm.has(code)) {
        itemErrors[idx] = 'هذا الباركود مكرر في نفس بطاقة الصنف.';
        return;
      }
      seenBarcodesInForm.add(code);

      // Check system-wide uniqueness across other products
      const existsInSystem = otherProductBarcodes.some(
        (ob) => ob.barcode.trim() === code
      );
      if (existsInSystem) {
        itemErrors[idx] = 'هذا الباركود مسجل لصنف آخر في النظام.';
      }
    });

    if (Object.keys(itemErrors).length > 0) {
      newErrors.barcodeItems = itemErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isEditing ? 'تعديل بيانات الصنف' : 'إضافة صنف جديد إلى سجل الماستر'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              بطاقة تعريف الصنف (Product Master Data)
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 flex-1 text-xs sm:text-sm">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Arabic Name (Required) */}
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="input-name-ar" className="block text-xs font-semibold text-slate-700">
                اسم الصنف (عربي) <span className="text-rose-600">*</span>
              </label>
              <input
                id="input-name-ar"
                type="text"
                value={formData.nameAr}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, nameAr: e.target.value }));
                  if (errors.nameAr) setErrors((prev) => ({ ...prev, nameAr: undefined }));
                }}
                placeholder="أدخل الاسم بالعربية..."
                className={`w-full px-3 py-2 bg-white border rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 ${
                  errors.nameAr ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {errors.nameAr && (
                <p className="text-xs text-rose-600">{errors.nameAr}</p>
              )}
            </div>

            {/* English Name (Optional) */}
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="input-name-en" className="block text-xs font-semibold text-slate-700">
                اسم الصنف (إنجليزي)
              </label>
              <input
                id="input-name-en"
                type="text"
                dir="ltr"
                value={formData.nameEn}
                onChange={(e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value }))}
                placeholder="Enter English Name (optional)..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 text-left"
              />
            </div>

            {/* SKU (Required) */}
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="input-sku" className="block text-xs font-semibold text-slate-700">
                رمز SKU <span className="text-rose-600">*</span>
              </label>
              <input
                id="input-sku"
                type="text"
                dir="ltr"
                value={formData.sku}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, sku: e.target.value.toUpperCase() }));
                  if (errors.sku) setErrors((prev) => ({ ...prev, sku: undefined }));
                }}
                placeholder="مثال: PRD-001"
                className={`w-full px-3 py-2 bg-white border rounded-md font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 text-left uppercase ${
                  errors.sku ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {errors.sku && (
                <p className="text-xs text-rose-600">{errors.sku}</p>
              )}
            </div>

            {/* MULTIPLE BARCODES SECTION */}
            <div className="space-y-2.5 sm:col-span-2 bg-slate-50 border border-slate-200 rounded-lg p-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    الباركودات المسجلة للصنف (1:M Barcodes)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    يجب تحديد باركود أساسي واحد فقط، مع إمكانية إضافة باركودات بديلة.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddAlternativeBarcode}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded border border-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة باركود بديل</span>
                </button>
              </div>

              {errors.barcodesGeneral && (
                <p className="text-xs text-rose-600 font-medium">{errors.barcodesGeneral}</p>
              )}

              {/* Barcode Rows */}
              <div className="space-y-2">
                {formData.barcodes.map((bItem, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-2">
                      {/* Primary Radio Selector */}
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryBarcode(idx)}
                        className={`px-2.5 py-1.5 rounded text-xs font-semibold shrink-0 transition-colors cursor-pointer flex items-center gap-1 border ${
                          bItem.isPrimary
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                        }`}
                        title={bItem.isPrimary ? 'الباركود الأساسي' : 'تعيين كباركود أساسي'}
                      >
                        {bItem.isPrimary && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>{bItem.isPrimary ? 'الأساسي' : 'بديل'}</span>
                      </button>

                      {/* Barcode Input Field */}
                      <input
                        type="text"
                        dir="ltr"
                        value={bItem.barcode}
                        onChange={(e) => handleBarcodeChange(idx, e.target.value)}
                        placeholder={bItem.isPrimary ? 'أدخل الباركود الأساسي...' : 'أدخل باركود بديل...'}
                        className={`flex-1 px-3 py-1.5 bg-white border rounded text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 text-left ${
                          errors.barcodeItems?.[idx] ? 'border-rose-400' : 'border-slate-300'
                        }`}
                      />

                      {/* Persistent ID Badge (if existing) */}
                      {bItem.id && (
                        <span className="hidden sm:inline font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-1 rounded border border-slate-200">
                          {bItem.id}
                        </span>
                      )}

                      {/* Delete button if >1 barcodes */}
                      {formData.barcodes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBarcode(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="حذف هذا الباركود"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {errors.barcodeItems?.[idx] && (
                      <p className="text-xs text-rose-600 pr-1">{errors.barcodeItems[idx]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Hierarchical Category (Required) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="input-category" className="block text-xs font-semibold text-slate-700">
                  التصنيف الهرمي <span className="text-rose-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={onOpenCategoryManager}
                  className="text-[11px] text-slate-600 hover:text-slate-900 underline cursor-pointer"
                >
                  + تصنيف جديد
                </button>
              </div>
              <select
                id="input-category"
                value={formData.categoryId}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, categoryId: e.target.value }));
                  if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: undefined }));
                }}
                className={`w-full px-3 py-2 bg-white border rounded-md text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 ${
                  errors.categoryId ? 'border-rose-400' : 'border-slate-300'
                }`}
              >
                <option value="">— اختر التصنيف —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {buildCategoryPath(cat.id, categories)}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-rose-600">{errors.categoryId}</p>
              )}
            </div>

            {/* Base Unit of Measure (Required) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="input-base-uom" className="block text-xs font-semibold text-slate-700">
                  وحدة القياس الأساسية <span className="text-rose-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={onOpenUomManager}
                  className="text-[11px] text-slate-600 hover:text-slate-900 underline cursor-pointer"
                >
                  + وحدة قياس جديدة
                </button>
              </div>
              <select
                id="input-base-uom"
                value={formData.baseUomId}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, baseUomId: e.target.value }));
                  if (errors.baseUomId) setErrors((prev) => ({ ...prev, baseUomId: undefined }));
                }}
                className={`w-full px-3 py-2 bg-white border rounded-md text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 ${
                  errors.baseUomId ? 'border-rose-400' : 'border-slate-300'
                }`}
              >
                <option value="">— اختر وحدة القياس —</option>
                {uoms.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nameAr} ({u.code})
                  </option>
                ))}
              </select>
              {errors.baseUomId && (
                <p className="text-xs text-rose-600">{errors.baseUomId}</p>
              )}
            </div>

            {/* Product Type */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                نوع الصنف <span className="text-rose-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: 'product' }))}
                  className={`py-2 px-3 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${
                    formData.type === 'product'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  منتج (ملموس)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: 'service' }))}
                  className={`py-2 px-3 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${
                    formData.type === 'service'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  خدمة (غير ملموس)
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                الحالة التشغيلية <span className="text-rose-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, status: 'active' }))}
                  className={`py-2 px-3 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${
                    formData.status === 'active'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  نشط
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, status: 'archived' }))}
                  className={`py-2 px-3 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${
                    formData.status === 'archived'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  مؤرشف
                </button>
              </div>
            </div>

            {/* Description (Optional) */}
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="input-description" className="block text-xs font-semibold text-slate-700">
                الوصف والملاحظات (اختياري)
              </label>
              <textarea
                id="input-description"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="أدخل أي ملاحظات فنية أو مواصفات للصنف..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 resize-none"
              />
            </div>

          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-semibold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              id="btn-submit-product-form"
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
            >
              {isEditing ? 'حفظ التعديلات' : 'إضافة الصنف'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
