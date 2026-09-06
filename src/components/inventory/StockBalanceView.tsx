import React, { useState, useMemo } from 'react';
import { StockBalanceRecord, Warehouse, InventoryLocation } from '../../types/inventory';
import { Product, UnitOfMeasure } from '../../types/product';
import { buildLocationPath } from '../../data/inventoryService';
import { Search, Building2, MapPin, Package, Filter } from 'lucide-react';

interface StockBalanceViewProps {
  balances: StockBalanceRecord[];
  products: Product[];
  warehouses: Warehouse[];
  locations: InventoryLocation[];
  uoms: UnitOfMeasure[];
  onOpenCreateMovement: () => void;
  onOpenTransfer: () => void;
}

export const StockBalanceView: React.FC<StockBalanceViewProps> = ({
  balances,
  products,
  warehouses,
  locations,
  uoms,
  onOpenCreateMovement,
  onOpenTransfer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('all');
  const [hideZeroBalances, setHideZeroBalances] = useState(true);

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const warehouseMap = useMemo(() => new Map(warehouses.map((w) => [w.id, w])), [warehouses]);
  const locationMap = useMemo(() => new Map(locations.map((l) => [l.id, l])), [locations]);
  const uomMap = useMemo(() => new Map(uoms.map((u) => [u.id, u])), [uoms]);

  const enrichedBalances = useMemo(() => {
    return balances.map((b) => {
      const product = productMap.get(b.productId);
      const warehouse = warehouseMap.get(b.warehouseId);
      const location = b.locationId ? locationMap.get(b.locationId) : undefined;
      const locationPath = b.locationId ? buildLocationPath(b.locationId, locations) : undefined;
      const uom = uomMap.get(b.baseUomId);

      return {
        ...b,
        product,
        warehouse,
        location,
        locationPath,
        uom,
      };
    });
  }, [balances, productMap, warehouseMap, locationMap, locations, uomMap]);

  const filteredBalances = useMemo(() => {
    return enrichedBalances.filter((item) => {
      if (selectedWarehouseId !== 'all' && item.warehouseId !== selectedWarehouseId) {
        return false;
      }

      if (hideZeroBalances && item.baseQuantity <= 0) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = item.product?.nameAr.toLowerCase().includes(q) || false;
        const matchSku = item.product?.sku.toLowerCase().includes(q) || false;
        const matchWh = item.warehouse?.nameAr.toLowerCase().includes(q) || false;
        if (!matchName && !matchSku && !matchWh) return false;
      }

      return true;
    });
  }, [enrichedBalances, selectedWarehouseId, hideZeroBalances, searchQuery]);

  return (
    <div className="space-y-4">
      
      {/* Action Header & Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Filters */}
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث باسم الصنف، SKU، أو المستودع..."
              className="w-full pr-9 pl-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 text-slate-900"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-800"
            >
              <option value="all">كافة المستودعات</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.nameAr} ({w.code})
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hideZeroBalances}
              onChange={(e) => setHideZeroBalances(e.target.checked)}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-800"
            />
            <span>إخفاء الأرصدة الصفرية</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenTransfer}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded text-xs font-semibold cursor-pointer"
          >
            مناقلة مخزنية
          </button>
          <button
            type="button"
            onClick={onOpenCreateMovement}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer"
          >
            حركة مخزنية جديدة
          </button>
        </div>

      </div>

      {/* Stock Balance Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">الصنف الرئيسي</th>
                <th className="px-4 py-3">رمز SKU</th>
                <th className="px-4 py-3">المستودع</th>
                <th className="px-4 py-3">موقع التخزين (Location)</th>
                <th className="px-4 py-3">وحدة القياس الأساسية</th>
                <th className="px-4 py-3 text-left font-mono">الرصيد المتاح (Ledger)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBalances.length > 0 ? (
                filteredBalances.map((item) => (
                  <tr key={`${item.productId}-${item.warehouseId}-${item.locationId ?? 'NO_LOCATION'}`} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {item.product?.nameAr || item.productId}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {item.product?.sku || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.warehouse?.nameAr || '—'}</span>
                        <span className="text-[10px] font-mono text-slate-400">({item.warehouse?.code})</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.locationPath ? (
                        <span className="inline-flex items-center gap-1 font-mono text-xs">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{item.locationPath}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">المستودع العام (بدون رف)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      {item.uom?.nameAr || '—'}
                    </td>
                    <td className="px-4 py-3 text-left">
                      <span className="font-mono font-bold text-sm text-slate-900 px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {item.baseQuantity} {item.uom?.nameAr}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-700">لا توجد أرصدة مخزنية مطابقة</p>
                      <p className="text-xs text-slate-400">
                        الأرصدة تُحسب تلقائياً من حركات الـ Ledger. قم بتسجيل حركة استلام جديدة لبناء الرصيد.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
