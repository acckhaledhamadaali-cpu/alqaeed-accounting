import React, { useState, useMemo } from 'react';
import { StockMovement, Warehouse, InventoryLocation } from '../../types/inventory';
import { Product, UnitOfMeasure } from '../../types/product';
import { buildLocationPath } from '../../data/inventoryService';
import { 
  Search, 
  Layers, 
  ArrowDownRight, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Boxes, 
  Calendar, 
  Link2 
} from 'lucide-react';

interface MovementHistoryViewProps {
  movements: StockMovement[];
  products: Product[];
  warehouses: Warehouse[];
  locations: InventoryLocation[];
  uoms: UnitOfMeasure[];
  onOpenCreateMovement: () => void;
}

export const MovementHistoryView: React.FC<MovementHistoryViewProps> = ({
  movements,
  products,
  warehouses,
  locations,
  uoms,
  onOpenCreateMovement,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('all');

  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const warehouseMap = useMemo(() => new Map(warehouses.map((w) => [w.id, w])), [warehouses]);
  const locationMap = useMemo(() => new Map(locations.map((l) => [l.id, l])), [locations]);
  const uomMap = useMemo(() => new Map(uoms.map((u) => [u.id, u])), [uoms]);

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      if (selectedType !== 'all' && m.movementType !== selectedType) {
        return false;
      }

      if (selectedWarehouseId !== 'all' && m.warehouseId !== selectedWarehouseId) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const product = productMap.get(m.productId);
        const matchName = product?.nameAr.toLowerCase().includes(q) || false;
        const matchSku = product?.sku.toLowerCase().includes(q) || false;
        const matchId = m.id.toLowerCase().includes(q);
        const matchRel = m.relatedMovementId?.toLowerCase().includes(q) || false;
        if (!matchName && !matchSku && !matchId && !matchRel) return false;
      }

      return true;
    });
  }, [movements, selectedType, selectedWarehouseId, searchQuery, productMap]);

  const renderMovementTypeBadge = (type: StockMovement['movementType'], sourceType?: string) => {
    switch (type) {
      case 'receipt':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ArrowDownRight className="w-3 h-3" />
            <span>استلام (Receipt)</span>
          </span>
        );
      case 'issue':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <ArrowUpRight className="w-3 h-3" />
            <span>صرف (Issue)</span>
          </span>
        );
      case 'transfer_in':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ArrowDownRight className="w-3 h-3" />
            <span>وارد مناقلة (Transfer In)</span>
          </span>
        );
      case 'transfer_out':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ArrowUpRight className="w-3 h-3" />
            <span>منصرف مناقلة (Transfer Out)</span>
          </span>
        );
      case 'adjustment':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Boxes className="w-3 h-3" />
            <span>تسوية {sourceType === 'decrease' ? 'نقص' : 'زيادة'} (Adjustment)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Search & Filter Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث بالصنف، SKU، أو معرف الحركة..."
              className="w-full pr-9 pl-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 text-slate-900"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-800"
          >
            <option value="all">كافة أنواع الحركات</option>
            <option value="receipt">استلام (Receipt)</option>
            <option value="issue">صرف (Issue)</option>
            <option value="transfer_in">وارد مناقلة (Transfer In)</option>
            <option value="transfer_out">منصرف مناقلة (Transfer Out)</option>
            <option value="adjustment">تسوية (Adjustment)</option>
          </select>

          <select
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-800"
          >
            <option value="all">كافة المستودعات</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.nameAr}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onOpenCreateMovement}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer shrink-0"
        >
          حركة مخزنية جديدة
        </button>

      </div>

      {/* Ledger Table (Immutable records, No Costs) */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">تاريخ الحركة</th>
                <th className="px-4 py-3">الصنف / SKU</th>
                <th className="px-4 py-3">المستودع</th>
                <th className="px-4 py-3">الموقع (Location)</th>
                <th className="px-4 py-3">نوع الحركة (Movement Type)</th>
                <th className="px-4 py-3 font-mono">الكمية المسجلة</th>
                <th className="px-4 py-3">وحدة الحركة</th>
                <th className="px-4 py-3 font-mono">الكمية الأساسية (Base)</th>
                <th className="px-4 py-3">المرجع (Reference / Related)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredMovements.length > 0 ? (
                filteredMovements.map((m) => {
                  const prod = productMap.get(m.productId);
                  const wh = warehouseMap.get(m.warehouseId);
                  const locPath = m.locationId ? buildLocationPath(m.locationId, locations) : null;
                  const uom = uomMap.get(m.uomId);
                  const baseUom = uomMap.get(m.baseUomId);

                  const dateStr = new Date(m.movementDate).toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 text-slate-600 font-mono whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{dateStr}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{prod?.nameAr || m.productId}</div>
                        <div className="font-mono text-[10px] text-slate-400">{prod?.sku || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <span>{wh?.nameAr || m.warehouseId}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                        {locPath || <span className="text-slate-400">عام</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {renderMovementTypeBadge(m.movementType, m.sourceType)}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {m.quantity}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {uom?.nameAr || m.uomId}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-800">
                        {m.baseQuantity} {baseUom?.nameAr}
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                        {m.relatedMovementId ? (
                          <span className="inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200" title={`الحركة المرتبطة: ${m.relatedMovementId}`}>
                            <Link2 className="w-2.5 h-2.5 text-indigo-500" />
                            <span>{m.relatedMovementId.slice(0, 8)}...</span>
                          </span>
                        ) : m.sourceType ? (
                          <span className="text-slate-600 font-medium">{m.sourceType}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Layers className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-700">لا توجد حركات مخزنية مسجلة</p>
                      <p className="text-xs text-slate-400">
                        سجل المخزون غير قابل للتعديل المباشر. الحركات الجديدة ستظهر هنا بترتيب زمني فوري.
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
