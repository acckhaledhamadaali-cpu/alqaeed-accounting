import React, { useState, useMemo } from 'react';
import { 
  Warehouse, 
  InventoryLocation, 
  StockMovement, 
  StockMovementType, 
  AdjustmentDirection,
  CreateStockMovementInput
} from '../../types/inventory';
import { Product, UnitOfMeasure } from '../../types/product';
import { getAvailableStock, buildLocationPath } from '../../data/inventoryService';
import { X, ArrowDownRight, ArrowUpRight, Boxes, AlertCircle } from 'lucide-react';

interface CreateMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateStockMovementInput) => { success: boolean; error?: string };
  products: Product[];
  warehouses: Warehouse[];
  locations: InventoryLocation[];
  uoms: UnitOfMeasure[];
  currentMovements: StockMovement[];
}

export const CreateMovementModal: React.FC<CreateMovementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  products,
  warehouses,
  locations,
  uoms,
  currentMovements,
}) => {
  // Only physical active products
  const eligibleProducts = useMemo(() => {
    return products.filter((p) => p.status === 'active' && p.type === 'product');
  }, [products]);

  // Active warehouses
  const eligibleWarehouses = useMemo(() => {
    return warehouses.filter((w) => w.status === 'active');
  }, [warehouses]);

  const [productId, setProductId] = useState<string>(eligibleProducts[0]?.id || '');
  const [warehouseId, setWarehouseId] = useState<string>(eligibleWarehouses[0]?.id || '');
  const [locationId, setLocationId] = useState<string>('');
  const [movementType, setMovementType] = useState<StockMovementType>('receipt');
  const [adjustmentDirection, setAdjustmentDirection] = useState<AdjustmentDirection>('increase');
  const [quantity, setQuantity] = useState<string>('');
  const [movementDate, setMovementDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [error, setError] = useState<string | null>(null);

  // Selected Product details
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === productId);
  }, [products, productId]);

  // Base UoM of selected product
  const baseUom = useMemo(() => {
    if (!selectedProduct) return null;
    return uoms.find((u) => u.id === selectedProduct.baseUomId) || null;
  }, [selectedProduct, uoms]);

  // Eligible locations for selected warehouse (active only)
  const eligibleLocations = useMemo(() => {
    if (!warehouseId) return [];
    return locations.filter((l) => l.warehouseId === warehouseId && l.status === 'active');
  }, [locations, warehouseId]);

  // Real-time Available Stock calculation for current selection
  const availableStock = useMemo(() => {
    if (!productId || !warehouseId) return 0;
    return getAvailableStock(
      currentMovements,
      productId,
      warehouseId,
      locationId || undefined
    );
  }, [currentMovements, productId, warehouseId, locationId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const qtyNum = parseFloat(quantity);
    if (isNaN(qtyNum) || !Number.isFinite(qtyNum) || qtyNum <= 0) {
      setError('الكمية يجب أن تكون رقماً صالحاً وموجباً أكبر من الصفر.');
      return;
    }

    if (!selectedProduct) {
      setError('يرجى اختيار صنف مادي صالح.');
      return;
    }

    if (!warehouseId) {
      setError('يرجى اختيار مستودع نشط.');
      return;
    }

    const input: CreateStockMovementInput = {
      productId,
      warehouseId,
      locationId: locationId || undefined,
      movementType,
      adjustmentDirection: movementType === 'adjustment' ? adjustmentDirection : undefined,
      quantity: qtyNum,
      uomId: selectedProduct.baseUomId,
      movementDate: new Date(movementDate).toISOString(),
    };

    const res = onSubmit(input);
    if (!res.success) {
      setError(res.error || 'فشلت عملية إنشاء الحركة المخزنية.');
      return;
    }

    onClose();
  };

  const isOutbound =
    movementType === 'issue' ||
    (movementType === 'adjustment' && adjustmentDirection === 'decrease');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              تسجيل حركة مخزنية جديدة (Stock Movement)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              قيد مباشر في سجل المخزون (Ledger) مع التحقق الصارم من الأرصدة
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 text-xs">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-semibold text-xs leading-relaxed">{error}</div>
            </div>
          )}

          {/* Movement Type Selection */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">نوع الحركة المخزنية</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMovementType('receipt')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  movementType === 'receipt'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>استلام (Receipt)</span>
              </button>

              <button
                type="button"
                onClick={() => setMovementType('issue')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  movementType === 'issue'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>صرف (Issue)</span>
              </button>

              <button
                type="button"
                onClick={() => setMovementType('adjustment')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  movementType === 'adjustment'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>تسوية (Adjustment)</span>
              </button>
            </div>
          </div>

          {/* Adjustment Direction (Only if Adjustment) */}
          {movementType === 'adjustment' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
              <label className="block font-semibold text-amber-900">اتجاه التسوية</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-amber-900 font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="adjDir"
                    checked={adjustmentDirection === 'increase'}
                    onChange={() => setAdjustmentDirection('increase')}
                    className="text-slate-900 focus:ring-slate-800"
                  />
                  <span>تسوية بالزيادة (إضافة للمخزون)</span>
                </label>
                <label className="flex items-center gap-1.5 text-amber-900 font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="adjDir"
                    checked={adjustmentDirection === 'decrease'}
                    onChange={() => setAdjustmentDirection('decrease')}
                    className="text-slate-900 focus:ring-slate-800"
                  />
                  <span>تسوية بالعجز (خصم من المخزون)</span>
                </label>
              </div>
            </div>
          )}

          {/* Product Selection */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">
              الصنف المادي <span className="text-rose-600">*</span>
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800"
              required
            >
              {eligibleProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameAr} ({p.sku})
                </option>
              ))}
            </select>
            {eligibleProducts.length === 0 && (
              <p className="text-rose-600 text-[11px]">
                لا توجد أصناف مادية نشطة. الخدمات والأصناف المؤرشفة مستبعدة من حركات المخزون.
              </p>
            )}
          </div>

          {/* Warehouse Selection */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">
              المستودع <span className="text-rose-600">*</span>
            </label>
            <select
              value={warehouseId}
              onChange={(e) => {
                setWarehouseId(e.target.value);
                setLocationId('');
              }}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800"
              required
            >
              {eligibleWarehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.nameAr} ({w.code})
                </option>
              ))}
            </select>
            {eligibleWarehouses.length === 0 && (
              <p className="text-rose-600 text-[11px]">
                لا توجد مستودعات نشطة. يرجى إضافة مستودع أولاً.
              </p>
            )}
          </div>

          {/* Storage Location (Optional, filtered by Warehouse) */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">
              موقع التخزين (اختياري)
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800"
            >
              <option value="">المستودع العام (بدون تخصيص موقع)</option>
              {eligibleLocations.map((l) => (
                <option key={l.id} value={l.id}>
                  {buildLocationPath(l.id, locations)} ({l.code})
                </option>
              ))}
            </select>
          </div>

          {/* Available Stock Indicator */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <span className="text-slate-600">الرصيد المتاح الحالي في هذا الموقع:</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {availableStock} {baseUom?.nameAr}
            </span>
          </div>

          {/* Quantity & Base UoM */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">
                الكمية المطلوبة <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                min="0.0001"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="أدخل الكمية (> 0)..."
                className={`w-full px-3 py-2 bg-white border rounded font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 text-left ${
                  isOutbound && parseFloat(quantity) > availableStock
                    ? 'border-rose-400 bg-rose-50/20'
                    : 'border-slate-300'
                }`}
                required
              />
              {isOutbound && parseFloat(quantity) > availableStock && (
                <p className="text-[11px] text-rose-600 font-semibold">
                  الكمية تتجاوز الرصيد المتاح ({availableStock})!
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">وحدة القياس</label>
              <input
                type="text"
                disabled
                value={baseUom?.nameAr || '—'}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded text-slate-700 cursor-not-allowed font-medium"
              />
              <p className="text-[10px] text-slate-400">تستخدم وحدة القياس الأساسية للصنف دائماً.</p>
            </div>
          </div>

          {/* Movement Date */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">تاريخ الحركة</label>
            <input
              type="date"
              value={movementDate}
              onChange={(e) => setMovementDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 font-mono text-left"
              required
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={eligibleProducts.length === 0 || eligibleWarehouses.length === 0}
              className={`px-4 py-1.5 text-white font-semibold rounded transition-colors ${
                eligibleProducts.length === 0 || eligibleWarehouses.length === 0
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 cursor-pointer'
              }`}
            >
              تثبيت الحركة في الـ Ledger
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
