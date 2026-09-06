/**
 * Product Master Types - MODULE 01 (Corrected Relational Architecture)
 * 
 * تم تصميم هذا الملف ليعكس الكيانات المنفصلة المؤهلة للتحويل المباشر إلى جداول PostgreSQL:
 * 1. Product (الكيان الأساسي)
 * 2. ProductBarcode (1 : M باركود أساسي وبدائل)
 * 3. Category (تصنيفات هرمية متعددة المستويات Parent-Child)
 * 4. UnitOfMeasure (وحدات القياس ككيان مستقل)
 * 5. UomConversion (تمثيل مستقبلي لتحويلات الوحدات بدون تفعيل منطق المخزون الآن)
 */

export type ProductType = 'product' | 'service';
export type EntityStatus = 'active' | 'archived';

// ==========================================
// 1. UNIT OF MEASURE ENTITY (وحدة القياس المستقلة)
// ==========================================
export interface UnitOfMeasure {
  id: string;               // UUID / Primary Key
  nameAr: string;           // اسم الوحدة بالعربية (مثل: حبة، كرتون، كيلوجرام)
  nameEn?: string;          // اسم الوحدة بالإنجليزية (مثل: Piece, Carton, Kg)
  code: string;             // رمز الوحدة الفريد (مثل: PCS, CTN, KG, HR)
  status: EntityStatus;     // الحالة
  createdAt: string;
  updatedAt: string;
}

// Multi-UoM Future Support Definition (مخطط مستقبلي غير مفعل في المخزون حالياً)
export interface UomConversion {
  id: string;
  productId: string;
  fromUomId: string;
  toUomId: string;
  conversionFactor: number; // e.g. 1 Carton = 24 Pieces (factor = 24)
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 2. HIERARCHICAL CATEGORY ENTITY (التصنيف الهرمي)
// ==========================================
export interface Category {
  id: string;               // UUID / Primary Key
  nameAr: string;           // اسم التصنيف بالعربية
  nameEn?: string;          // اسم التصنيف بالإنجليزية
  parentId?: string | null; // معرف التصنيف الأب (null إذا كان رئيسياً)
  status: EntityStatus;     // الحالة
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 3. PRODUCT BARCODE ENTITY (باركود الصنف - علاقة 1 إلى متعدد)
// ==========================================
export interface ProductBarcode {
  id: string;               // UUID / Primary Key
  productId: string;        // Foreign Key -> products.id
  barcode: string;          // الباركود الفريد على مستوى النظام
  isPrimary: boolean;       // هل هو الباركود الأساسي؟ (أساسي واحد فقط لكل صنف)
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 4. PRODUCT ENTITY (بطاقة الصنف الماستر المصححة)
// ==========================================
export interface Product {
  id: string;               // UUID / Primary Key
  nameAr: string;           // اسم الصنف بالعربية - مطلوب
  nameEn?: string;          // اسم الصنف بالإنجليزية - اختياري
  sku: string;              // وحدة إدارة المخزون SKU - مطلوب وفريد
  categoryId: string;       // Foreign Key -> categories.id
  baseUomId: string;        // Foreign Key -> units_of_measure.id
  type: ProductType;        // نوع الصنف (product ملموس أو service خدمة)
  status: EntityStatus;     // الحالة (active نشط أو archived مؤرشف)
  description?: string;     // وصف الصنف - اختياري
  imageUrl?: string;        // رابط أو معاينة صورة الصنف - اختياري
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 5. HYDRATED VIEW / DTO FOR RUNTIME & UI
// ==========================================
// كائن العرض المكتمل بالعلاقات لواجهة المستخدم
export interface ProductHydrated extends Product {
  barcodes: ProductBarcode[];
  category?: Category;
  categoryPath?: string;    // المسار الهرمي كاملاً (مثال: مكملات غذائية > بروتين > Whey)
  baseUom?: UnitOfMeasure;
}

// مدخلات إنشاء وتحديث الصنف عبر الواجهة
export interface BarcodeInput {
  barcode: string;
  isPrimary: boolean;
}

export interface CreateProductFormInput {
  nameAr: string;
  nameEn?: string;
  sku: string;
  categoryId: string;
  baseUomId: string;
  type: ProductType;
  status: EntityStatus;
  description?: string;
  imageUrl?: string;
  barcodes: BarcodeInput[];  // قائمة الباركودات (أساسي + بدائل)
}

export interface ProductFilters {
  searchQuery: string;       // بحث بالاسم (عربي / إنجليزي) أو SKU أو أي باركود (أساسي أو بديل)
  categoryId: string;        // فلتر التصنيف الهرمي (الكل أو تصنيف محدد)
  type: 'all' | ProductType; // فلتر النوع
  status: 'all' | EntityStatus; // فلتر الحالة
  sortBy: 'nameAr' | 'sku' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export interface ValidationErrors {
  nameAr?: string;
  sku?: string;
  categoryId?: string;
  baseUomId?: string;
  barcodes?: string;
  barcodeItems?: Record<number, string>;
}
