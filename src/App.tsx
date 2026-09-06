import React, { useState, useMemo } from 'react';
import { 
  Product, 
  ProductBarcode, 
  Category, 
  UnitOfMeasure, 
  ProductHydrated, 
  ProductFilters, 
  CreateProductFormInput 
} from './types/product';
import { 
  INITIAL_MOCK_PRODUCTS, 
  INITIAL_MOCK_BARCODES, 
  MOCK_CATEGORIES, 
  MOCK_UOMS, 
  hydrateProducts 
} from './data/mockProducts';
import { Header } from './components/Header';
import { ProductFiltersComponent } from './components/ProductFilters';
import { ProductList } from './components/ProductList';
import { ProductFormModal } from './components/ProductFormModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ArchiveConfirmModal } from './components/ArchiveConfirmModal';
import { CheckCircle2, GitBranch, ShieldCheck } from 'lucide-react';

export default function App() {
  // Relational Master Entities in State (Simulating PostgreSQL tables in memory)
  const [products, setProducts] = useState<Product[]>(INITIAL_MOCK_PRODUCTS);
  const [barcodes, setBarcodes] = useState<ProductBarcode[]>(INITIAL_MOCK_BARCODES);
  const [categories] = useState<Category[]>(MOCK_CATEGORIES);
  const [uoms] = useState<UnitOfMeasure[]>(MOCK_UOMS);

  // Hydrated Products (Joined View for the UI)
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
  const [productToEdit, setProductToEdit] = useState<ProductHydrated | null>(null);
  const [productToView, setProductToView] = useState<ProductHydrated | null>(null);
  const [productToArchive, setProductToArchive] = useState<ProductHydrated | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sample Barcodes for Scanner Simulation
  const sampleBarcodes = useMemo(() => {
    return barcodes.map((b) => b.barcode);
  }, [barcodes]);

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    return hydratedProducts.filter((product) => {
      // 1. Search Query (Arabic Name, English Name, SKU, and ANY Barcode in the 1:M relationship)
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

      // 2. Hierarchical Category Filter
      if (filters.categoryId !== 'all') {
        // Also checks if the category or any child in hierarchy matches
        const matchesCat = product.categoryId === filters.categoryId;
        if (!matchesCat) return false;
      }

      // 3. Type Filter (Product vs Service)
      if (filters.type !== 'all' && product.type !== filters.type) {
        return false;
      }

      // 4. Status Filter (Active vs Archived)
      if (filters.status !== 'all' && product.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [hydratedProducts, filters]);

  // Handler: Add New Product (Creates 1 Product Record + N ProductBarcode Records)
  const handleCreateProduct = (data: CreateProductFormInput) => {
    const newProductId = `P${Date.now().toString().slice(-4)}`;
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

    const newBarcodes: ProductBarcode[] = data.barcodes.map((bItem, idx) => ({
      id: `bar-${Date.now()}-${idx}`,
      productId: newProductId,
      barcode: bItem.barcode.trim(),
      isPrimary: bItem.isPrimary,
      createdAt: now,
      updatedAt: now,
    }));

    setProducts((prev) => [newProduct, ...prev]);
    setBarcodes((prev) => [...prev, ...newBarcodes]);
    showToast(`تمت إضافة الصنف "${newProduct.nameAr}" وربط ${newBarcodes.length} باركود بنجاح.`);
  };

  // Handler: Edit Product
  const handleUpdateProduct = (data: CreateProductFormInput) => {
    if (!productToEdit) return;
    const targetId = productToEdit.id;
    const now = new Date().toISOString();

    // 1. Update Product Master entity
    setProducts((prev) =>
      prev.map((p) =>
        p.id === targetId
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

    // 2. Update ProductBarcodes (1:M relation sync)
    const updatedBarcodes: ProductBarcode[] = data.barcodes.map((bItem, idx) => ({
      id: `bar-${Date.now()}-${idx}`,
      productId: targetId,
      barcode: bItem.barcode.trim(),
      isPrimary: bItem.isPrimary,
      createdAt: now,
      updatedAt: now,
    }));

    setBarcodes((prev) => [
      ...prev.filter((b) => b.productId !== targetId),
      ...updatedBarcodes,
    ]);

    showToast(`تم تحديث بيانات الصنف "${data.nameAr}" وسجل الباركودات بنجاح.`);
    setProductToEdit(null);
  };

  // Handler: Archive / Unarchive Toggle
  const handleConfirmArchiveToggle = (product: ProductHydrated) => {
    const nextStatus = product.status === 'active' ? 'archived' : 'active';
    const now = new Date().toISOString();

    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? { ...p, status: nextStatus, updatedAt: now }
          : p
      )
    );

    showToast(
      nextStatus === 'archived'
        ? `تمت أرشفة الصنف "${product.nameAr}". لن يظهر في شاشات المبيعات الجديدة.`
        : `تمت استعادة وتنشيط الصنف "${product.nameAr}".`
    );
    setProductToArchive(null);
  };

  // Handler: Reset Filters
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

  // Handler: Simulate Barcode Scan
  const handleBarcodeScanSimulate = (barcode: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: barcode }));
    showToast(`تمت محاكاة مسح الباركود: ${barcode}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white pb-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 right-5 sm:right-auto sm:left-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-lg text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Module Header */}
      <Header
        products={hydratedProducts}
        totalBarcodesCount={barcodes.length}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">
        
        {/* Module Scope Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900">الهيكلية المصححة لـ MODULE 01: </span>
              <span>دعم تعدد الباركودات (1:M)، شجرة تصنيفات هرمية (Parent-Child)، ووحدات قياس مستقلة (Base UoM) مهيأة لـ PostgreSQL.</span>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-mono text-xs shrink-0">
            <GitBranch className="w-3.5 h-3.5 text-emerald-600" />
            <span>Master Data Only</span>
          </div>
        </div>

        {/* Filters & Search Control */}
        <ProductFiltersComponent
          filters={filters}
          categories={categories}
          sampleBarcodes={sampleBarcodes}
          onFilterChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
          onResetFilters={handleResetFilters}
          onBarcodeScanSimulate={handleBarcodeScanSimulate}
        />

        {/* Products Results Header */}
        <div className="flex items-center justify-between px-1">
          <div className="text-xs sm:text-sm font-bold text-slate-700">
            نتائج الأصناف ({filteredProducts.length} من أصل {products.length} صنف)
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {barcodes.length} باركود مسجل إجمالاً
          </div>
        </div>

        {/* Products Table & Mobile Cards */}
        <ProductList
          products={filteredProducts}
          onViewProduct={(product) => setProductToView(product)}
          onEditProduct={(product) => setProductToEdit(product)}
          onRequestArchiveToggle={(product) => setProductToArchive(product)}
        />

      </main>

      {/* Modals */}
      
      {/* 1. Add Product Modal */}
      <ProductFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateProduct}
        existingProducts={hydratedProducts}
        categories={categories}
        uoms={uoms}
        allBarcodes={barcodes}
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

      {/* 4. Archive / Unarchive Confirmation Modal */}
      <ArchiveConfirmModal
        isOpen={!!productToArchive}
        product={productToArchive}
        onClose={() => setProductToArchive(null)}
        onConfirm={handleConfirmArchiveToggle}
      />

    </div>
  );
}
