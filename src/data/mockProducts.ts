import { Product, ProductBarcode, Category, UnitOfMeasure, ProductHydrated } from '../types/product';

// ==========================================
// 1. UNITS OF MEASURE (وحدات القياس ككيانات مستقلة)
// ==========================================
export const MOCK_UOMS: UnitOfMeasure[] = [
  {
    id: 'uom-01',
    nameAr: 'حبة',
    nameEn: 'Piece',
    code: 'PCS',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'uom-02',
    nameAr: 'كرتون',
    nameEn: 'Carton',
    code: 'CTN',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'uom-03',
    nameAr: 'علبة / عبوة',
    nameEn: 'Pack',
    code: 'PCK',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'uom-04',
    nameAr: 'كيلوجرام',
    nameEn: 'Kilogram',
    code: 'KG',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'uom-05',
    nameAr: 'جرام',
    nameEn: 'Gram',
    code: 'GRM',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'uom-06',
    nameAr: 'لتر',
    nameEn: 'Liter',
    code: 'LTR',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'uom-07',
    nameAr: 'ساعة عمل',
    nameEn: 'Hour',
    code: 'HRS',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'uom-08',
    nameAr: 'خدمة / معاملة',
    nameEn: 'Service',
    code: 'SRV',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

// ==========================================
// 2. HIERARCHICAL CATEGORIES (تصنيفات هرمية متعددة المستويات)
// ==========================================
export const MOCK_CATEGORIES: Category[] = [
  // مستوى رئيسي: مكملات غذائية وصحة
  {
    id: 'cat-supplements',
    nameAr: 'مكملات غذائية',
    nameEn: 'Supplements',
    parentId: null,
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  // مستوى فرعي أول: بروتين
  {
    id: 'cat-protein',
    nameAr: 'بروتين',
    nameEn: 'Protein',
    parentId: 'cat-supplements',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  // مستوى فرعي ثاني: Whey Protein
  {
    id: 'cat-whey',
    nameAr: 'واي بروتين (Whey)',
    nameEn: 'Whey Protein',
    parentId: 'cat-protein',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  // مستوى فرعي أول: كرياتين
  {
    id: 'cat-creatine',
    nameAr: 'كرياتين وأحماض',
    nameEn: 'Creatine & Amino',
    parentId: 'cat-supplements',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },

  // مستوى رئيسي: أغذية ومشروبات
  {
    id: 'cat-food-beverage',
    nameAr: 'أغذية ومشروبات',
    nameEn: 'Food & Beverages',
    parentId: null,
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  // مستوى فرعي: ألبان وأجبان
  {
    id: 'cat-dairy',
    nameAr: 'ألبان طازجة',
    nameEn: 'Dairy & Milk',
    parentId: 'cat-food-beverage',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  // مستوى فرعي: مياه ومشروبات
  {
    id: 'cat-beverages',
    nameAr: 'مياه وعصائر',
    nameEn: 'Water & Drinks',
    parentId: 'cat-food-beverage',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  // مستوى فرعي: قهوة وتوابل
  {
    id: 'cat-coffee',
    nameAr: 'بن وقهوة مختصة',
    nameEn: 'Coffee Beans',
    parentId: 'cat-food-beverage',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },

  // مستوى رئيسي: تقنية وأجهزة نقاط البيع
  {
    id: 'cat-tech',
    nameAr: 'أجهزة وتقنية نقاط البيع',
    nameEn: 'Hardware & POS',
    parentId: null,
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  // مستوى فرعي: قارئات وطابعات
  {
    id: 'cat-pos-hardware',
    nameAr: 'قارئات باركود وطابعات',
    nameEn: 'Scanners & Printers',
    parentId: 'cat-tech',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  // مستوى فرعي: مستلزمات ورقية
  {
    id: 'cat-pos-supplies',
    nameAr: 'أوراق ومستلزمات كاشير',
    nameEn: 'Receipt Rolls & Paper',
    parentId: 'cat-tech',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },

  // مستوى رئيسي: خدمات مهنية ودعم
  {
    id: 'cat-services',
    nameAr: 'خدمات مهنية ودعم فني',
    nameEn: 'Professional Services & Support',
    parentId: null,
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  // مستوى فرعي: صيانة أجهزة
  {
    id: 'cat-maintenance',
    nameAr: 'صيانة دورية وزيارات ميدانية',
    nameEn: 'On-site Maintenance',
    parentId: 'cat-services',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  // مستوى فرعي: استشارات وتهيئة
  {
    id: 'cat-consulting',
    nameAr: 'استشارات وتهيئة سحابية',
    nameEn: 'Consulting & Setup',
    parentId: 'cat-services',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

// ==========================================
// 3. PRODUCTS (الأصناف الأساسية - بدون باركود مدمج، مع روابط FK)
// ==========================================
export const INITIAL_MOCK_PRODUCTS: Product[] = [
  {
    id: 'P001',
    nameAr: 'بروتين واي جولد ستاندرد 2 كجم',
    nameEn: 'Whey Protein Gold Standard 2KG',
    sku: 'SUP-WHEY-2KG',
    categoryId: 'cat-whey',
    baseUomId: 'uom-03', // علبة / عبوة
    type: 'product',
    status: 'active',
    description: 'مكمل بروتين نقي 100% واي غني بالأحماض الأمينية سريعة الامتصاص بنكهة الشوكولاتة الغنية.',
    imageUrl: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-01-05T10:00:00.000Z',
    updatedAt: '2026-02-20T11:00:00.000Z',
  },
  {
    id: 'P002',
    nameAr: 'حليب المراعي كامل الدسم 1 لتر',
    nameEn: 'Almarai Full Cream Milk 1L',
    sku: 'ALM-MILK-1L',
    categoryId: 'cat-dairy',
    baseUomId: 'uom-01', // حبة
    type: 'product',
    status: 'active',
    description: 'حليب طازج مبستر كامل الدسم غني بالكالسيوم والفيتامينات الطبيعية.',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-01-10T08:30:00.000Z',
    updatedAt: '2026-02-15T10:15:00.000Z',
  },
  {
    id: 'P003',
    nameAr: 'بن قهوة هرري درجة أولى 500 جم',
    nameEn: 'Harari Coffee Beans Grade A 500g',
    sku: 'COF-HAR-500G',
    categoryId: 'cat-coffee',
    baseUomId: 'uom-03', // علبة
    type: 'product',
    status: 'active',
    description: 'حبوب بن هرري خولاني مختارة بعناية ومحمصة بطريقة تقليدية سعودية.',
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-01-12T09:00:00.000Z',
    updatedAt: '2026-02-18T14:20:00.000Z',
  },
  {
    id: 'P004',
    nameAr: 'مياه نوفا صحية 330 مل (كرتون 40 قارورة)',
    nameEn: 'Nova Water 330ml Carton (40 Bottles)',
    sku: 'WAT-NOV-330-40',
    categoryId: 'cat-beverages',
    baseUomId: 'uom-02', // كرتون
    type: 'product',
    status: 'active',
    description: 'مياه شرب معبأة نقية من ينابيع طبيعية، عبوة كرتون اقتصادية للمنازل والمكاتب.',
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-01-15T11:45:00.000Z',
    updatedAt: '2026-01-15T11:45:00.000Z',
  },
  {
    id: 'P005',
    nameAr: 'قارئ باركود ليزري لاسلكي ثنائي الأبعاد 2D',
    nameEn: '2D Wireless Laser Barcode Scanner',
    sku: 'POS-SCN-2D-WL',
    categoryId: 'cat-pos-hardware',
    baseUomId: 'uom-01', // حبة
    type: 'product',
    status: 'active',
    description: 'ماسح باركود عالي السرعة متوافق مع كافة أنظمة نقاط البيع وشاشات الجوال وكاميرات المسح.',
    imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-01-18T14:10:00.000Z',
    updatedAt: '2026-02-20T09:30:00.000Z',
  },
  {
    id: 'P006',
    nameAr: 'خدمة صيانة دورية لنقاط البيع والأجهزة',
    nameEn: 'Periodic POS & Hardware Maintenance Service',
    sku: 'SRV-POS-MAINT-HR',
    categoryId: 'cat-maintenance',
    baseUomId: 'uom-07', // ساعة عمل
    type: 'service',
    status: 'active',
    description: 'خدمة فحص وتنظيف وتحديث أجهزة الكاشير والطابعات في موقع العميل بواسطة فني معتمد.',
    createdAt: '2026-01-20T16:00:00.000Z',
    updatedAt: '2026-02-01T12:00:00.000Z',
  },
  {
    id: 'P007',
    nameAr: 'خدمة تهيئة وإعداد النظام السحابي',
    nameEn: 'Cloud System Setup & Onboarding Service',
    sku: 'SRV-SYS-SETUP',
    categoryId: 'cat-consulting',
    baseUomId: 'uom-08', // خدمة / معاملة
    type: 'service',
    status: 'active',
    description: 'إعداد قاعدة البيانات الأولية، وهيكلة شجرة الحسابات، وتدريب المشرفين وتخصيص قوالب الفواتير.',
    createdAt: '2026-01-22T10:00:00.000Z',
    updatedAt: '2026-01-22T10:00:00.000Z',
  },
  {
    id: 'P008',
    nameAr: 'ورق حراري لطابعات الإيصالات 80×70 مم (شدة 10 رول)',
    nameEn: 'Thermal Receipt Paper Rolls 80x70mm (Pack of 10)',
    sku: 'PPR-THM-8070',
    categoryId: 'cat-pos-supplies',
    baseUomId: 'uom-03', // علبة
    type: 'product',
    status: 'active',
    description: 'لفات ورق حراري عالية الجودة والنقاء متوافقة مع جميع طابعات فواتير الكاشير المعتمدة.',
    imageUrl: 'https://images.unsplash.com/photo-1589330694653-dad6d3240a2b?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-01-25T13:20:00.000Z',
    updatedAt: '2026-02-10T11:00:00.000Z',
  },
  {
    id: 'P009',
    nameAr: 'كرياتين مونوهيدرات نقي 300 جم (طراز قديم)',
    nameEn: 'Creatine Monohydrate Pure 300g (Old Package)',
    sku: 'SUP-CRE-300G-OLD',
    categoryId: 'cat-creatine',
    baseUomId: 'uom-03', // علبة
    type: 'product',
    status: 'archived',
    description: 'تمت أرشفة هذا الطراز لاستبداله بالعبوة المطورة 400 جم. تظل بياناته التاريخية محفوظة.',
    imageUrl: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=400&q=80',
    createdAt: '2025-11-01T10:00:00.000Z',
    updatedAt: '2026-01-05T14:30:00.000Z',
  },
];

// ==========================================
// 4. PRODUCT BARCODES (علاقة 1 إلى متعدد 1:M مع تفرد تام)
// ==========================================
export const INITIAL_MOCK_BARCODES: ProductBarcode[] = [
  // P001: منتج يحتوي على أكثر من باركود (الباركود الأساسي + 2 باركود بديل للمورّد)
  {
    id: 'bar-001-prim',
    productId: 'P001',
    barcode: '6281234567890',
    isPrimary: true,
    createdAt: '2026-01-05T10:00:00.000Z',
    updatedAt: '2026-01-05T10:00:00.000Z',
  },
  {
    id: 'bar-001-alt1',
    productId: 'P001',
    barcode: '1234567890123',
    isPrimary: false,
    createdAt: '2026-01-05T10:05:00.000Z',
    updatedAt: '2026-01-05T10:05:00.000Z',
  },
  {
    id: 'bar-001-alt2',
    productId: 'P001',
    barcode: '6289876543210',
    isPrimary: false,
    createdAt: '2026-01-10T12:00:00.000Z',
    updatedAt: '2026-01-10T12:00:00.000Z',
  },

  // P002: حليب المراعي (باركود أساسي + باركود بديل للشحنة المستوردة)
  {
    id: 'bar-002-prim',
    productId: 'P002',
    barcode: '6281007010014',
    isPrimary: true,
    createdAt: '2026-01-10T08:30:00.000Z',
    updatedAt: '2026-01-10T08:30:00.000Z',
  },
  {
    id: 'bar-002-alt1',
    productId: 'P002',
    barcode: '6281007010099',
    isPrimary: false,
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-01-15T09:00:00.000Z',
  },

  // P003: قهوة هرري (باركود أساسي)
  {
    id: 'bar-003-prim',
    productId: 'P003',
    barcode: '6281007020020',
    isPrimary: true,
    createdAt: '2026-01-12T09:00:00.000Z',
    updatedAt: '2026-01-12T09:00:00.000Z',
  },

  // P004: كرتون مياه نوفا (باركود أساسي + باركود كرتوني بديل)
  {
    id: 'bar-004-prim',
    productId: 'P004',
    barcode: '6281007030037',
    isPrimary: true,
    createdAt: '2026-01-15T11:45:00.000Z',
    updatedAt: '2026-01-15T11:45:00.000Z',
  },
  {
    id: 'bar-004-alt1',
    productId: 'P004',
    barcode: '6281007030044',
    isPrimary: false,
    createdAt: '2026-01-20T14:30:00.000Z',
    updatedAt: '2026-01-20T14:30:00.000Z',
  },

  // P005: قارئ باركود ليزري
  {
    id: 'bar-005-prim',
    productId: 'P005',
    barcode: '6281007040044',
    isPrimary: true,
    createdAt: '2026-01-18T14:10:00.000Z',
    updatedAt: '2026-01-18T14:10:00.000Z',
  },

  // P006: خدمة صيانة دورية
  {
    id: 'bar-006-prim',
    productId: 'P006',
    barcode: '6289001050051',
    isPrimary: true,
    createdAt: '2026-01-20T16:00:00.000Z',
    updatedAt: '2026-01-20T16:00:00.000Z',
  },

  // P007: خدمة تهيئة سحابية
  {
    id: 'bar-007-prim',
    productId: 'P007',
    barcode: '6289001060068',
    isPrimary: true,
    createdAt: '2026-01-22T10:00:00.000Z',
    updatedAt: '2026-01-22T10:00:00.000Z',
  },

  // P008: ورق حراري
  {
    id: 'bar-008-prim',
    productId: 'P008',
    barcode: '6281007070075',
    isPrimary: true,
    createdAt: '2026-01-25T13:20:00.000Z',
    updatedAt: '2026-01-25T13:20:00.000Z',
  },

  // P009: كرياتين مؤرشف
  {
    id: 'bar-009-prim',
    productId: 'P009',
    barcode: '6281007090099',
    isPrimary: true,
    createdAt: '2025-11-01T10:00:00.000Z',
    updatedAt: '2026-01-05T14:30:00.000Z',
  },
];

// ==========================================
// 5. HELPER UTILITIES (دوال الربط والتجميع للواجهة)
// ==========================================

/**
 * دالة لبناء المسار الهرمي للتصنيف (مثل: مكملات غذائية > بروتين > واي بروتين)
 */
export function buildCategoryPath(categoryId: string, categories: Category[]): string {
  const catMap = new Map<string, Category>(categories.map((c) => [c.id, c]));
  const pathParts: string[] = [];

  let current: Category | undefined = catMap.get(categoryId);
  let depth = 0;
  while (current && depth < 10) {
    pathParts.unshift(current.nameAr);
    if (!current.parentId) break;
    current = catMap.get(current.parentId);
    depth++;
  }

  return pathParts.join(' > ') || 'غير مصنف';
}

/**
 * دالة هيدرة الأصناف لدمج الباركودات والتصنيف الهرمي ووحدات القياس في كائن العرض الموحد
 */
export function hydrateProducts(
  products: Product[],
  barcodes: ProductBarcode[],
  categories: Category[],
  uoms: UnitOfMeasure[]
): ProductHydrated[] {
  const catMap = new Map<string, Category>(categories.map((c) => [c.id, c]));
  const uomMap = new Map<string, UnitOfMeasure>(uoms.map((u) => [u.id, u]));

  // تجميع الباركودات لكل صنف
  const barcodeMap = new Map<string, ProductBarcode[]>();
  for (const bar of barcodes) {
    const list = barcodeMap.get(bar.productId) || [];
    list.push(bar);
    barcodeMap.set(bar.productId, list);
  }

  return products.map((product) => {
    const productBars = barcodeMap.get(product.id) || [];
    // التأكد من ترتيب الأساسي أولاً
    productBars.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

    const category = catMap.get(product.categoryId);
    const categoryPath = buildCategoryPath(product.categoryId, categories);
    const baseUom = uomMap.get(product.baseUomId);

    return {
      ...product,
      barcodes: productBars,
      category,
      categoryPath,
      baseUom,
    };
  });
}
