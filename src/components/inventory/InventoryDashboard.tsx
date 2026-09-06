import React, { useState } from 'react';
import { 
  Warehouse, 
  InventoryLocation, 
  StockMovement, 
  StockBalanceRecord 
} from '../../types/inventory';
import { Product } from '../../types/product';
import { runModule02Tests, TestResultItem } from '../../data/inventoryTestSuite';
import { 
  Building2, 
  MapPin, 
  ArrowDownRight, 
  ArrowUpRight, 
  ArrowLeftRight, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Boxes, 
  Layers 
} from 'lucide-react';

interface InventoryDashboardProps {
  products: Product[];
  warehouses: Warehouse[];
  locations: InventoryLocation[];
  movements: StockMovement[];
  stockBalances: StockBalanceRecord[];
  onNavigateTab: (tab: 'balance' | 'ledger' | 'warehouses' | 'locations' | 'create_movement' | 'transfer') => void;
}

export const InventoryDashboard: React.FC<InventoryDashboardProps> = ({
  warehouses,
  locations,
  movements,
  stockBalances,
  onNavigateTab,
}) => {
  const [testResults, setTestResults] = useState<TestResultItem[] | null>(null);

  const activeWarehousesCount = warehouses.filter((w) => w.status === 'active').length;
  const activeLocationsCount = locations.filter((l) => l.status === 'active').length;

  const receiptsCount = movements.filter((m) => m.movementType === 'receipt').length;
  const issuesCount = movements.filter((m) => m.movementType === 'issue').length;
  const transfersCount = movements.filter(
    (m) => m.movementType === 'transfer_in' || m.movementType === 'transfer_out'
  ).length;
  const adjustmentsCount = movements.filter((m) => m.movementType === 'adjustment').length;

  const positivePositionsCount = stockBalances.filter((b) => b.baseQuantity > 0).length;

  const handleRunTests = () => {
    const results = runModule02Tests();
    setTestResults(results);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Metric Cards (Real Ledger Data Only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">المستودعات النشطة</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-700">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{activeWarehousesCount}</span>
            <span className="text-xs text-slate-400 font-mono">/ {warehouses.length} مستودع</span>
          </div>
          <button 
            type="button"
            onClick={() => onNavigateTab('warehouses')}
            className="mt-3 text-xs text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <span>إدارة المستودعات</span>
            <span>&larr;</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">مواقع التخزين النشطة</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-700">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{activeLocationsCount}</span>
            <span className="text-xs text-slate-400 font-mono">/ {locations.length} موقع</span>
          </div>
          <button 
            type="button"
            onClick={() => onNavigateTab('locations')}
            className="mt-3 text-xs text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <span>شجرة المواقع</span>
            <span>&larr;</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">إجمالي قيود Ledger</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-700">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{movements.length}</span>
            <span className="text-xs text-slate-400">حركة مسجلة</span>
          </div>
          <button 
            type="button"
            onClick={() => onNavigateTab('ledger')}
            className="mt-3 text-xs text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <span>سجل الحركات (Ledger)</span>
            <span>&larr;</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">الأرصدة الموجبة المتوفرة</span>
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-700">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{positivePositionsCount}</span>
            <span className="text-xs text-slate-400">موقع مخزني</span>
          </div>
          <button 
            type="button"
            onClick={() => onNavigateTab('balance')}
            className="mt-3 text-xs text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <span>جدول الأرصدة</span>
            <span>&larr;</span>
          </button>
        </div>

      </div>

      {/* Movement Breakdown & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ledger Breakdown */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-1">
            تفصيل حركات سجل المخزون (Ledger Composition)
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            توزيع حركات المستودعات المسجلة حسب نوع الحركة
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>استلام (Receipt)</span>
              </div>
              <div className="mt-2 text-xl font-bold font-mono text-slate-900">{receiptsCount}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-rose-700 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>صرف (Issue)</span>
              </div>
              <div className="mt-2 text-xl font-bold font-mono text-slate-900">{issuesCount}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-semibold">
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>مناقلات (Transfers)</span>
              </div>
              <div className="mt-2 text-xl font-bold font-mono text-slate-900">{transfersCount}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold">
                <Boxes className="w-3.5 h-3.5" />
                <span>تسويات (Adjust)</span>
              </div>
              <div className="mt-2 text-xl font-bold font-mono text-slate-900">{adjustmentsCount}</div>
            </div>
          </div>

          {/* Empty State if 0 movements */}
          {movements.length === 0 && (
            <div className="mt-4 p-6 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
              <p className="text-xs text-slate-500 font-medium">
                سجل الحركات (Ledger) فارغ حالياً. لا توجد أي حركات استلام أو صرف أو مناقلة مسجلة.
              </p>
              <div className="mt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigateTab('create_movement')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  تسجيل حركة مخزنية
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('warehouses')}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold cursor-pointer"
                >
                  إضافة مستودع
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Automated Architecture Test Suite Panel */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-slate-900">
                فحص القواعد الصارمة لـ Module 02
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-700 rounded border border-slate-200">
                26 اختبار معماري
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              التحقق التلقائي من القواعد الصارمة: منع المخزون السالب، عزل الخدمات، الترابط الذري للمناقلات، عزل اتجاه التسوية، ومنع الحلقات الهرمية.
            </p>

            <button
              type="button"
              onClick={handleRunTests}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>تشغيل حزمة الاختبارات المعمارية (26 فحصاً شمولياً)</span>
            </button>
          </div>

          {testResults && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">نتيجة الفحص:</span>
                <span className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                  testResults.every((t) => t.passed)
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {testResults.filter((t) => t.passed).length} / {testResults.length} ناجح
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-[11px]">
                {testResults.map((t) => (
                  <div key={t.id} className="flex items-start gap-1.5 p-1.5 rounded bg-slate-50 border border-slate-100">
                    {t.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-bold text-slate-800">{t.id}: {t.name}</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">{t.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
