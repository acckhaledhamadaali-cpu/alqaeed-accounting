import React, { useState, useMemo } from 'react';
import { 
  Warehouse, 
  InventoryLocation, 
  StockMovement, 
  TransferStockInput 
} from '../../types/inventory';
import { Product, UnitOfMeasure } from '../../types/product';
import { getAvailableStock, buildLocationPath } from '../../data/inventoryService';
import { X, ArrowLeftRight, AlertCircle, ArrowLeft } from 'lucide-react';

interface StockTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: TransferStockInput) => { success: boolean; error?: string };
  products: Product[];
  warehouses: Warehouse[];
  locations: InventoryLocation[];
  uoms: UnitOfMeasure[];
  currentMovements: StockMovement[];
}

export const StockTransferModal: React.FC<StockTransferModalProps> = ({
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
  const [sourceWarehouseId, setSourceWarehouseId] = useState<string>(eligibleWarehouses[0]?.id || '');
  const [sourceLocationId, setSourceLocationId] = useState<string>('');
  
  // Default destination warehouse to a second warehouse if available
  const [destinationWarehouseId, setDestinationWarehouseId] = useState<string>(
    eligibleWarehouses[1]?.id || eligibleWarehouses[0]?.id || ''
  );
  const [destinationLocationId, setDestinationLocationId] = useState<string>('');

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

  // Source Locations (active only for source warehouse)
  const sourceLocations = useMemo(() => {
    if (!sourceWarehouseId) return [];
    return locations.filter((l) => l.warehouseId === sourceWarehouseId && l.status === 'active');
  }, [locations, sourceWarehouseId]);

  // Destination Locations (active only for destination warehouse)
  const destinationLocations = useMemo(() => {
    if (!destinationWarehouseId) return [];
    return locations.filter((l) => l.warehouseId === destinationWarehouseId && l.status === 'active');
  }, [locations, destinationWarehouseId]);

  // Available stock at Source
  const availableAtSource = useMemo(() => {
    if (!productId || !sourceWarehouseId) return 0;
    return getAvailableStock(
      currentMovements,
      productId,
      sourceWarehouseId,
      sourceLocationId || undefined
    );
  }, [currentMovements, productId, sourceWarehouseId, sourceLocationId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const qtyNum = parseFloat(quantity);
    if (isNaN(qtyNum) || !Number.isFinite(qtyNum) || qtyNum <= 0) {
      setError('الكمية المحولة يجب أن تكون رقماً صالحاً وموجباً أكبر من الصفر.');
      return;
    }

    if (!selectedProduct) {
      setError('يرجى اختيار صنف مادي صالح.');
      return;
    }

    if (!sourceWarehouseId || !destinationWarehouseId) {
      setError('يرجى اختيار مستودع المصدر ومستودع الوجهة.');
      return;
    }

    // Check Source === Destination
    const isSameWh = sourceWarehouseId === destinationWarehouseId;
    const isSameLoc = (sourceLocationId || '') === (destinationLocationId || '');
    if (isSameWh && isSameLoc) {
      setError('لا يمكن المناقلة لنفس المستودع والموقع التخزيني. يجب تغيير المستودع أو موقع التخزين.');
      return;
    }

    // Check Balance
    if (qtyNum > availableAtSource) {
      setError(
        `الرصيد المتاح في المصدر (${availableAtSource} ${baseUom?.nameAr}) لا يكفي لنقل الكمية المطلوبة (${qtyNum} ${baseUom?.nameAr}).`
      );
      return;
    }

    const input: TransferStockInput = {
      productId,
      sourceWarehouseId,
      sourceLocationId: sourceLocationId || undefined,
      destinationWarehouseId,
      destinationLocationId: destinationLocationId || undefined,
      quantity: qtyNum,
      uomId: selectedProduct.baseUomId,
      movementDate: new Date(movementDate).toISOString(),
    };

    const res = onSubmit(input);
    if (!res.success) {
      setError(res.error || 'فشلت عملية المناقلة المخزنية.');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
              <span>مناقلة مخزنية ذرية (Atomic Stock Transfer)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              توليد حركتي نقل مترابطتين (Transfer Out & In) بمعرف مشترك لمنع أي فجوات مخزنية
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

          {/* Product Selection */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">
              الصنف المنقول <span className="text-rose-600">*</span>
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
          </div>

          {/* Transfer Source & Destination Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* SOURCE BOX */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-slate-900">طرف المصدر (من)</span>
                <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  Transfer Out
                </span>
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-slate-700">مستودع المصدر</label>
                <select
                  value={sourceWarehouseId}
                  onChange={(e) => {
                    setSourceWarehouseId(e.target.value);
                    setSourceLocationId('');
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 text-xs"
                  required
                >
                  {eligibleWarehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.nameAr} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-slate-700">موقع المصدر (اختياري)</label>
                <select
                  value={sourceLocationId}
                  onChange={(e) => setSourceLocationId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 text-xs"
                >
                  <option value="">المستودع العام</option>
                  {sourceLocations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {buildLocationPath(l.id, locations)} ({l.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-1 text-[11px] flex justify-between items-center text-slate-600">
                <span>الرصيد المتاح بالمصدر:</span>
                <span className="font-mono font-bold text-slate-900">
                  {availableAtSource} {baseUom?.nameAr}
                </span>
              </div>
            </div>

            {/* DESTINATION BOX */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-slate-900">طرف الوجهة (إلى)</span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Transfer In
                </span>
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-slate-700">مستودع الوجهة</label>
                <select
                  value={destinationWarehouseId}
                  onChange={(e) => {
                    setDestinationWarehouseId(e.target.value);
                    setDestinationLocationId('');
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 text-xs"
                  required
                >
                  {eligibleWarehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.nameAr} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-slate-700">موقع الوجهة (اختياري)</label>
                <select
                  value={destinationLocationId}
                  onChange={(e) => setDestinationLocationId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 text-xs"
                >
                  <option value="">المستودع العام</option>
                  {destinationLocations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {buildLocationPath(l.id, locations)} ({l.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-1 text-[11px] text-slate-400">
                سيتم إضافة الكمية فوراً لنفس الصنف.
              </div>
            </div>

          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700">
                الكمية المحولة <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                min="0.0001"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="أدخل الكمية (> 0)..."
                className={`w-full px-3 py-2 bg-white border rounded font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 text-left ${
                  parseFloat(quantity) > availableAtSource
                    ? 'border-rose-400 bg-rose-50/20'
                    : 'border-slate-300'
                }`}
                required
              />
              {parseFloat(quantity) > availableAtSource && (
                <p className="text-[11px] text-rose-600 font-semibold">
                  تتجاوز الرصيد المتاح في المصدر!
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
            </div>
          </div>

          {/* Movement Date */}
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700">تاريخ المناقلة</label>
            <input
              type="date"
              value={movementDate}
              onChange={(e) => setMovementDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 font-mono text-left"
              required
            />
          </div>

          {/* Footer */}
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
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded cursor-pointer transition-colors"
            >
              تنفيذ المناقلة الذرية
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
