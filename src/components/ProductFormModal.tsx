import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  AlertCircle, 
  Box, 
  Wrench, 
  Check, 
  Plus, 
  Trash2, 
  Barcode as BarcodeIcon,
  Layers,
  Tag
} from 'lucide-react';
import { 
  ProductHydrated, 
  CreateProductFormInput, 
  Category, 
  UnitOfMeasure, 
  ProductBarcode,
  BarcodeInput 
} from '../types/product';
import { buildCategoryPath } from '../data/mockProducts';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductFormInput) => void;
  productToEdit?: ProductHydrated | null;
  existingProducts: ProductHydrated[];
  categories: Category[];
  uoms: UnitOfMeasure[];
  allBarcodes: ProductBarcode[];
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
}) => {
  const isEditing = !!productToEdit;

  const [formData, setFormData] = useState<CreateProductFormInput>({
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

  const [errors, setErrors] = useState<{
    nameAr?: string;
    sku?: string;
    categoryId?: string;
    baseUomId?: string;
    barcodeItems?: Record<number, string>;
  }>({});

  useEffect(() => {
    if (productToEdit) {
      const editBarcodes: BarcodeInput[] = productToEdit.barcodes.length > 0
        ? productToEdit.barcodes.map((b) => ({ barcode: b.barcode, isPrimary: b.isPrimary }))
        : [{ barcode: '', isPrimary: true }];

      // Ensure at least one is primary
      if (!editBarcodes.some((b) => b.isPrimary)) {
        editBarcodes[0].isPrimary = true;
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

  // Saudi 628 Barcode Generator
  const generateRandomBarcode = (index: number) => {
    const randomNineDigits = Math.floor(100000000 + Math.random() * 900000000).toString();
    const generated = `628${randomNineDigits}1`;
    
    setFormData((prev) => {
      const nextBars = [...prev.barcodes];
      nextBars[index] = { ...nextBars[index], barcode: generated };
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

  // Suggested SKU Generator
  const generateSuggestedSKU = () => {
    const prefix = formData.type === 'service' ? 'SRV' : 'PRD';
    const cleanAr = formData.nameAr
      ? formData.nameAr.slice(0, 3).toUpperCase()
      : 'ITM';
    const rand = Math.floor(100 + Math.random() * 900);
    const generated = `${prefix}-${cleanAr}-${rand}`;
    setFormData((prev) => ({ ...prev, sku: generated }));
    if (errors.sku) {
      setErrors((prev) => ({ ...prev, sku: undefined }));
    }
  };

  // Add Alternative Barcode
  const handleAddAlternativeBarcode = () => {
    setFormData((prev) => ({
      ...prev,
      barcodes: [...prev.barcodes, { barcode: '', isPrimary: false }],
    }));
  };

  // Remove Alternative Barcode
  const handleRemoveBarcode = (index: number) => {
    if (formData.barcodes.length <= 1) return; // Keep at least one
    setFormData((prev) => {
      const nextBars = prev.barcodes.filter((_, i) => i !== index);
      // Ensure one primary remains
      if (!nextBars.some((b) => b.isPrimary) && nextBars.length > 0) {
        nextBars[0].isPrimary = true;
      }
      return { ...prev, barcodes: nextBars };
    });
  };

  // Change Barcode Value
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

  // Set Primary Barcode
  const handleSetPrimaryBarcode = (index: number) => {
    setFormData((prev) => {
      const nextBars = prev.barcodes.map((b, i) => ({
        ...b,
        isPrimary: i === index,
      }));
      return { ...prev, barcodes: nextBars };
    });
  };

  // Form Validation
  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    const itemErrors: Record<number, string> = {};

    // 1. Name Ar
    if (!formData.nameAr.trim()) {
      newErrors.nameAr = 'اسم الصنف بالعربية حقل إلزامي.';
    }

    // 2. SKU
    if (!formData.sku.trim()) {
      newErrors.sku = 'رمز SKU حقل إلزامي.';
    } else {
      const isDuplicateSku = existingProducts.some(
        (p) =>
          p.sku.trim().toLowerCase() === formData.sku.trim().toLowerCase() &&
          p.id !== productToEdit?.id
      );
      if (isDuplicateSku) {
        newErrors.sku = 'رمز الـ SKU مستخدم بالفعل لصنف آخر. يجب أن يكون فريداً على مستوى النظام.';
      }
    }

    // 3. Category & UoM
    if (!formData.categoryId) {
      newErrors.categoryId = 'يرجى اختيار تصنيف من شجرة التصنيفات.';
    }
    if (!formData.baseUomId) {
      newErrors.baseUomId = 'يرجى تحديد وحدة القياس الأساسية.';
    }

    // 4. Barcodes Validation (1:M & Uniqueness)
    const seenBarcodes = new Set<string>();
    const otherProductBarcodes = allBarcodes.filter(
      (b) => b.productId !== productToEdit?.id
    );

    formData.barcodes.forEach((bItem, idx) => {
      const code = bItem.barcode.trim();
      if (!code) {
        if (bItem.isPrimary) {
          itemErrors[idx] = 'الباركود الأساسي إلزامي.';
        } else {
          itemErrors[idx] = 'لا يمكن ترك حقل الباركود فارغاً (أدخل القيمة أو احذف السطر).';
        }
        return;
      }

      // Check duplicates within the same product form
      if (seenBarcodes.has(code)) {
        itemErrors[idx] = 'هذا الباركود مكرر ضمن نفس بطاقة الصنف.';
        return;
      }
      seenBarcodes.add(code);

      // Check system-wide uniqueness
      const existsInSystem = otherProductBarcodes.some(
        (ob) => ob.barcode.trim() === code
      );
      if (existsInSystem) {
        itemErrors[idx] = 'هذا الباركود مستخدم بالفعل ومسجل لصنف آخر في النظام.';
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isEditing ? 'تعديل بيانات الصنف (Product Master)' : 'إضافة صنف جديد إلى السجل الرئيسي'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              نموذج البيانات العلائقي: يدعم تعدد الباركودات، شجرة التصنيفات، ووحدات القياس المستقلة
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          
          {/* Engineering Boundary Notice */}
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold text-amber-950">قاعدة معمارية هامة:</strong> لا يتم إدخال أسعار البيع، أو تكاليف الشراء، أو الكميات والمخزون في بطاقة الصنف (Master). الصنف يمثل المعرّف الموحد، بينما الأسعار والكميات تتبع حركات الفواتير والمخزون اللاحقة.
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Arabic Name (Required) */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="input-name-ar" className="block text-xs font-bold text-slate-700">
                اسم الصنف بالعربية <span className="text-rose-600">*</span>
              </label>
              <input
                id="input-name-ar"
                type="text"
                value={formData.nameAr}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, nameAr: e.target.value }));
                  if (errors.nameAr) setErrors((prev) => ({ ...prev, nameAr: undefined }));
                }}
                placeholder="مثال: بروتين واي جولد ستاندرد 2 كجم / خدمة صيانة..."
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors ${
                  errors.nameAr ? 'border-rose-400 ring-1 ring-rose-300' : 'border-slate-200'
                }`}
              />
              {errors.nameAr && (
                <p className="text-xs text-rose-600 font-medium">{errors.nameAr}</p>
              )}
            </div>

            {/* English Name (Optional) */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="input-name-en" className="block text-xs font-medium text-slate-700">
                اسم الصنف بالإنجليزية (اختياري)
              </label>
              <input
                id="input-name-en"
                type="text"
                dir="ltr"
                value={formData.nameEn}
                onChange={(e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value }))}
                placeholder="e.g. Whey Protein Gold Standard 2KG..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-left transition-colors"
              />
            </div>

            {/* SKU (Required & Unique) */}
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label htmlFor="input-sku" className="block text-xs font-bold text-slate-700">
                  رمز SKU <span className="text-rose-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateSuggestedSKU}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>اقتراح رمز SKU</span>
                </button>
              </div>
              <input
                id="input-sku"
                type="text"
                dir="ltr"
                value={formData.sku}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, sku: e.target.value }));
                  if (errors.sku) setErrors((prev) => ({ ...prev, sku: undefined }));
                }}
                placeholder="e.g. SUP-WHEY-2KG"
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-left uppercase transition-colors ${
                  errors.sku ? 'border-rose-400 ring-1 ring-rose-300' : 'border-slate-200'
                }`}
              />
              {errors.sku && (
                <p className="text-xs text-rose-600 font-medium">{errors.sku}</p>
              )}
            </div>

            {/* MULTIPLE BARCODES SECTION (1 : M RELATION) */}
            <div className="space-y-3 sm:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <BarcodeIcon className="w-4 h-4 text-emerald-600" />
                    <span>الباركودات المسجلة للصنف (1:M Barcodes)</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    يمكن تسجيل باركود أساسي واحد وباركودات بديلة (شحنات مختلفة، موردين، أو عبوات كرتونية)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddAlternativeBarcode}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة باركود بديل</span>
                </button>
              </div>

              {/* Barcode Rows */}
              <div className="space-y-2.5">
                {formData.barcodes.map((bItem, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-2">
                      {/* Primary Toggle Indicator */}
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryBarcode(idx)}
                        className={`px-2.5 py-2 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer flex items-center gap-1 border ${
                          bItem.isPrimary
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                        title={bItem.isPrimary ? 'الباركود الأساسي الحالي' : 'اضغط لجعله الباركود الأساسي'}
                      >
                        {bItem.isPrimary && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>{bItem.isPrimary ? 'الأساسي (Primary)' : 'بديل (Alt)'}</span>
                      </button>

                      {/* Barcode Input */}
                      <div className="relative flex-1">
                        <input
                          type="text"
                          dir="ltr"
                          value={bItem.barcode}
                          onChange={(e) => handleBarcodeChange(idx, e.target.value)}
                          placeholder={bItem.isPrimary ? 'أدخل الباركود الأساسي (628...)' : 'أدخل باركود بديل...'}
                          className={`w-full px-3 py-2 bg-white border rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-left transition-colors ${
                            errors.barcodeItems?.[idx] ? 'border-rose-400 ring-1 ring-rose-300' : 'border-slate-200'
                          }`}
                        />
                      </div>

                      {/* Saudi Generator Button */}
                      <button
                        type="button"
                        onClick={() => generateRandomBarcode(idx)}
                        className="px-2.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium shrink-0 inline-flex items-center gap-1 transition-colors cursor-pointer"
                        title="توليد باركود سعودي قياسي 628"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span className="hidden sm:inline">توليد 628</span>
                      </button>

                      {/* Delete Button (Only for alternatives if more than 1 barcode) */}
                      {formData.barcodes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBarcode(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors shrink-0 cursor-pointer"
                          title="حذف هذا الباركود"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Inline Item Error */}
                    {errors.barcodeItems?.[idx] && (
                      <p className="text-xs text-rose-600 font-medium pr-2">
                        {errors.barcodeItems[idx]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Hierarchical Category (Required) */}
            <div className="space-y-1.5">
              <label htmlFor="input-category" className="flex items-center gap-1 text-xs font-bold text-slate-700">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span>التصنيف الهرمي (Category) <span className="text-rose-600">*</span></span>
              </label>
              <select
                id="input-category"
                value={formData.categoryId}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, categoryId: e.target.value }));
                  if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: undefined }));
                }}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white ${
                  errors.categoryId ? 'border-rose-400 ring-1 ring-rose-300' : 'border-slate-200'
                }`}
              >
                {categories.map((cat) => {
                  const path = buildCategoryPath(cat.id, categories);
                  return (
                    <option key={cat.id} value={cat.id}>
                      {path}
                    </option>
                  );
                })}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-rose-600 font-medium">{errors.categoryId}</p>
              )}
            </div>

            {/* Base Unit of Measure (Required) */}
            <div className="space-y-1.5">
              <label htmlFor="input-base-uom" className="flex items-center gap-1 text-xs font-bold text-slate-700">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>وحدة القياس الأساسية (Base UoM) <span className="text-rose-600">*</span></span>
              </label>
              <select
                id="input-base-uom"
                value={formData.baseUomId}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, baseUomId: e.target.value }));
                  if (errors.baseUomId) setErrors((prev) => ({ ...prev, baseUomId: undefined }));
                }}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white ${
                  errors.baseUomId ? 'border-rose-400 ring-1 ring-rose-300' : 'border-slate-200'
                }`}
              >
                {uoms.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nameAr} ({u.code}) {u.nameEn ? `- ${u.nameEn}` : ''}
                  </option>
                ))}
              </select>
              {errors.baseUomId && (
                <p className="text-xs text-rose-600 font-medium">{errors.baseUomId}</p>
              )}
            </div>

            {/* Type (Product vs Service) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                نوع الصنف <span className="text-rose-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: 'product' }))}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    formData.type === 'product'
                      ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-400/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Box className="w-4 h-4 text-blue-600" />
                  <span>منتج (ملموس)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: 'service' }))}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    formData.type === 'service'
                      ? 'bg-purple-50 border-purple-500 text-purple-800 ring-2 ring-purple-400/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Wrench className="w-4 h-4 text-purple-600" />
                  <span>خدمة (غير ملموس)</span>
                </button>
              </div>
            </div>

            {/* Status (Active vs Archived) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                الحالة التشغيلية <span className="text-rose-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, status: 'active' }))}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    formData.status === 'active'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-400/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>نشط (متاح)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, status: 'archived' }))}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    formData.status === 'archived'
                      ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-400/20'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>مؤرشف (محفوظ)</span>
                </button>
              </div>
            </div>

            {/* Image URL (Optional) */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="input-image" className="block text-xs font-medium text-slate-700">
                رابط صورة الصنف (اختياري)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="input-image"
                  type="url"
                  dir="ltr"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/item-image.jpg"
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-left transition-colors"
                />
                {formData.imageUrl && (
                  <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden shrink-0">
                    <img
                      src={formData.imageUrl}
                      alt="معاينة"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Description (Optional) */}
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="input-description" className="block text-xs font-medium text-slate-700">
                الوصف والملاحظات (اختياري)
              </label>
              <textarea
                id="input-description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="أدخل أي مواصفات أو تفاصيل إضافية للصنف..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
              />
            </div>

          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              id="btn-submit-product-form"
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-xs hover:shadow-sm transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'حفظ التعديلات' : 'إضافة الصنف'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
