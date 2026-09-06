import React, { useState } from 'react';
import { Warehouse, InventoryLocation } from '../../types/inventory';
import { 
  Building2, 
  Plus, 
  Archive, 
  RotateCcw, 
  Edit, 
  X, 
  AlertTriangle,
  Search 
} from 'lucide-react';

interface WarehousesViewProps {
  warehouses: Warehouse[];
  locations: InventoryLocation[];
  onAddWarehouse: (data: { code: string; nameAr: string; nameEn?: string }) => { success: boolean; error?: string };
  onUpdateWarehouse: (id: string, data: { nameAr: string; nameEn?: string }) => { success: boolean; error?: string };
  onToggleStatus: (id: string) => { success: boolean; error?: string };
}

export const WarehousesView: React.FC<WarehousesViewProps> = ({
  warehouses,
  locations,
  onAddWarehouse,
  onUpdateWarehouse,
  onToggleStatus,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState({ code: '', nameAr: '', nameEn: '' });
  const [formError, setFormError] = useState<string | null>(null);

  // Archive Confirm Modal
  const [warehouseToToggle, setWarehouseToToggle] = useState<Warehouse | null>(null);

  const filteredWarehouses = warehouses.filter((w) => {
    if (statusFilter !== 'all' && w.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchName = w.nameAr.toLowerCase().includes(q);
      const matchEn = (w.nameEn || '').toLowerCase().includes(q);
      const matchCode = w.code.toLowerCase().includes(q);
      if (!matchName && !matchEn && !matchCode) return false;
    }
    return true;
  });

  const handleOpenAddModal = () => {
    setEditingWarehouse(null);
    setFormData({ code: '', nameAr: '', nameEn: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (w: Warehouse) => {
    setEditingWarehouse(w);
    setFormData({ code: w.code, nameAr: w.nameAr, nameEn: w.nameEn || '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (editingWarehouse) {
      const res = onUpdateWarehouse(editingWarehouse.id, {
        nameAr: formData.nameAr,
        nameEn: formData.nameEn || undefined,
      });
      if (!res.success) {
        setFormError(res.error || 'حدث خطأ أثناء تعديل المستودع.');
        return;
      }
    } else {
      const res = onAddWarehouse({
        code: formData.code,
        nameAr: formData.nameAr,
        nameEn: formData.nameEn || undefined,
      });
      if (!res.success) {
        setFormError(res.error || 'حدث خطأ أثناء إضافة المستودع.');
        return;
      }
    }

    setIsModalOpen(false);
  };

  const handleConfirmToggle = () => {
    if (!warehouseToToggle) return;
    onToggleStatus(warehouseToToggle.id);
    setWarehouseToToggle(null);
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
              placeholder="البحث باسم المستودع أو الرمز..."
              className="w-full pr-9 pl-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-slate-800 text-slate-900"
            />
          </div>

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
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>إضافة مستودع جديد</span>
        </button>

      </div>

      {/* Warehouses Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">رمز المستودع (Code)</th>
                <th className="px-4 py-3">اسم المستودع (عربي)</th>
                <th className="px-4 py-3">اسم المستودع (إنجليزي)</th>
                <th className="px-4 py-3">المواقع التابعة</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredWarehouses.length > 0 ? (
                filteredWarehouses.map((w) => {
                  const locCount = locations.filter((l) => l.warehouseId === w.id).length;
                  return (
                    <tr key={w.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {w.code}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {w.nameAr}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {w.nameEn || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono">
                        {locCount} موقع
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          w.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {w.status === 'active' ? 'نشط' : 'مؤرشف'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-left">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(w)}
                            className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 cursor-pointer"
                            title="تعديل بيانات المستودع"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setWarehouseToToggle(w)}
                            className={`p-1 rounded cursor-pointer ${
                              w.status === 'active'
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={w.status === 'active' ? 'أرشفة المستودع' : 'إعادة تنشيط المستودع'}
                          >
                            {w.status === 'active' ? (
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
                      <Building2 className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-700">لا توجد مستودعات مسجلة</p>
                      <p className="text-xs text-slate-400">
                        قم بإضافة المستودع الرئيسي أولاً لتتمكن من تسجيل حركات المخزون والمناقلات.
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
                {editingWarehouse ? 'تعديل بيانات المستودع' : 'إضافة مستودع جديد'}
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

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  رمز المستودع (Code) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  dir="ltr"
                  disabled={!!editingWarehouse}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="مثال: WH-MAIN"
                  className={`w-full px-3 py-2 border rounded font-mono text-slate-900 text-left uppercase ${
                    editingWarehouse
                      ? 'bg-slate-100 border-slate-200 cursor-not-allowed text-slate-500'
                      : 'bg-white border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-800'
                  }`}
                  required
                />
                {editingWarehouse && (
                  <p className="text-[11px] text-slate-400">الرمز فريد ودائم ولا يمكن تغييره بعد الإنشاء.</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  اسم المستودع (عربي) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="مثال: المستودع المركزي"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">
                  اسم المستودع (إنجليزي)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="e.g. Central Warehouse"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-800 text-left"
                />
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
                  {editingWarehouse ? 'حفظ التعديلات' : 'إضافة المستودع'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive / Reactivate Confirmation Modal */}
      {warehouseToToggle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-lg border border-slate-200 overflow-hidden p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg shrink-0 ${
                warehouseToToggle.status === 'active' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {warehouseToToggle.status === 'active' ? 'تأكيد أرشفة المستودع' : 'تأكيد إعادة تنشيط المستودع'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {warehouseToToggle.status === 'active' ? (
                    <>
                      أرشفة المستودع <span className="font-bold text-slate-800">"{warehouseToToggle.nameAr}"</span> ستؤدي تلقائياً إلى أرشفة كافة مواقع التخزين التابعة له ومنع إنشاء أي حركات جديدة عليه. الحركات التاريخية ستبقى محفوظة في الـ Ledger دون مساس.
                    </>
                  ) : (
                    <>
                      هل تريد إعادة تنشيط المستودع <span className="font-bold text-slate-800">"{warehouseToToggle.nameAr}"</span>؟
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setWarehouseToToggle(null)}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold text-slate-700 cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleConfirmToggle}
                className={`px-4 py-1.5 text-white rounded text-xs font-semibold cursor-pointer ${
                  warehouseToToggle.status === 'active'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {warehouseToToggle.status === 'active' ? 'تأكيد الأرشفة' : 'إعادة التنشيط'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
