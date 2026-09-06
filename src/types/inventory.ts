import { EntityStatus } from './product';

/**
 * MODULE 02 — INVENTORY & STOCK MOVEMENTS TYPES
 * 
 * PostgreSQL-Ready Relational Types:
 * - Pure IDs for relationships (productId, warehouseId, locationId, uomId)
 * - Immutable Ledger Architecture (StockMovement)
 * - Derived Stock Balances (never stored on Product, Warehouse, or Location)
 * - Strict Separation: No Costing, No Accounting, No Purchasing, No POS
 */

export interface Warehouse {
  id: string;
  code: string;
  nameAr: string;
  nameEn?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLocation {
  id: string;
  warehouseId: string;
  code: string;
  nameAr: string;
  nameEn?: string;
  parentId?: string | null;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export type StockMovementType =
  | 'receipt'
  | 'issue'
  | 'transfer_in'
  | 'transfer_out'
  | 'adjustment';

export type AdjustmentDirection = 'increase' | 'decrease';

export interface StockMovement {
  id: string;
  productId: string;
  warehouseId: string;
  locationId?: string;

  movementType: StockMovementType;

  quantity: number;
  uomId: string;

  baseQuantity: number;
  baseUomId: string;

  sourceType?: string;
  sourceId?: string;

  relatedMovementId?: string;

  movementDate: string;
  createdAt: string;
}

export interface StockBalanceRecord {
  productId: string;
  warehouseId: string;
  locationId?: string;
  baseQuantity: number;
  baseUomId: string;
}

export interface CreateWarehouseInput {
  code: string;
  nameAr: string;
  nameEn?: string;
}

export interface UpdateWarehouseInput {
  nameAr: string;
  nameEn?: string;
}

export interface CreateLocationInput {
  warehouseId: string;
  code: string;
  nameAr: string;
  nameEn?: string;
  parentId?: string | null;
}

export interface UpdateLocationInput {
  nameAr: string;
  nameEn?: string;
  parentId?: string | null;
}

export interface CreateStockMovementInput {
  productId: string;
  warehouseId: string;
  locationId?: string;
  movementType: StockMovementType;
  adjustmentDirection?: AdjustmentDirection; // Used when movementType === 'adjustment'
  quantity: number;
  uomId: string;
  movementDate: string;
  sourceType?: string;
  sourceId?: string;
}

export interface TransferStockInput {
  productId: string;
  sourceWarehouseId: string;
  sourceLocationId?: string;
  destinationWarehouseId: string;
  destinationLocationId?: string;
  quantity: number;
  uomId: string;
  movementDate: string;
}

export type InventoryActiveTab =
  | 'dashboard'
  | 'balance'
  | 'ledger'
  | 'warehouses'
  | 'locations'
  | 'create_movement'
  | 'transfer';
