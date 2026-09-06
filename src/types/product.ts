/**
 * Product Master Types - MODULE 01
 * 
 * كيانات السجل الرئيسي للأصناف (Master Data):
 * 1. Product (الصنف)
 * 2. ProductBarcode (الباركودات - علاقة 1 : M مع ثبات الـ IDs)
 * 3. Category (شجرة التصنيفات الهرمية Parent-Child)
 * 4. UnitOfMeasure (وحدة القياس المستقلة)
 * 5. UomConversion (نموذج تحويل الوحدات المستقبلي)
 */

export type ProductType = 'product' | 'service';
export type EntityStatus = 'active' | 'archived';

// ==========================================
// 1. UNIT OF MEASURE ENTITY (وحدة القياس)
// ==========================================
export interface UnitOfMeasure {
  id: string;
  nameAr: string;
  nameEn?: string;
  code: string;             // الرمز القياسي (مثل: PCS, CTN, KG)
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

// Multi-UoM Future Support Definition
export interface UomConversion {
  id: string;
  productId: string;
  fromUomId: string;
  toUomId: string;
  conversionFactor: number;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 2. HIERARCHICAL CATEGORY ENTITY (التصنيف الهرمي)
// ==========================================
export interface Category {
  id: string;
  nameAr: string;
  nameEn?: string;
  parentId?: string | null; // null للتصنيف الرئيسي، أو id التصنيف الأب
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 3. PRODUCT BARCODE ENTITY (باركود الصنف)
// ==========================================
export interface ProductBarcode {
  id: string;
  productId: string;
  barcode: string;
  isPrimary: boolean;       // صنف واحد يملك Primary Barcode واحد فقط
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 4. PRODUCT ENTITY (الصنف)
// ==========================================
export interface Product {
  id: string;
  nameAr: string;
  nameEn?: string;
  sku: string;
  categoryId: string;
  baseUomId: string;
  type: ProductType;
  status: EntityStatus;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 5. HYDRATED VIEW / DTO FOR UI
// ==========================================
export interface ProductHydrated extends Product {
  barcodes: ProductBarcode[];
  category?: Category;
  categoryPath?: string;
  baseUom?: UnitOfMeasure;
}

// مدخلات الباركود مع الحفاظ على المعرّف ID عند التعديل
export interface BarcodeInput {
  id?: string;              // معرف الباركود إن وجد مسبقاً لمنع إعادة الإنشاء العشوائي
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
  barcodes: BarcodeInput[];
}

export interface CreateCategoryInput {
  nameAr: string;
  nameEn?: string;
  parentId?: string | null;
}

export interface CreateUomInput {
  nameAr: string;
  nameEn?: string;
  code: string;
}

export interface ProductFilters {
  searchQuery: string;
  categoryId: string;        // 'all' أو معرف تصنيف محدد (يشمل كل التفرعات)
  type: 'all' | ProductType;
  status: 'all' | EntityStatus;
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
