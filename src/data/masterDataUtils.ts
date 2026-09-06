import { Product, ProductBarcode, Category, UnitOfMeasure, ProductHydrated } from '../types/product';

/**
 * MODULE 01 — MASTER DATA UTILITIES & REPOSITORY CONSTANTS
 * 
 * Enterprise Master Data utilities for Product Master, Barcodes, Hierarchical Categories, and UoMs.
 * All collections default to pure empty state.
 */

export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_BARCODES: ProductBarcode[] = [];
export const INITIAL_CATEGORIES: Category[] = [];
export const INITIAL_UOMS: UnitOfMeasure[] = [];

/**
 * بناء مسار التصنيف الهرمي (مثال: أجهزة > هواتف > إكسسوارات)
 */
export function buildCategoryPath(categoryId: string, categories: Category[]): string {
  const catMap = new Map<string, Category>(categories.map((c) => [c.id, c]));
  const path: string[] = [];
  let current: Category | undefined = catMap.get(categoryId);
  const visited = new Set<string>();

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    path.unshift(current.nameAr);
    if (current.parentId) {
      current = catMap.get(current.parentId);
    } else {
      break;
    }
  }

  return path.length > 0 ? path.join(' / ') : '';
}

/**
 * استرجاع جميع معرفات التصنيفات التابعة هرمياً (بما في ذلك التصنيف نفسه وجميع الفروع والأحفاد)
 * لضمان أن فلتر التصنيف يشمل كامل الشجرة التابعة له
 */
export function getAllDescendantCategoryIds(categoryId: string, categories: Category[]): Set<string> {
  const descendants = new Set<string>();
  if (!categoryId) return descendants;

  descendants.add(categoryId);

  // بناء خريطة الأب إلى الأبناء
  const childrenMap = new Map<string, string[]>();
  for (const cat of categories) {
    if (cat.parentId) {
      const list = childrenMap.get(cat.parentId) || [];
      list.push(cat.id);
      childrenMap.set(cat.parentId, list);
    }
  }

  // تتبع هرمي بالـ BFS لجمع جميع التفرعات مهما كان عمق الشجرة
  const queue = [categoryId];
  while (queue.length > 0) {
    const parent = queue.shift()!;
    const children = childrenMap.get(parent) || [];
    for (const childId of children) {
      if (!descendants.has(childId)) {
        descendants.add(childId);
        queue.push(childId);
      }
    }
  }

  return descendants;
}

/**
 * دمج وتوحيد بيانات الصنف مع الباركودات والتصنيف الهرمي ووحدة القياس
 */
export function hydrateProducts(
  products: Product[],
  barcodes: ProductBarcode[],
  categories: Category[],
  uoms: UnitOfMeasure[]
): ProductHydrated[] {
  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));
  const uomMap = new Map<string, UnitOfMeasure>(uoms.map((u) => [u.id, u]));

  // تجميع الباركودات لكل صنف
  const barcodeMap = new Map<string, ProductBarcode[]>();
  for (const b of barcodes) {
    const list = barcodeMap.get(b.productId) || [];
    list.push(b);
    barcodeMap.set(b.productId, list);
  }

  return products.map((product) => {
    const prodBarcodes = barcodeMap.get(product.id) || [];
    const category = categoryMap.get(product.categoryId);
    const baseUom = uomMap.get(product.baseUomId);
    const categoryPath = buildCategoryPath(product.categoryId, categories);

    return {
      ...product,
      barcodes: prodBarcodes,
      category,
      categoryPath,
      baseUom,
    };
  });
}
