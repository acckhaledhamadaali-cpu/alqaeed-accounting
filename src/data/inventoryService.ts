import { Product, UnitOfMeasure } from '../types/product';
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
} from '../types/inventory';

/**
 * MODULE 02 — INVENTORY & STOCK MOVEMENTS SERVICE
 * 
 * Strict Domain Rules:
 * 1. Ledger is the ONLY Source of Truth (no product.stock or warehouse.stock shortcuts)
 * 2. Absolute Prevention of Negative Stock (outbound rejected if requested > available)
 * 3. Services (type === 'service') are strictly forbidden from stock movements
 * 4. Archived Master Data (Product, Warehouse, Location) cannot be used in new movements
 * 5. Location must strictly belong to the specified Warehouse
 * 6. Transfers are Atomic (dual movements linked via mutual relatedMovementId)
 * 7. Base UoM support with exact quantity mapping
 * 8. Zero Mock/Fake/Seed Data
 */

export const INITIAL_WAREHOUSES: Warehouse[] = [];
export const INITIAL_LOCATIONS: InventoryLocation[] = [];
export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [];

export interface ValidationResult<T> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Calculate the net stock balance from the immutable ledger.
 * Stock Balance = Sum(Inbound Base Quantity) - Sum(Outbound Base Quantity)
 */
export function calculateStockBalance(
  movements: StockMovement[],
  productId?: string,
  warehouseId?: string,
  locationId?: string
): number {
  return movements.reduce((acc, m) => {
    if (productId && m.productId !== productId) return acc;
    if (warehouseId && m.warehouseId !== warehouseId) return acc;
    if (locationId !== undefined && m.locationId !== locationId) return acc;

    const isOutbound =
      m.movementType === 'issue' ||
      m.movementType === 'transfer_out' ||
      (m.movementType === 'adjustment' && m.sourceType === 'decrease');

    const isInbound =
      m.movementType === 'receipt' ||
      m.movementType === 'transfer_in' ||
      (m.movementType === 'adjustment' && m.sourceType !== 'decrease');

    if (isInbound) {
      return acc + m.baseQuantity;
    } else if (isOutbound) {
      return acc - m.baseQuantity;
    }

    return acc;
  }, 0);
}

/**
 * Get available stock for a specific product at a specific warehouse and optional location.
 */
export function getAvailableStock(
  movements: StockMovement[],
  productId: string,
  warehouseId: string,
  locationId?: string
): number {
  return calculateStockBalance(movements, productId, warehouseId, locationId);
}

/**
 * Get aggregated balances for all product-warehouse-location combinations
 */
export function getAllStockBalances(
  movements: StockMovement[],
  products: Product[]
): StockBalanceRecord[] {
  const balanceMap = new Map<string, StockBalanceRecord>();
  const productMap = new Map<string, Product>(products.map((p) => [p.id, p]));

  for (const m of movements) {
    const key = `${m.productId}:::${m.warehouseId}:::${m.locationId || 'NO_LOC'}`;
    const product = productMap.get(m.productId);
    const baseUomId = product?.baseUomId || m.baseUomId;

    const isOutbound =
      m.movementType === 'issue' ||
      m.movementType === 'transfer_out' ||
      (m.movementType === 'adjustment' && m.sourceType === 'decrease');

    const delta = isOutbound ? -m.baseQuantity : m.baseQuantity;

    const existing = balanceMap.get(key);
    if (existing) {
      existing.baseQuantity += delta;
    } else {
      balanceMap.set(key, {
        productId: m.productId,
        warehouseId: m.warehouseId,
        locationId: m.locationId,
        baseQuantity: delta,
        baseUomId,
      });
    }
  }

  return Array.from(balanceMap.values());
}

/**
 * Validates and creates a single Stock Movement.
 * Enforces negative stock prevention, service exclusion, archive checks, and location integrity.
 */
export function executeStockMovement(
  input: CreateStockMovementInput,
  products: Product[],
  warehouses: Warehouse[],
  locations: InventoryLocation[],
  uoms: UnitOfMeasure[],
  currentMovements: StockMovement[]
): ValidationResult<StockMovement> {
  // 1. Quantity Validation (> 0, finite, valid number)
  if (
    typeof input.quantity !== 'number' ||
    !Number.isFinite(input.quantity) ||
    isNaN(input.quantity) ||
    input.quantity <= 0
  ) {
    return {
      success: false,
      error: 'الكمية يجب أن تكون رقماً صالحاً وموجباً أكبر من الصفر.',
    };
  }

  // 2. Product Validation
  const product = products.find((p) => p.id === input.productId);
  if (!product) {
    return { success: false, error: 'الصنف المحدد غير موجود في سجل الأصناف.' };
  }

  if (product.type === 'service') {
    return { success: false, error: 'الخدمات لا تخضع لحركات المخزون.' };
  }

  if (product.status === 'archived') {
    return { success: false, error: 'الصنف المحدد مؤرشف ولا يمكن إنشاء حركات مخزنية له.' };
  }

  // 3. Warehouse Validation
  const warehouse = warehouses.find((w) => w.id === input.warehouseId);
  if (!warehouse) {
    return { success: false, error: 'المستودع المحدد غير موجود.' };
  }

  if (warehouse.status === 'archived') {
    return { success: false, error: 'المستودع المحدد مؤرشف ولا يمكن إنشاء حركات جديدة عليه.' };
  }

  // 4. Location Validation (if specified)
  if (input.locationId) {
    const loc = locations.find((l) => l.id === input.locationId);
    if (!loc) {
      return { success: false, error: 'موقع التخزين المحدد غير موجود.' };
    }

    if (loc.status === 'archived') {
      return { success: false, error: 'موقع التخزين المحدد مؤرشف ولا يمكن إنشاء حركات عليه.' };
    }

    if (loc.warehouseId !== input.warehouseId) {
      return {
        success: false,
        error: 'موقع التخزين المحدد لا يتبع للمستودع المختار.',
      };
    }
  }

  // 5. UoM Validation
  const uom = uoms.find((u) => u.id === input.uomId);
  if (!uom) {
    return { success: false, error: 'وحدة القياس المحددة غير موجودة.' };
  }

  if (input.uomId !== product.baseUomId) {
    return {
      success: false,
      error: 'يجب استخدام وحدة القياس الأساسية للصنف في حركات المخزون.',
    };
  }

  const baseQuantity = input.quantity;
  const baseUomId = product.baseUomId;

  // 6. Movement Direction & Negative Stock Prevention
  const isOutbound =
    input.movementType === 'issue' ||
    input.movementType === 'transfer_out' ||
    (input.movementType === 'adjustment' && input.adjustmentDirection === 'decrease');

  if (isOutbound) {
    const availableStock = getAvailableStock(
      currentMovements,
      input.productId,
      input.warehouseId,
      input.locationId
    );

    if (baseQuantity > availableStock) {
      return {
        success: false,
        error: `الرصيد المتاح (${availableStock} ${uom.nameAr}) لا يكفي لتنفيذ الحركة المطلوبة (${baseQuantity} ${uom.nameAr}).`,
      };
    }
  }

  const now = new Date().toISOString();
  const movementId = crypto.randomUUID();

  let finalSourceType = input.sourceType;
  if (input.movementType === 'adjustment') {
    finalSourceType = input.adjustmentDirection === 'decrease' ? 'decrease' : 'increase';
  }

  const newMovement: StockMovement = {
    id: movementId,
    productId: input.productId,
    warehouseId: input.warehouseId,
    locationId: input.locationId || undefined,
    movementType: input.movementType,
    quantity: input.quantity,
    uomId: input.uomId,
    baseQuantity,
    baseUomId,
    sourceType: finalSourceType,
    sourceId: input.sourceId,
    movementDate: input.movementDate || now,
    createdAt: now,
  };

  return { success: true, data: newMovement };
}

/**
 * Validates and executes an Atomic Stock Transfer between two warehouses/locations.
 * Generates two linked movements: transfer_out and transfer_in.
 * Both movements succeed together or both fail.
 */
export function executeStockTransfer(
  input: TransferStockInput,
  products: Product[],
  warehouses: Warehouse[],
  locations: InventoryLocation[],
  uoms: UnitOfMeasure[],
  currentMovements: StockMovement[]
): ValidationResult<{ movementOut: StockMovement; movementIn: StockMovement }> {
  // 1. Quantity Validation (> 0, finite, valid number)
  if (
    typeof input.quantity !== 'number' ||
    !Number.isFinite(input.quantity) ||
    isNaN(input.quantity) ||
    input.quantity <= 0
  ) {
    return {
      success: false,
      error: 'الكمية المحولة يجب أن تكون رقماً صالحاً وموجباً أكبر من الصفر.',
    };
  }

  // 2. Prevent Source === Destination
  const isSameWarehouse = input.sourceWarehouseId === input.destinationWarehouseId;
  const isSameLocation = (input.sourceLocationId || '') === (input.destinationLocationId || '');
  if (isSameWarehouse && isSameLocation) {
    return {
      success: false,
      error: 'لا يمكن التحويل لنفس المستودع والموقع. يجب أن يختلف المستودع أو موقع التخزين.',
    };
  }

  // 3. Product Validation
  const product = products.find((p) => p.id === input.productId);
  if (!product) {
    return { success: false, error: 'الصنف المحدد غير موجود في سجل الأصناف.' };
  }

  if (product.type === 'service') {
    return { success: false, error: 'الخدمات لا تخضع لحركات المخزون أو المناقلات.' };
  }

  if (product.status === 'archived') {
    return { success: false, error: 'الصنف المحدد مؤرشف ولا يمكن نقله.' };
  }

  // 4. Source Warehouse & Location Validation
  const sourceWh = warehouses.find((w) => w.id === input.sourceWarehouseId);
  if (!sourceWh) {
    return { success: false, error: 'مستودع المصدر غير موجود.' };
  }
  if (sourceWh.status === 'archived') {
    return { success: false, error: 'مستودع المصدر مؤرشف ولا يمكن النقل منه.' };
  }

  if (input.sourceLocationId) {
    const sLoc = locations.find((l) => l.id === input.sourceLocationId);
    if (!sLoc) {
      return { success: false, error: 'موقع المصدر غير موجود.' };
    }
    if (sLoc.status === 'archived') {
      return { success: false, error: 'موقع المصدر مؤرشف ولا يمكن النقل منه.' };
    }
    if (sLoc.warehouseId !== input.sourceWarehouseId) {
      return { success: false, error: 'موقع المصدر لا يتبع لمستودع المصدر المحدد.' };
    }
  }

  // 5. Destination Warehouse & Location Validation
  const destWh = warehouses.find((w) => w.id === input.destinationWarehouseId);
  if (!destWh) {
    return { success: false, error: 'مستودع الوجهة غير موجود.' };
  }
  if (destWh.status === 'archived') {
    return { success: false, error: 'مستودع الوجهة مؤرشف ولا يمكن النقل إليه.' };
  }

  if (input.destinationLocationId) {
    const dLoc = locations.find((l) => l.id === input.destinationLocationId);
    if (!dLoc) {
      return { success: false, error: 'موقع الوجهة غير موجود.' };
    }
    if (dLoc.status === 'archived') {
      return { success: false, error: 'موقع الوجهة مؤرشف ولا يمكن النقل إليه.' };
    }
    if (dLoc.warehouseId !== input.destinationWarehouseId) {
      return { success: false, error: 'موقع الوجهة لا يتبع لمستودع الوجهة المحدد.' };
    }
  }

  // 6. UoM Validation
  const uom = uoms.find((u) => u.id === input.uomId);
  if (!uom) {
    return { success: false, error: 'وحدة القياس المحددة غير موجودة.' };
  }
  if (input.uomId !== product.baseUomId) {
    return {
      success: false,
      error: 'يجب استخدام وحدة القياس الأساسية للصنف في المناقلات المخزنية.',
    };
  }

  const baseQuantity = input.quantity;
  const baseUomId = product.baseUomId;

  // 7. Source Stock Check (Strict Negative Stock Prevention)
  const availableAtSource = getAvailableStock(
    currentMovements,
    input.productId,
    input.sourceWarehouseId,
    input.sourceLocationId
  );

  if (baseQuantity > availableAtSource) {
    return {
      success: false,
      error: `الرصيد المتاح في المصدر (${availableAtSource} ${uom.nameAr}) لا يكفي لنقل الكمية المطلوبة (${baseQuantity} ${uom.nameAr}).`,
    };
  }

  // 8. Atomic Creation with Linked IDs
  const now = new Date().toISOString();
  const outId = crypto.randomUUID();
  const inId = crypto.randomUUID();

  const movementOut: StockMovement = {
    id: outId,
    productId: input.productId,
    warehouseId: input.sourceWarehouseId,
    locationId: input.sourceLocationId || undefined,
    movementType: 'transfer_out',
    quantity: input.quantity,
    uomId: input.uomId,
    baseQuantity,
    baseUomId,
    sourceType: 'transfer',
    sourceId: inId,
    relatedMovementId: inId,
    movementDate: input.movementDate || now,
    createdAt: now,
  };

  const movementIn: StockMovement = {
    id: inId,
    productId: input.productId,
    warehouseId: input.destinationWarehouseId,
    locationId: input.destinationLocationId || undefined,
    movementType: 'transfer_in',
    quantity: input.quantity,
    uomId: input.uomId,
    baseQuantity,
    baseUomId,
    sourceType: 'transfer',
    sourceId: outId,
    relatedMovementId: outId,
    movementDate: input.movementDate || now,
    createdAt: now,
  };

  return {
    success: true,
    data: { movementOut, movementIn },
  };
}

/**
 * Warehouse Master Data Operations
 */
export function createWarehouse(
  input: CreateWarehouseInput,
  existingWarehouses: Warehouse[]
): ValidationResult<Warehouse> {
  const code = input.code.trim().toUpperCase();
  const nameAr = input.nameAr.trim();

  if (!code) {
    return { success: false, error: 'رمز المستودع مطلوب.' };
  }
  if (!nameAr) {
    return { success: false, error: 'اسم المستودع بالعربية مطلوب.' };
  }

  const codeExists = existingWarehouses.some((w) => w.code.toUpperCase() === code);
  if (codeExists) {
    return { success: false, error: `رمز المستودع (${code}) مستخدم مسبقاً.` };
  }

  const now = new Date().toISOString();
  const newWarehouse: Warehouse = {
    id: crypto.randomUUID(),
    code,
    nameAr,
    nameEn: input.nameEn ? input.nameEn.trim() : undefined,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  return { success: true, data: newWarehouse };
}

export function updateWarehouse(
  id: string,
  input: UpdateWarehouseInput,
  warehouses: Warehouse[]
): ValidationResult<Warehouse> {
  const wh = warehouses.find((w) => w.id === id);
  if (!wh) {
    return { success: false, error: 'المستودع المطلوب تعديله غير موجود.' };
  }

  const nameAr = input.nameAr.trim();
  if (!nameAr) {
    return { success: false, error: 'اسم المستودع بالعربية مطلوب.' };
  }

  const now = new Date().toISOString();
  const updated: Warehouse = {
    ...wh,
    nameAr,
    nameEn: input.nameEn ? input.nameEn.trim() : undefined,
    updatedAt: now,
  };

  return { success: true, data: updated };
}

export function toggleWarehouseStatus(
  id: string,
  warehouses: Warehouse[],
  locations: InventoryLocation[]
): ValidationResult<{ updatedWarehouse: Warehouse; updatedLocations: InventoryLocation[] }> {
  const wh = warehouses.find((w) => w.id === id);
  if (!wh) {
    return { success: false, error: 'المستودع غير موجود.' };
  }

  const now = new Date().toISOString();
  const newStatus = wh.status === 'active' ? 'archived' : 'active';

  const updatedWarehouse: Warehouse = {
    ...wh,
    status: newStatus,
    updatedAt: now,
  };

  // If archiving warehouse, cascade archive all its locations
  let updatedLocations = [...locations];
  if (newStatus === 'archived') {
    updatedLocations = updatedLocations.map((loc) =>
      loc.warehouseId === id && loc.status === 'active'
        ? { ...loc, status: 'archived', updatedAt: now }
        : loc
    );
  }

  return {
    success: true,
    data: { updatedWarehouse, updatedLocations },
  };
}

/**
 * Storage Location Master Data Operations
 */
export function createLocation(
  input: CreateLocationInput,
  locations: InventoryLocation[],
  warehouses: Warehouse[]
): ValidationResult<InventoryLocation> {
  const code = input.code.trim().toUpperCase();
  const nameAr = input.nameAr.trim();

  if (!code) {
    return { success: false, error: 'رمز موقع التخزين مطلوب.' };
  }
  if (!nameAr) {
    return { success: false, error: 'اسم موقع التخزين بالعربية مطلوب.' };
  }

  const warehouse = warehouses.find((w) => w.id === input.warehouseId);
  if (!warehouse) {
    return { success: false, error: 'المستودع المحدد غير موجود.' };
  }
  if (warehouse.status === 'archived') {
    return { success: false, error: 'لا يمكن إضافة موقع تخزين داخل مستودع مؤرشف.' };
  }

  // Code uniqueness within the warehouse
  const codeExistsInWh = locations.some(
    (l) => l.warehouseId === input.warehouseId && l.code.toUpperCase() === code
  );
  if (codeExistsInWh) {
    return { success: false, error: `رمز الموقع (${code}) مستخدم مسبقاً في هذا المستودع.` };
  }

  // Parent validation
  if (input.parentId) {
    const parent = locations.find((l) => l.id === input.parentId);
    if (!parent) {
      return { success: false, error: 'الموقع الأب المحدد غير موجود.' };
    }
    if (parent.warehouseId !== input.warehouseId) {
      return { success: false, error: 'الموقع الأب يجب أن يتبع لنفس المستودع.' };
    }
    if (parent.status === 'archived') {
      return { success: false, error: 'لا يمكن إنشاء موقع نشط تحت موقع أب مؤرشف.' };
    }
  }

  const now = new Date().toISOString();
  const newLocation: InventoryLocation = {
    id: crypto.randomUUID(),
    warehouseId: input.warehouseId,
    code,
    nameAr,
    nameEn: input.nameEn ? input.nameEn.trim() : undefined,
    parentId: input.parentId || null,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  return { success: true, data: newLocation };
}

export function updateLocation(
  id: string,
  input: UpdateLocationInput,
  locations: InventoryLocation[]
): ValidationResult<InventoryLocation> {
  const loc = locations.find((l) => l.id === id);
  if (!loc) {
    return { success: false, error: 'موقع التخزين غير موجود.' };
  }

  const nameAr = input.nameAr.trim();
  if (!nameAr) {
    return { success: false, error: 'اسم موقع التخزين بالعربية مطلوب.' };
  }

  // Circular parent check
  if (input.parentId) {
    if (input.parentId === id) {
      return { success: false, error: 'لا يمكن تعيين الموقع كأب لنفسه.' };
    }
    const parent = locations.find((l) => l.id === input.parentId);
    if (!parent) {
      return { success: false, error: 'الموقع الأب المحدد غير موجود.' };
    }
    if (parent.warehouseId !== loc.warehouseId) {
      return { success: false, error: 'الموقع الأب يجب أن يتبع لنفس المستودع.' };
    }
  }

  const now = new Date().toISOString();
  const updated: InventoryLocation = {
    ...loc,
    nameAr,
    nameEn: input.nameEn ? input.nameEn.trim() : undefined,
    parentId: input.parentId || null,
    updatedAt: now,
  };

  return { success: true, data: updated };
}

export function toggleLocationStatus(
  id: string,
  locations: InventoryLocation[],
  warehouses: Warehouse[]
): ValidationResult<InventoryLocation[]> {
  const target = locations.find((l) => l.id === id);
  if (!target) {
    return { success: false, error: 'موقع التخزين غير موجود.' };
  }

  const warehouse = warehouses.find((w) => w.id === target.warehouseId);
  if (!warehouse) {
    return { success: false, error: 'المستودع المرتبط بالموقع غير موجود.' };
  }

  const now = new Date().toISOString();

  // If reactivating: ensure parent (if any) and warehouse are active
  if (target.status === 'archived') {
    if (warehouse.status === 'archived') {
      return {
        success: false,
        error: 'لا يمكن إعادة تنشيط الموقع لأن المستودع التابع له مؤرشف. قم بتنشيط المستودع أولاً.',
      };
    }

    if (target.parentId) {
      const parent = locations.find((l) => l.id === target.parentId);
      if (parent && parent.status === 'archived') {
        return {
          success: false,
          error: 'لا يمكن إعادة تنشيط الموقع لأن الموقع الأب مؤرشف. قم بتنشيط الموقع الأب أولاً.',
        };
      }
    }

    const updatedList = locations.map((l) =>
      l.id === id ? { ...l, status: 'active' as const, updatedAt: now } : l
    );
    return { success: true, data: updatedList };
  }

  // If archiving: recursive cascade archive all children
  const childrenMap = new Map<string, string[]>();
  for (const l of locations) {
    if (l.parentId) {
      const list = childrenMap.get(l.parentId) || [];
      list.push(l.id);
      childrenMap.set(l.parentId, list);
    }
  }

  const toArchive = new Set<string>();
  const queue = [id];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    toArchive.add(curr);
    const kids = childrenMap.get(curr) || [];
    for (const kid of kids) {
      if (!toArchive.has(kid)) {
        queue.push(kid);
      }
    }
  }

  const updatedList = locations.map((l) =>
    toArchive.has(l.id) ? { ...l, status: 'archived' as const, updatedAt: now } : l
  );

  return { success: true, data: updatedList };
}

/**
 * Build hierarchical display path for storage location (e.g., Aisle 1 / Shelf B / Bin 4)
 */
export function buildLocationPath(
  locationId: string,
  locations: InventoryLocation[]
): string {
  const locMap = new Map<string, InventoryLocation>(locations.map((l) => [l.id, l]));
  const path: string[] = [];
  let current: InventoryLocation | undefined = locMap.get(locationId);
  const visited = new Set<string>();

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    path.unshift(current.nameAr);
    if (current.parentId) {
      current = locMap.get(current.parentId);
    } else {
      break;
    }
  }

  return path.length > 0 ? path.join(' / ') : '';
}
