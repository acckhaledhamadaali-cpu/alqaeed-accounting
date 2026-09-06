import { Product, UnitOfMeasure, Category } from '../types/product';
import { Warehouse, InventoryLocation, StockMovement } from '../types/inventory';
import { 
  executeStockMovement, 
  executeStockTransfer, 
  calculateStockBalance 
} from './inventoryService';

export interface TestResultItem {
  id: string;
  name: string;
  passed: boolean;
  message: string;
}

/**
 * Executes all 14 mandatory tests required by Module 02 specification.
 */
export function runModule02Tests(): TestResultItem[] {
  const results: TestResultItem[] = [];

  // Setup mock-free test fixtures in memory only for test execution
  const testUom: UnitOfMeasure = {
    id: 'uom-unit-test-1',
    nameAr: 'قطعة',
    code: 'PCS',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const testCategory: Category = {
    id: 'cat-test-1',
    nameAr: 'تصنيف تجريبي',
    parentId: null,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const productPhysical: Product = {
    id: 'prod-phys-1',
    sku: 'SKU-PHYS-1',
    nameAr: 'صنف مادي للاختبار',
    categoryId: testCategory.id,
    baseUomId: testUom.id,
    type: 'product',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const productService: Product = {
    id: 'prod-serv-1',
    sku: 'SKU-SERV-1',
    nameAr: 'خدمة صيانة',
    categoryId: testCategory.id,
    baseUomId: testUom.id,
    type: 'service',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const productArchived: Product = {
    id: 'prod-arch-1',
    sku: 'SKU-ARCH-1',
    nameAr: 'صنف مؤرشف',
    categoryId: testCategory.id,
    baseUomId: testUom.id,
    type: 'product',
    status: 'archived',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const warehouseA: Warehouse = {
    id: 'wh-a',
    code: 'WH-A',
    nameAr: 'المستودع الرئيسي A',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const warehouseB: Warehouse = {
    id: 'wh-b',
    code: 'WH-B',
    nameAr: 'مستودع الفروع B',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const warehouseArchived: Warehouse = {
    id: 'wh-arch',
    code: 'WH-ARCH',
    nameAr: 'مستودع مؤرشف',
    status: 'archived',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const locationA1: InventoryLocation = {
    id: 'loc-a1',
    warehouseId: warehouseA.id,
    code: 'A-101',
    nameAr: 'الرف الأول A1',
    parentId: null,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const locationArchived: InventoryLocation = {
    id: 'loc-arch',
    warehouseId: warehouseA.id,
    code: 'A-ARCH',
    nameAr: 'موقع مؤرشف',
    parentId: null,
    status: 'archived',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const products = [productPhysical, productService, productArchived];
  const warehouses = [warehouseA, warehouseB, warehouseArchived];
  const locations = [locationA1, locationArchived];
  const uoms = [testUom];

  // ==================== TEST 1: Receipt 10 units -> Balance = 10 ====================
  let ledger: StockMovement[] = [];
  const resT1 = executeStockMovement(
    {
      productId: productPhysical.id,
      warehouseId: warehouseA.id,
      movementType: 'receipt',
      quantity: 10,
      uomId: testUom.id,
      movementDate: new Date().toISOString(),
    },
    products,
    warehouses,
    locations,
    uoms,
    ledger
  );

  const t1Passed = resT1.success && !!resT1.data;
  if (t1Passed && resT1.data) {
    ledger.push(resT1.data);
  }
  const balT1 = calculateStockBalance(ledger, productPhysical.id, warehouseA.id);
  results.push({
    id: 'TEST-1',
    name: 'Receipt 10 units -> Balance = 10',
    passed: t1Passed && balT1 === 10,
    message: `الرصيد بعد استلام 10 قطع = ${balT1} (المتوقع 10)`,
  });

  // ==================== TEST 2: Receipt 10, Issue 3 -> Balance = 7 ====================
  const resT2 = executeStockMovement(
    {
      productId: productPhysical.id,
      warehouseId: warehouseA.id,
      movementType: 'issue',
      quantity: 3,
      uomId: testUom.id,
      movementDate: new Date().toISOString(),
    },
    products,
    warehouses,
    locations,
    uoms,
    ledger
  );

  const t2Passed = resT2.success && !!resT2.data;
  if (t2Passed && resT2.data) {
    ledger.push(resT2.data);
  }
  const balT2 = calculateStockBalance(ledger, productPhysical.id, warehouseA.id);
  results.push({
    id: 'TEST-2',
    name: 'Issue 3 units from 10 -> Balance = 7',
    passed: t2Passed && balT2 === 7,
    message: `الرصيد بعد صرف 3 قطع = ${balT2} (المتوقع 7)`,
  });

  // ==================== TEST 3: Balance = 7, Issue 8 -> Reject, Balance stays 7 ====================
  const ledgerCountBeforeT3 = ledger.length;
  const resT3 = executeStockMovement(
    {
      productId: productPhysical.id,
      warehouseId: warehouseA.id,
      movementType: 'issue',
      quantity: 8,
      uomId: testUom.id,
      movementDate: new Date().toISOString(),
    },
    products,
    warehouses,
    locations,
    uoms,
    ledger
  );

  const balT3 = calculateStockBalance(ledger, productPhysical.id, warehouseA.id);
  const t3Passed =
    !resT3.success &&
    ledger.length === ledgerCountBeforeT3 &&
    balT3 === 7;
  results.push({
    id: 'TEST-3',
    name: 'Issue 8 with balance 7 -> Rejection & Balance unchanged',
    passed: t3Passed,
    message: `تم رفض الحركة برسالة: "${resT3.error || ''}" وبقي الرصيد = ${balT3}`,
  });

  // ==================== TEST 4: Transfer 4 from A (10 initially, current 7) to B (0) -> A=3, B=4 ====================
  // Reset ledger for clean test 4: A = 10, B = 0
  const ledgerT4: StockMovement[] = [
    {
      id: crypto.randomUUID(),
      productId: productPhysical.id,
      warehouseId: warehouseA.id,
      movementType: 'receipt',
      quantity: 10,
      uomId: testUom.id,
      baseQuantity: 10,
      baseUomId: testUom.id,
      movementDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];

  const resT4 = executeStockTransfer(
    {
      productId: productPhysical.id,
      sourceWarehouseId: warehouseA.id,
      destinationWarehouseId: warehouseB.id,
      quantity: 4,
      uomId: testUom.id,
      movementDate: new Date().toISOString(),
    },
    products,
    warehouses,
    locations,
    uoms,
    ledgerT4
  );

  let t4Passed = false;
  if (resT4.success && resT4.data) {
    ledgerT4.push(resT4.data.movementOut, resT4.data.movementIn);
    const balA = calculateStockBalance(ledgerT4, productPhysical.id, warehouseA.id);
    const balB = calculateStockBalance(ledgerT4, productPhysical.id, warehouseB.id);
    const mutualLinked =
      resT4.data.movementOut.relatedMovementId === resT4.data.movementIn.id &&
      resT4.data.movementIn.relatedMovementId === resT4.data.movementOut.id;

    t4Passed = balA === 6 && balB === 4 && mutualLinked;
  }

  results.push({
    id: 'TEST-4',
    name: 'Transfer 4 (A:10 -> A:6, B:4) with mutual relatedMovementId',
    passed: t4Passed,
    message: `رصيد A = ${calculateStockBalance(ledgerT4, productPhysical.id, warehouseA.id)} ورصيد B = ${calculateStockBalance(ledgerT4, productPhysical.id, warehouseB.id)} مع ربط ثنائي`,
  });

  // ==================== TEST 5: Transfer 11 from balance 10 -> Reject completely ====================
  const ledgerCountBeforeT5 = ledgerT4.length;
  const resT5 = executeStockTransfer(
    {
      productId: productPhysical.id,
      sourceWarehouseId: warehouseA.id,
      destinationWarehouseId: warehouseB.id,
      quantity: 11,
      uomId: testUom.id,
      movementDate: new Date().toISOString(),
    },
    products,
    warehouses,
    locations,
    uoms,
    ledgerT4
  );

  const t5Passed = !resT5.success && ledgerT4.length === ledgerCountBeforeT5;
  results.push({
    id: 'TEST-5',
    name: 'Transfer 11 from balance 6 -> Rejection (Atomic safety)',
    passed: t5Passed,
    message: `تم رفض النقل الزائد برسالة: "${resT5.error || ''}"`,
  });

  // ==================== TEST 6: Service Product -> Reject ====================
  const resT6 = executeStockMovement(
    {
      productId: productService.id,
      warehouseId: warehouseA.id,
      movementType: 'receipt',
      quantity: 5,
      uomId: testUom.id,
      movementDate: new Date().toISOString(),
    },
    products,
    warehouses,
    locations,
    uoms,
    ledger
  );

  const t6Passed =
    !resT6.success && resT6.error === 'الخدمات لا تخضع لحركات المخزون.';
  results.push({
    id: 'TEST-6',
    name: 'Service Product Movement -> Rejection ("الخدمات لا تخضع لحركات المخزون.")',
    passed: t6Passed,
    message: `النتيجة: "${resT6.error || ''}"`,
  });

  // ==================== TEST 7: Archived Product -> Reject ====================
  const resT7 = executeStockMovement(
    {
      productId: productArchived.id,
      warehouseId: warehouseA.id,
      movementType: 'receipt',
      quantity: 5,
      uomId: testUom.id,
      movementDate: new Date().toISOString(),
    },
    products,
    warehouses,
    locations,
    uoms,
    ledger
  );

  results.push({
    id: 'TEST-7',
    name: 'Archived Product Movement -> Rejection',
    passed: !resT7.success,
    message: `النتيجة: "${resT7.error || ''}"`,
  });

  // ==================== TEST 8: Archived Warehouse -> Reject ====================
  const resT8 = executeStockMovement(
    {
      productId: productPhysical.id,
      warehouseId: warehouseArchived.id,
      movementType: 'receipt',
      quantity: 5,
      uomId: testUom.id,
      movementDate: new Date().toISOString(),
    },
    products,
    warehouses,
    locations,
    uoms,
    ledger
  );

  results.push({
    id: 'TEST-8',
    name: 'Archived Warehouse Movement -> Rejection',
    passed: !resT8.success,
    message: `النتيجة: "${resT8.error || ''}"`,
  });

  // ==================== TEST 9: Archived Location -> Reject ====================
  const resT9 = executeStockMovement(
    {
      productId: productPhysical.id,
      warehouseId: warehouseA.id,
      locationId: locationArchived.id,
      movementType: 'receipt',
      quantity: 5,
      uomId: testUom.id,
      movementDate: new Date().toISOString(),
    },
    products,
    warehouses,
    locations,
    uoms,
    ledger
  );

  results.push({
    id: 'TEST-9',
    name: 'Archived Location Movement -> Rejection',
    passed: !resT9.success,
    message: `النتيجة: "${resT9.error || ''}"`,
  });

  // ==================== TEST 10: Location of Warehouse A with Warehouse B -> Reject ====================
  const resT10 = executeStockMovement(
    {
      productId: productPhysical.id,
      warehouseId: warehouseB.id,
      locationId: locationA1.id, // A1 belongs to warehouse A, not B
      movementType: 'receipt',
      quantity: 5,
      uomId: testUom.id,
      movementDate: new Date().toISOString(),
    },
    products,
    warehouses,
    locations,
    uoms,
    ledger
  );

  results.push({
    id: 'TEST-10',
    name: 'Mismatched Location-Warehouse relationship -> Rejection',
    passed: !resT10.success,
    message: `النتيجة: "${resT10.error || ''}"`,
  });

  // ==================== TEST 11: Source = Destination in Transfer -> Reject ====================
  const resT11 = executeStockTransfer(
    {
      productId: productPhysical.id,
      sourceWarehouseId: warehouseA.id,
      sourceLocationId: locationA1.id,
      destinationWarehouseId: warehouseA.id,
      destinationLocationId: locationA1.id,
      quantity: 2,
      uomId: testUom.id,
      movementDate: new Date().toISOString(),
    },
    products,
    warehouses,
    locations,
    uoms,
    ledgerT4
  );

  results.push({
    id: 'TEST-11',
    name: 'Transfer with Source = Destination -> Rejection',
    passed: !resT11.success,
    message: `النتيجة: "${resT11.error || ''}"`,
  });

  // ==================== TEST 12: Quantity = 0 -> Reject ====================
  const resT12 = executeStockMovement(
    {
      productId: productPhysical.id,
      warehouseId: warehouseA.id,
      movementType: 'receipt',
      quantity: 0,
      uomId: testUom.id,
      movementDate: new Date().toISOString(),
    },
    products,
    warehouses,
    locations,
    uoms,
    ledger
  );

  results.push({
    id: 'TEST-12',
    name: 'Quantity = 0 -> Rejection',
    passed: !resT12.success,
    message: `النتيجة: "${resT12.error || ''}"`,
  });

  // ==================== TEST 13: Quantity < 0 -> Reject ====================
  const resT13 = executeStockMovement(
    {
      productId: productPhysical.id,
      warehouseId: warehouseA.id,
      movementType: 'receipt',
      quantity: -5,
      uomId: testUom.id,
      movementDate: new Date().toISOString(),
    },
    products,
    warehouses,
    locations,
    uoms,
    ledger
  );

  results.push({
    id: 'TEST-13',
    name: 'Quantity < 0 -> Rejection',
    passed: !resT13.success,
    message: `النتيجة: "${resT13.error || ''}"`,
  });

  // ==================== TEST 14: Quantity = NaN / Infinity -> Reject ====================
  const resT14a = executeStockMovement(
    {
      productId: productPhysical.id,
      warehouseId: warehouseA.id,
      movementType: 'receipt',
      quantity: NaN,
      uomId: testUom.id,
      movementDate: new Date().toISOString(),
    },
    products,
    warehouses,
    locations,
    uoms,
    ledger
  );

  const resT14b = executeStockMovement(
    {
      productId: productPhysical.id,
      warehouseId: warehouseA.id,
      movementType: 'receipt',
      quantity: Infinity,
      uomId: testUom.id,
      movementDate: new Date().toISOString(),
    },
    products,
    warehouses,
    locations,
    uoms,
    ledger
  );

  results.push({
    id: 'TEST-14',
    name: 'Quantity = NaN / Infinity -> Rejection',
    passed: !resT14a.success && !resT14b.success,
    message: `رفض NaN: ${!resT14a.success}, رفض Infinity: ${!resT14b.success}`,
  });

  return results;
}
