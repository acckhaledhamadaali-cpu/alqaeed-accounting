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
import { 
  Warehouse, 
  InventoryLocation, 
  StockMovement, 
  CreateWarehouseInput, 
  UpdateWarehouseInput, 
  CreateLocationInput, 
  UpdateLocationInput, 
  CreateStockMovementInput, 
  TransferStockInput 
} from './types/inventory';
import { 
  INITIAL_WAREHOUSES, 
  INITIAL_LOCATIONS, 
  INITIAL_STOCK_MOVEMENTS, 
  getAllStockBalances, 
  createWarehouse, 
  updateWarehouse, 
  toggleWarehouseStatus, 
  createLocation, 
  updateLocation, 
  toggleLocationStatus, 
  executeStockMovement, 
  executeStockTransfer 
} from './data/inventoryService';
import { Header, SystemModule } from './components/Header';
import { ProductFiltersComponent } from './components/ProductFilters';
import { ProductList } from './components/ProductList';
import { ProductFormModal } from './components/ProductFormModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ArchiveConfirmModal } from './components/ArchiveConfirmModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { UomManagerModal } from './components/UomManagerModal';
import { InventoryModule } from './components/inventory/InventoryModule';
import { Check } from 'lucide-react';

export default function App() {
  // System Module Switcher (Defaulting to 'inventory' for active Module 02 review)
  const [currentModule, setCurrentModule] = useState<SystemModule>('inventory');

  // Pure Empty Enterprise Master Data State (Module 01)
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [barcodes, setBarcodes] = useState<ProductBarcode[]>(INITIAL_BARCODES);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [uoms, setUoms] = useState<UnitOfMeasure[]>(INITIAL_UOMS);

  // Pure Empty Enterprise Inventory State (Module 02 - Zero Mock Data)
  const [warehouses, setWarehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);
  const [locations, setLocations] = useState<InventoryLocation[]>(INITIAL_LOCATIONS);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(INITIAL_STOCK_MOVEMENTS);

  // Dynamic stock balances derived strictly from the immutable ledger
  const stockBalances = useMemo(() => {
    return getAllStockBalances(stockMovements, products);
  }, [stockMovements, products]);

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
  const handleToggleCategoryStatus = (categoryId: string): { success: boolean; message: string } => {
    const targetCat = categories.find((c) => c.id === categoryId);
    if (!targetCat) {
      return { success: false, message: 'التصنيف غير موجود.' };
    }

    const now = new Date().toISOString();

    if (targetCat.status === 'active') {
      // Archiving parent: Automatically archive all descendant categories under that parent
      const descendantIds = getAllDescendantCategoryIds(categoryId, categories);
      const subcategoriesCount = descendantIds.size - 1;

      setCategories((prev) =>
        prev.map((c) => {
          if (descendantIds.has(c.id)) {
            return {
              ...c,
              status: 'archived',
              updatedAt: now,
            };
          }
          return c;
        })
      );

      const msg =
        subcategoriesCount > 0
          ? `تمت أرشفة التصنيف "${targetCat.nameAr}" وجميع التصنيفات الفرعية التابعة له (${subcategoriesCount}) بنجاح.`
          : `تمت أرشفة التصنيف "${targetCat.nameAr}".`;
      showToast(msg);
      return { success: true, message: msg };
    } else {
      // Reactivating: It may only become active if its parent is active
      if (targetCat.parentId) {
        const parent = categories.find((c) => c.id === targetCat.parentId);
        if (parent && parent.status === 'archived') {
          const errMsg = `لا يمكن تنشيط التصنيف "${targetCat.nameAr}" لأن التصنيف الأب (${parent.nameAr}) مؤرشف. يرجى تنشيط التصنيف الأب أولاً.`;
          showToast(errMsg);
          return { success: false, message: errMsg };
        }
      }

      setCategories((prev) =>
        prev.map((c) => {
          if (c.id === categoryId) {
            return {
              ...c,
              status: 'active',
              updatedAt: now,
            };
          }
          return c;
        })
      );

      const msg = `تم تنشيط التصنيف "${targetCat.nameAr}".`;
      showToast(msg);
      return { success: true, message: msg };
    }
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
  const handleToggleUomStatus = (uomId: string): { success: boolean; message: string } => {
    // 1. Locate the target UoM by ID before performing any state modification
    const targetUom = uoms.find((u) => u.id === uomId);
    if (!targetUom) {
      const errMsg = 'وحدة القياس غير موجودة.';
      showToast(errMsg);
      return { success: false, message: errMsg };
    }

    // 2. Target exists: proceed with state update while preserving ID and createdAt
    const now = new Date().toISOString();
    const willArchive = targetUom.status === 'active';

    setUoms((prev) =>
      prev.map((u) => {
        if (u.id === uomId) {
          return {
            ...u,
            status: willArchive ? 'archived' : 'active',
            updatedAt: now,
          };
        }
        return u;
      })
    );

    const msg = willArchive
      ? `تمت أرشفة وحدة القياس "${targetUom.nameAr}".`
      : `تم تنشيط وحدة القياس "${targetUom.nameAr}".`;

    showToast(msg);
    return { success: true, message: msg };
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

  // ==========================================
  // MODULE 02: INVENTORY & STOCK MOVEMENTS HANDLERS
  // ==========================================

  const handleAddWarehouse = (data: CreateWarehouseInput) => {
    const res = createWarehouse(data, warehouses);
    if (!res.success || !res.data) {
      showToast(res.error || 'فشلت إضافة المستودع.');
      return { success: false, error: res.error };
    }
    setWarehouses((prev) => [...prev, res.data!]);
    showToast(`تمت إضافة المستودع "${res.data.nameAr}" بنجاح.`);
    return { success: true };
  };

  const handleUpdateWarehouse = (id: string, data: UpdateWarehouseInput) => {
    const res = updateWarehouse(id, data, warehouses);
    if (!res.success || !res.data) {
      showToast(res.error || 'فشل تعديل المستودع.');
      return { success: false, error: res.error };
    }
    setWarehouses((prev) => prev.map((w) => (w.id === id ? res.data! : w)));
    showToast(`تم حفظ تعديلات المستودع "${res.data.nameAr}".`);
    return { success: true };
  };

  const handleToggleWarehouseStatus = (id: string) => {
    const res = toggleWarehouseStatus(id, warehouses, locations);
    if (!res.success || !res.data) {
      showToast(res.error || 'فشل تغيير حالة المستودع.');
      return { success: false, error: res.error };
    }
    setWarehouses((prev) => prev.map((w) => (w.id === id ? res.data!.updatedWarehouse : w)));
    setLocations(res.data.updatedLocations);
    const isArchived = res.data.updatedWarehouse.status === 'archived';
    showToast(
      isArchived
        ? `تمت أرشفة المستودع "${res.data.updatedWarehouse.nameAr}" وكافة مواقعه.`
        : `تمت إعادة تنشيط المستودع "${res.data.updatedWarehouse.nameAr}".`
    );
    return { success: true };
  };

  const handleAddLocation = (data: CreateLocationInput) => {
    const res = createLocation(data, locations, warehouses);
    if (!res.success || !res.data) {
      showToast(res.error || 'فشلت إضافة موقع التخزين.');
      return { success: false, error: res.error };
    }
    setLocations((prev) => [...prev, res.data!]);
    showToast(`تمت إضافة موقع التخزين "${res.data.nameAr}" بنجاح.`);
    return { success: true };
  };

  const handleUpdateLocation = (id: string, data: UpdateLocationInput) => {
    const res = updateLocation(id, data, locations);
    if (!res.success || !res.data) {
      showToast(res.error || 'فشل تعديل موقع التخزين.');
      return { success: false, error: res.error };
    }
    setLocations((prev) => prev.map((l) => (l.id === id ? res.data! : l)));
    showToast(`تم تعديل موقع التخزين "${res.data.nameAr}".`);
    return { success: true };
  };

  const handleToggleLocationStatus = (id: string) => {
    const res = toggleLocationStatus(id, locations, warehouses);
    if (!res.success || !res.data) {
      showToast(res.error || 'فشل تغيير حالة موقع التخزين.');
      return { success: false, error: res.error };
    }
    setLocations(res.data);
    showToast('تم تحديث حالة موقع التخزين بنجاح.');
    return { success: true };
  };

  const handleCreateMovement = (input: CreateStockMovementInput) => {
    const res = executeStockMovement(
      input,
      products,
      warehouses,
      locations,
      uoms,
      stockMovements
    );
    if (!res.success || !res.data) {
      showToast(res.error || 'فشلت عملية تسجيل الحركة المخزنية.');
      return { success: false, error: res.error };
    }
    setStockMovements((prev) => [res.data!, ...prev]);
    showToast('تم تسجيل الحركة المخزنية في الـ Ledger بنجاح.');
    return { success: true };
  };

  const handleExecuteTransfer = (input: TransferStockInput) => {
    const res = executeStockTransfer(
      input,
      products,
      warehouses,
      locations,
      uoms,
      stockMovements
    );
    if (!res.success || !res.data) {
      showToast(res.error || 'فشلت عملية المناقلة المخزنية.');
      return { success: false, error: res.error };
    }
    setStockMovements((prev) => [res.data!.movementIn, res.data!.movementOut, ...prev]);
    showToast('تمت المناقلة المخزنية الذرية وتوثيق الحركتين في الـ Ledger بنجاح.');
    return { success: true };
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
        currentModule={currentModule}
        onSelectModule={setCurrentModule}
        products={hydratedProducts}
        totalBarcodesCount={barcodes.length}
        totalCategoriesCount={categories.length}
        totalUomsCount={uoms.length}
        totalWarehousesCount={warehouses.length}
        totalLocationsCount={locations.length}
        totalMovementsCount={stockMovements.length}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
        onOpenUomManager={() => setIsUomModalOpen(true)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 flex-1 w-full">
        {currentModule === 'inventory' ? (
          <InventoryModule
            products={products}
            warehouses={warehouses}
            locations={locations}
            movements={stockMovements}
            stockBalances={stockBalances}
            uoms={uoms}
            onAddWarehouse={handleAddWarehouse}
            onUpdateWarehouse={handleUpdateWarehouse}
            onToggleWarehouseStatus={handleToggleWarehouseStatus}
            onAddLocation={handleAddLocation}
            onUpdateLocation={handleUpdateLocation}
            onToggleLocationStatus={handleToggleLocationStatus}
            onCreateMovement={handleCreateMovement}
            onExecuteTransfer={handleExecuteTransfer}
          />
        ) : (
          <>
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
          </>
        )}
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
      />

      {/* 6. UoM Manager Modal */}
      <UomManagerModal
        isOpen={isUomModalOpen}
        onClose={() => setIsUomModalOpen(false)}
        uoms={uoms}
        onAddUom={handleAddUom}
        onToggleUomStatus={handleToggleUomStatus}
      />

    </div>
  );
}
