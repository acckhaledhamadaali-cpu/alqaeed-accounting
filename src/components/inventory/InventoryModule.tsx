import React, { useState } from 'react';
import { 
  Warehouse, 
  InventoryLocation, 
  StockMovement, 
  StockBalanceRecord, 
  CreateStockMovementInput,
  TransferStockInput,
  CreateWarehouseInput,
  UpdateWarehouseInput,
  CreateLocationInput,
  UpdateLocationInput
} from '../../types/inventory';
import { Product, UnitOfMeasure } from '../../types/product';
import { InventoryDashboard } from './InventoryDashboard';
import { StockBalanceView } from './StockBalanceView';
import { MovementHistoryView } from './MovementHistoryView';
import { WarehousesView } from './WarehousesView';
import { LocationsView } from './LocationsView';
import { CreateMovementModal } from './CreateMovementModal';
import { StockTransferModal } from './StockTransferModal';
import { 
  LayoutDashboard, 
  Boxes, 
  Layers, 
  Building2, 
  MapPin, 
  ArrowLeftRight, 
  Plus 
} from 'lucide-react';

export type InventoryTab = 'dashboard' | 'balance' | 'ledger' | 'warehouses' | 'locations';

interface InventoryModuleProps {
  products: Product[];
  warehouses: Warehouse[];
  locations: InventoryLocation[];
  movements: StockMovement[];
  stockBalances: StockBalanceRecord[];
  uoms: UnitOfMeasure[];
  onAddWarehouse: (data: CreateWarehouseInput) => { success: boolean; error?: string };
  onUpdateWarehouse: (id: string, data: UpdateWarehouseInput) => { success: boolean; error?: string };
  onToggleWarehouseStatus: (id: string) => { success: boolean; error?: string };
  onAddLocation: (data: CreateLocationInput) => { success: boolean; error?: string };
  onUpdateLocation: (id: string, data: UpdateLocationInput) => { success: boolean; error?: string };
  onToggleLocationStatus: (id: string) => { success: boolean; error?: string };
  onCreateMovement: (input: CreateStockMovementInput) => { success: boolean; error?: string };
  onExecuteTransfer: (input: TransferStockInput) => { success: boolean; error?: string };
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  products,
  warehouses,
  locations,
  movements,
  stockBalances,
  uoms,
  onAddWarehouse,
  onUpdateWarehouse,
  onToggleWarehouseStatus,
  onAddLocation,
  onUpdateLocation,
  onToggleLocationStatus,
  onCreateMovement,
  onExecuteTransfer,
}) => {
  const [activeTab, setActiveTab] = useState<InventoryTab>('dashboard');
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      
      {/* Sub-navigation Tabs & Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-lg p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>لوحة المؤشرات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('balance')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'balance'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>أرصدة المخزون</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'ledger'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>سجل الحركات (Ledger)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('warehouses')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'warehouses'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>المستودعات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('locations')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'locations'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>مواقع التخزين</span>
          </button>
        </div>

        {/* Global Operational Movement Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsTransferModalOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-md text-xs font-semibold cursor-pointer shadow-2xs"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600" />
            <span>مناقلة مخزنية</span>
          </button>
          
          <button
            type="button"
            onClick={() => setIsMovementModalOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تسجيل حركة مخزنية</span>
          </button>
        </div>

      </div>

      {/* Main Tab Content */}
      <div>
        {activeTab === 'dashboard' && (
          <InventoryDashboard
            products={products}
            warehouses={warehouses}
            locations={locations}
            movements={movements}
            stockBalances={stockBalances}
            onNavigateTab={(tab) => {
              if (tab === 'create_movement') {
                setIsMovementModalOpen(true);
              } else if (tab === 'transfer') {
                setIsTransferModalOpen(true);
              } else {
                setActiveTab(tab);
              }
            }}
          />
        )}

        {activeTab === 'balance' && (
          <StockBalanceView
            balances={stockBalances}
            products={products}
            warehouses={warehouses}
            locations={locations}
            uoms={uoms}
            onOpenCreateMovement={() => setIsMovementModalOpen(true)}
            onOpenTransfer={() => setIsTransferModalOpen(true)}
          />
        )}

        {activeTab === 'ledger' && (
          <MovementHistoryView
            movements={movements}
            products={products}
            warehouses={warehouses}
            locations={locations}
            uoms={uoms}
            onOpenCreateMovement={() => setIsMovementModalOpen(true)}
          />
        )}

        {activeTab === 'warehouses' && (
          <WarehousesView
            warehouses={warehouses}
            locations={locations}
            onAddWarehouse={onAddWarehouse}
            onUpdateWarehouse={onUpdateWarehouse}
            onToggleStatus={onToggleWarehouseStatus}
          />
        )}

        {activeTab === 'locations' && (
          <LocationsView
            locations={locations}
            warehouses={warehouses}
            onAddLocation={onAddLocation}
            onUpdateLocation={onUpdateLocation}
            onToggleStatus={onToggleLocationStatus}
          />
        )}
      </div>

      {/* Create Movement Modal */}
      <CreateMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        onSubmit={onCreateMovement}
        products={products}
        warehouses={warehouses}
        locations={locations}
        uoms={uoms}
        currentMovements={movements}
      />

      {/* Stock Transfer Modal */}
      <StockTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSubmit={onExecuteTransfer}
        products={products}
        warehouses={warehouses}
        locations={locations}
        uoms={uoms}
        currentMovements={movements}
      />

    </div>
  );
};
