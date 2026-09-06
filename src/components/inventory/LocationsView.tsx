import React, { useState } from 'react';
import { InventoryLocation, Warehouse } from '../../types/inventory';
import { buildLocationPath } from '../../data/inventoryService';
import { 
  MapPin, 
  Plus, 
  Archive, 
  RotateCcw, 
  Edit, 
  X, 
  Building2, 
  Search, 
  CornerDownLeft, 
  AlertTriangle 
} from 'lucide-react';

interface LocationsViewProps {
  locations: InventoryLocation[];
  warehouses: Warehouse[];
  onAddLocation: (data: {
    warehouseId: string;
    code: string;
    nameAr: string;
    nameEn?: string;
    parentId?: string | null;
  }) => { success: boolean; error?: string };
  onUpdateLocation: (
    id: string,
    data: { nameAr: string; nameEn?: string; parentId?: string | null }
  ) => { success: boolean; error?: string };
  onToggleStatus: (id: string) => { success: boolean; error?: string };
}

export const LocationsView: React.FC<LocationsViewProps> = ({
  locations,
  warehouses,
  onAddLocation,
  onUpdateLocation,
  onToggleStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<InventoryLocation | null>(null);
  const [formData, setFormData] = useState<{
    warehouseId: string;
    code: string;
    nameAr: string;
    nameEn: string;
    parentId: string;
  }>({
    warehouseId: warehouses.find((w) => w.status === 'active')?.id || '',
    code: '',
    nameAr: '',
    nameEn: '',
    parentId: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Archive Confirm Modal
  const [locationToToggle, setLocationToToggle] = useState<InventoryLocation | null>(null);

  const warehouseMap = new Map<string, Warehouse>(warehouses.map((w) => [w.id, w]));

  const filteredLocations = locations.filter((loc) => {
    if (selectedWarehouseId !== 'all' && loc.warehouseId !== selectedWarehouseId) {
      return false;
    }
    if (statusFilter !== 'all' && loc.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchName = loc.nameAr.toLowerCase().includes(q);
      const matchCode = loc.code.toLowerCase().includes(q);
      const matchPath = buildLocationPath(loc.id, locations).toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchPath) return false;
    }
    return true;
  });

  // Candidate parents for the form (must belong to same warehouse, active, and not self)
  const candidateParents = locations.filter(
    (l) =>
      l.warehouseId === formData.warehouseId &&
      l.status === 'active' &&
      (!editingLocation || l.id !== editingLocation.id)
  );

  const handleOpenAddModal = () => {
    setEditingLocation(null);
    const activeWh = warehouses.find((w) => w.status === 'active');
    setFormData({
      warehouseId: activeWh ? activeWh.id : '',
      code: '',
      nameAr: '',
      nameEn: '',
      parentId: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (loc: InventoryLocation) => {
    setEditingLocation(loc);
    setFormData({
      warehouseId: loc.warehouseId,
      code: loc.code,
      nameAr: loc.nameAr,
      nameEn: loc.nameEn || '',
      parentId: loc.parentId || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (editingLocation) {
      const res = onUpdateLocation(editingLocation.id, {
        nameAr: formData.nameAr,
        nameEn: formData.nameEn || undefined,
        parentId: formData.parentId ? formData.parentId : null,
      });
      if (!res.success) {
        setFormError(res.error || 'حدث خطأ أثناء تعديل الموقع.');
        return;
      }
    } else {
      const res = onAddLocation({
        warehouseId: formData.warehouseId,
        code: formData.code,
        nameAr: formData.nameAr,
        nameEn: formData.nameEn || undefined,
        parentId: formData.parentId ? formData.parentId : null,
      });
      if (!res.success) {
        setFormError(res.error || 'حدث خطأ أثناء إضافة الموقع.');
        return;
      }
    }

    setIsModalOpen(false);
  };

  const handleConfirmToggle = () => {
    if (!locationToToggle) return;
    const res = onToggleStatus(locationToToggle.id);
    if (!res.success) {
      alert(res.error || 'تعذر تغيير حالة الموقع.');
    }
    setLocationToToggle(null);
  };

  return (
    <div className="space-y-4">
      
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث باسم الموقع أو الرمز أو المسار الهرمي..."
              className="w-full pr-9 pl-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 text-slate-900"
            />
          </div>

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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'archived')}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-800"
          >
            <option value="all">كافة الحالات</option>
            <option value="active">نشط فقط</option>
            <option value="archived">مؤرشف فقط</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          disabled={warehouses.filter((w) => w.status === 'active').length === 0}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold shrink-0 transition-colors ${
            warehouses.filter((w) => w.status === 'active').length === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
          }`}
          title={warehouses.filter((w) => w.status === 'active').length === 0 ? 'يجب إضافة مستودع نشط أولاً' : ''}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إضافة موقع تخزين</span>
        </button>

      </div>

      {/* Locations Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">المستودع</th>
                <th className="px-4 py-3">رمز الموقع (Code)</th>
                <th className="px-4 py-3">اسم الموقع (عربي)</th>
                <th className="px-4 py-3">المسار الهرمي (Hierarchy)</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLocations.length > 0 ? (
                filteredLocations.map((loc) => {
                  const wh = warehouseMap.get(loc.warehouseId);
                  const path = buildLocationPath(loc.id, locations);
                  return (
                    <tr key={loc.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{wh?.nameAr || '—'}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">
                        {loc.code}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {loc.nameAr}
                        {loc.nameEn && <span className="text-slate-400 text-[11px] mr-1">({loc.nameEn})</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                        <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          <CornerDownLeft className="w-3 h-3 text-slate-400" />
                          <span>{path}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          loc.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {loc.status === 'active' ? 'نشط' : 'مؤرشف'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-left">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(loc)}
                            className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 cursor-pointer"
                            title="تعديل الموقع"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setLocationToToggle(loc)}
                            className={`p-1 rounded cursor-pointer ${
                              loc.status === 'active'
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={loc.status === 'active' ? 'أرشفة الموقع' : 'إعادة تنشيط الموقع'}
                          >
                            {loc.status === 'active' ? (
                              <Archive className="w-3.5 h-3.5" />
                            ) : (
                              <RotateCcw className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <MapPin className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-700">لا توجد مواقع تخزين مسجلة</p>
                      <p className="text-xs text-slate-400">
                        مواقع التخزين اختيارية وتتيح تنظيم المستودعات إلى أرفف وحجرات وممرات هرمية.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingLocation ? 'تعديل موقع التخزين' : 'إضافة موقع تخزين جديد'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-700 font-medium">
                  {formError}
                </div>
              )}

              {/* Warehouse Selection */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  المستودع التابع له <span className="text-rose-600">*</span>
                </label>
                <select
                  disabled={!!editingLocation}
                  value={formData.warehouseId}
                  onChange={(e) =>
                    setFormData({ ...formData, warehouseId: e.target.value, parentId: '' })
                  }
                  className={`w-full px-3 py-2 border rounded text-slate-900 ${
                    editingLocation
                      ? 'bg-slate-100 border-slate-200 cursor-not-allowed'
                      : 'bg-white border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800'
                  }`}
                  required
                >
                  {warehouses
                    .filter((w) => w.status === 'active' || (editingLocation && w.id === editingLocation.warehouseId))
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.nameAr} ({w.code})
                      </option>
                    ))}
                </select>
                {editingLocation && (
                  <p className="text-[11px] text-slate-400">لا يمكن نقل الموقع لمستودع آخر بعد الإنشاء.</p>
                )}
              </div>

              {/* Code */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  رمز الموقع (Code) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  disabled={!!editingLocation}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="مثال: SEC-A / BIN-01"
                  className={`w-full px-3 py-2 border rounded font-mono text-slate-900 text-left uppercase ${
                    editingLocation
                      ? 'bg-slate-100 border-slate-200 cursor-not-allowed text-slate-500'
                      : 'bg-white border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800'
                  }`}
                  required
                />
              </div>

              {/* Arabic Name */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  اسم الموقع (عربي) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="مثال: ممر 1 / الرف الثالث"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800"
                  required
                />
              </div>

              {/* English Name */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  اسم الموقع (إنجليزي)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="e.g. Aisle 1 / Shelf 3"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 text-left"
                />
              </div>

              {/* Parent Location within the same Warehouse */}
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  الموقع الأب (الهيكل الهرمي)
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800"
                >
                  <option value="">لا يوجد أب (مستوى رئيسي أول)</option>
                  {candidateParents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {buildLocationPath(p.id, locations)} ({p.code})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  يجب أن يتبع الموقع الأب لنفس المستودع المحدد.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded text-slate-700 font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold cursor-pointer"
                >
                  {editingLocation ? 'حفظ التعديلات' : 'إضافة الموقع'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive / Reactivate Confirmation Modal */}
      {locationToToggle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-lg border border-slate-200 overflow-hidden p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg shrink-0 ${
                locationToToggle.status === 'active' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {locationToToggle.status === 'active' ? 'تأكيد أرشفة الموقع' : 'تأكيد إعادة تنشيط الموقع'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {locationToToggle.status === 'active' ? (
                    <>
                      أرشفة الموقع <span className="font-bold text-slate-800">"{locationToToggle.nameAr}"</span> ستؤدي إلى أرشفة كافة المواقع الفرعية التابعة له هرمياً ومنع الحركات الجديدة عليه.
                    </>
                  ) : (
                    <>
                      هل تريد إعادة تنشيط الموقع <span className="font-bold text-slate-800">"{locationToToggle.nameAr}"</span>؟
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setLocationToToggle(null)}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold text-slate-700 cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleConfirmToggle}
                className={`px-4 py-1.5 text-white rounded text-xs font-semibold cursor-pointer ${
                  locationToToggle.status === 'active'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {locationToToggle.status === 'active' ? 'تأكيد الأرشفة' : 'إعادة التنشيط'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
