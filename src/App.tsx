import React, { useState, useMemo } from 'react';
import { 
  Product, 
  ProductBarcode, 
  Category, 
  UnitOfMeasure, 
  ProductHydrated, 
  ProductFilters, 
  CreateProductFormInput,
  CreateCategoryInput,
  CreateUomInput
} from './types/product';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_BARCODES, 
  INITIAL_CATEGORIES, 
  INITIAL_UOMS, 
  hydrateProducts,
  getAllDescendantCategoryIds
} from './data/masterDataUtils';
import { Header } from './components/Header';
import { ProductFiltersComponent } from './components/ProductFilters';
import { ProductList } from './components/ProductList';
import { ProductFormModal } from './components/ProductFormModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ArchiveConfirmModal } from './components/ArchiveConfirmModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { UomManagerModal } from './components/UomManagerModal';
import { Check } from 'lucide-react';

export default function App() {
  // Pure Empty Enterprise Master Data State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [barcodes, setBarcodes] = useState<ProductBarcode[]>(INITIAL_BARCODES);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [uoms, setUoms] = useState<UnitOfMeasure[]>(INITIAL_UOMS);

  // Hydrated Products (Joined relational view for UI)
  const hydratedProducts = useMemo(() => {
    return hydrateProducts(products, barcodes, categories, uoms);
  }, [products, barcodes, categories, uoms]);

  // Filters State
  const [filters, setFilters] = useState<ProductFilters>({
    searchQuery: '',
    categoryId: 'all',
    type: 'all',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isUomModalOpen, setIsUomModalOpen] = useState(false);

  const [productToEdit, setProductToEdit] = useState<ProductHydrated | null>(null);
  const [productToView, setProductToView] = useState<ProductHydrated | null>(null);
  const [productToArchive, setProductToArchive] = useState<ProductHydrated | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Used Category & UoM IDs (to prevent accidental deletion if in use)
  const usedCategoryIds = useMemo(() => {
    return new Set(products.map((p) => p.categoryId));
  }, [products]);

  const usedUomIds = useMemo(() => {
    return new Set(products.map((p) => p.baseUomId));
  }, [products]);

  // RECURSIVE CATEGORY HIERARCHY FILTERING
  const filteredProducts = useMemo(() => {
    // If a specific category is selected, collect its ID and ALL its descendant IDs
    const allowedCategoryIds = filters.categoryId !== 'all'
      ? getAllDescendantCategoryIds(filters.categoryId, categories)
      : null;

    return hydratedProducts.filter((product) => {
      // 1. Search Query (Name Ar, Name En, SKU, and ANY Barcode)
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.trim().toLowerCase();
        const matchesNameAr = product.nameAr.toLowerCase().includes(query);
        const matchesNameEn = (product.nameEn || '').toLowerCase().includes(query);
        const matchesSku = product.sku.toLowerCase().includes(query);
        const matchesAnyBarcode = product.barcodes.some((b) =>
          b.barcode.toLowerCase().includes(query)
        );

        if (!matchesNameAr && !matchesNameEn && !matchesSku && !matchesAnyBarcode) {
          return false;
        }
      }

      // 2. Category Filter (Matches selected category OR any of its subcategories)
      if (allowedCategoryIds && !allowedCategoryIds.has(product.categoryId)) {
        return false;
      }

      // 3. Type Filter
      if (filters.type !== 'all' && product.type !== filters.type) {
        return false;
      }

      // 4. Status Filter
      if (filters.status !== 'all' && product.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [hydratedProducts, filters, categories]);

  // Handler: Add New Product
  const handleCreateProduct = (data: CreateProductFormInput) => {
    const newProductId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newProduct: Product = {
      id: newProductId,
      nameAr: data.nameAr.trim(),
      nameEn: data.nameEn ? data.nameEn.trim() : undefined,
      sku: data.sku.trim().toUpperCase(),
      categoryId: data.categoryId,
      baseUomId: data.baseUomId,
      type: data.type,
      status: data.status,
      description: data.description ? data.description.trim() : undefined,
      imageUrl: data.imageUrl ? data.imageUrl.trim() : undefined,
      createdAt: now,
      updatedAt: now,
    };

    const newBarcodes: ProductBarcode[] = data.barcodes.map((bItem) => ({
      id: crypto.randomUUID(),
      productId: newProductId,
      barcode: bItem.barcode.trim(),
      isPrimary: bItem.isPrimary,
      createdAt: now,
      updatedAt: now,
    }));

    setProducts((prev) => [newProduct, ...prev]);
    setBarcodes((prev) => [...prev, ...newBarcodes]);
    showToast(`تمت إضافة الصنف "${newProduct.nameAr}" بنجاح.`);
  };

  // Handler: Update Product (STRICT ID PERSISTENCE FOR PRODUCT BARCODES)
  const handleUpdateProduct = (data: CreateProductFormInput) => {
    if (!productToEdit) return;
    const targetProductId = productToEdit.id;
    const now = new Date().toISOString();

    // 1. Update Product record
    setProducts((prev) =>
      prev.map((p) =>
        p.id === targetProductId
          ? {
              ...p,
              nameAr: data.nameAr.trim(),
              nameEn: data.nameEn ? data.nameEn.trim() : undefined,
              sku: data.sku.trim().toUpperCase(),
              categoryId: data.categoryId,
              baseUomId: data.baseUomId,
              type: data.type,
              status: data.status,
              description: data.description ? data.description.trim() : undefined,
              imageUrl: data.imageUrl ? data.imageUrl.trim() : undefined,
              updatedAt: now,
            }
          : p
      )
    );

    // 2. Barcode synchronization preserving IDs:
    setBarcodes((prev) => {
      // Barcodes belonging to OTHER products remain completely untouched
      const otherBarcodes = prev.filter((b) => b.productId !== targetProductId);
      const currentProductBarcodes = prev.filter((b) => b.productId === targetProductId);
      const existingBarcodeMap = new Map<string, ProductBarcode>(
        currentProductBarcodes.map((b) => [b.id, b])
      );

      const resolvedBarcodes: ProductBarcode[] = data.barcodes.map((inputItem) => {
        const existingRecord = inputItem.id ? existingBarcodeMap.get(inputItem.id) : undefined;
        if (existingRecord) {
          // EXISTING BARCODE: Preserve original ID, productId, and createdAt!
          return {
            id: existingRecord.id,
            productId: existingRecord.productId,
            barcode: inputItem.barcode.trim(),
            isPrimary: inputItem.isPrimary,
            createdAt: existingRecord.createdAt,
            updatedAt: now,
          };
        } else {
          // NEW BARCODE: Generate new UUID
          return {
            id: crypto.randomUUID(),
            productId: targetProductId,
            barcode: inputItem.barcode.trim(),
            isPrimary: inputItem.isPrimary,
            createdAt: now,
            updatedAt: now,
          };
        }
      });

      return [...otherBarcodes, ...resolvedBarcodes];
    });

    showToast(`تم حفظ تعديلات الصنف "${data.nameAr}".`);
    setProductToEdit(null);
  };

  // Handler: Archive / Unarchive Toggle
  const handleConfirmArchiveToggle = (product: Product) => {
    const nextStatus = product.status === 'active' ? 'archived' : 'active';
    const now = new Date().toISOString();

    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, status: nextStatus, updatedAt: now } : p
      )
    );

    showToast(
      nextStatus === 'archived'
        ? `تمت أرشفة الصنف "${product.nameAr}".`
        : `تمت استعادة وتنشيط الصنف "${product.nameAr}".`
    );
    setProductToArchive(null);
  };

  // Handler: Add Category
  const handleAddCategory = (input: CreateCategoryInput) => {
    const now = new Date().toISOString();
    const newCategory: Category = {
      id: crypto.randomUUID(),
      nameAr: input.nameAr,
      nameEn: input.nameEn,
      parentId: input.parentId || null,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    setCategories((prev) => [...prev, newCategory]);
    showToast(`تمت إضافة التصنيف "${newCategory.nameAr}" بنجاح.`);
  };

  // Handler: Archive / Activate Category (Preserving ID & relational integrity)
  const handleToggleCategoryStatus = (categoryId: string) => {
    const now = new Date().toISOString();
    let categoryName = '';
    let willArchive = false;

    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === categoryId) {
          categoryName = c.nameAr;
          willArchive = c.status === 'active';
          return {
            ...c,
            status: willArchive ? 'archived' : 'active',
            updatedAt: now,
          };
        }
        return c;
      })
    );

    showToast(
      willArchive
        ? `تمت أرشفة التصنيف "${categoryName}".`
        : `تم تنشيط التصنيف "${categoryName}".`
    );
  };

  // Handler: Add UoM
  const handleAddUom = (input: CreateUomInput) => {
    const now = new Date().toISOString();
    const newUom: UnitOfMeasure = {
      id: crypto.randomUUID(),
      nameAr: input.nameAr,
      nameEn: input.nameEn,
      code: input.code.toUpperCase(),
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    setUoms((prev) => [...prev, newUom]);
    showToast(`تمت إضافة وحدة القياس "${newUom.nameAr} (${newUom.code})" بنجاح.`);
  };

  // Handler: Archive / Activate UoM (Preserving ID & relational integrity)
  const handleToggleUomStatus = (uomId: string) => {
    const now = new Date().toISOString();
    let uomName = '';
    let willArchive = false;

    setUoms((prev) =>
      prev.map((u) => {
        if (u.id === uomId) {
          uomName = u.nameAr;
          willArchive = u.status === 'active';
          return {
            ...u,
            status: willArchive ? 'archived' : 'active',
            updatedAt: now,
          };
        }
        return u;
      })
    );

    showToast(
      willArchive
        ? `تمت أرشفة وحدة القياس "${uomName}".`
        : `تم تنشيط وحدة القياس "${uomName}".`
    );
  };

  // Reset Filters
  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      categoryId: 'all',
      type: 'all',
      status: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col selection:bg-slate-800 selection:text-white pb-12 font-sans antialiased">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg shadow-md text-xs sm:text-sm font-medium">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clean ERP Header */}
      <Header
        products={hydratedProducts}
        totalBarcodesCount={barcodes.length}
        totalCategoriesCount={categories.length}
        totalUomsCount={uoms.length}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
        onOpenUomManager={() => setIsUomModalOpen(true)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 flex-1 w-full">
        
        {/* Search & Filters */}
        <ProductFiltersComponent
          filters={filters}
          categories={categories}
          onFilterChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
          onResetFilters={handleResetFilters}
        />

        {/* Results Info Bar */}
        {products.length > 0 && (
          <div className="flex items-center justify-between px-1 text-xs text-slate-600">
            <div>
              الأصناف المعروضة: <span className="font-bold text-slate-900">{filteredProducts.length}</span> من أصل <span className="font-bold text-slate-900">{products.length}</span> صنف
            </div>
            <div className="font-mono text-slate-500">
              {barcodes.length} باركود مسجل
            </div>
          </div>
        )}

        {/* Product Table / Cards / Empty State */}
        <ProductList
          products={filteredProducts}
          totalProductsCount={products.length}
          onViewProduct={(product) => setProductToView(product)}
          onEditProduct={(product) => setProductToEdit(product)}
          onRequestArchiveToggle={(product) => setProductToArchive(product)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

      </main>

      {/* 1. Add Product Modal */}
      <ProductFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateProduct}
        existingProducts={hydratedProducts}
        categories={categories}
        uoms={uoms}
        allBarcodes={barcodes}
        onOpenCategoryManager={() => {
          setIsCategoryModalOpen(true);
        }}
        onOpenUomManager={() => {
          setIsUomModalOpen(true);
        }}
      />

      {/* 2. Edit Product Modal */}
      <ProductFormModal
        isOpen={!!productToEdit}
        productToEdit={productToEdit}
        onClose={() => setProductToEdit(null)}
        onSubmit={handleUpdateProduct}
        existingProducts={hydratedProducts}
        categories={categories}
        uoms={uoms}
        allBarcodes={barcodes}
        onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
        onOpenUomManager={() => setIsUomModalOpen(true)}
      />

      {/* 3. Product Details Modal */}
      <ProductDetailModal
        product={productToView}
        onClose={() => setProductToView(null)}
        onEdit={(prod) => {
          setProductToView(null);
          setProductToEdit(prod);
        }}
        onToggleArchive={(prod) => {
          setProductToView(null);
          setProductToArchive(prod);
        }}
      />

      {/* 4. Archive Confirmation Modal */}
      <ArchiveConfirmModal
        isOpen={!!productToArchive}
        product={productToArchive}
        onClose={() => setProductToArchive(null)}
        onConfirm={handleConfirmArchiveToggle}
      />

      {/* 5. Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onToggleCategoryStatus={handleToggleCategoryStatus}
        usedCategoryIds={usedCategoryIds}
      />

      {/* 6. UoM Manager Modal */}
      <UomManagerModal
        isOpen={isUomModalOpen}
        onClose={() => setIsUomModalOpen(false)}
        uoms={uoms}
        onAddUom={handleAddUom}
        onToggleUomStatus={handleToggleUomStatus}
        usedUomIds={usedUomIds}
      />

    </div>
  );
}
