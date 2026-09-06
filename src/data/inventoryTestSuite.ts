import { Product, UnitOfMeasure, Category } from '../types/product';
import { Warehouse, InventoryLocation, StockMovement } from '../types/inventory';
import { 
  executeStockMovement, 
  executeStockTransfer, 
  calculateStockBalance,
  updateLocation
} from './inventoryService';

export interface TestResultItem {
  id: string;
  name: string;
  passed: boolean;
  message: string;
}

/**
 * Module 02 Executable Test Suite.
 * Covers exactly TEST 1 through TEST 18 as defined by the specification.
 * Uses isolated in-memory fixtures strictly within test scope (zero production runtime fake data).
 */
export function runModule02Tests(): TestResultItem[] {
  const results: TestResultItem[] = [];

  // Setup isolated in-memory test fixtures
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

  // =========================================================================
  // TEST 1: Receipt 10 -> Expected = 10
  // =========================================================================
  const ledgerT1: StockMovement[] = [];
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
    ledgerT1
  );

  let balT1 = 0;
  if (resT1.success && resT1.data) {
    ledgerT1.push(resT1.data);
    balT1 = calculateStockBalance(ledgerT1, productPhysical.id, warehouseA.id);
  }
  results.push({
    id: 'TEST 1',
    name: 'Receipt 10 -> Expected = 10',
    passed: resT1.success && balT1 === 10,
    message: `الرصيد بعد استلام 10 قطع = ${balT1} (المتوقع 10)`,
  });

  // =========================================================================
  // TEST 2: Receipt 10, Issue 3 -> Expected = 7
  // =========================================================================
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
    ledgerT1
  );

  let balT2 = 0;
  if (resT2.success && resT2.data) {
    ledgerT1.push(resT2.data);
    balT2 = calculateStockBalance(ledgerT1, productPhysical.id, warehouseA.id);
  }
  results.push({
    id: 'TEST 2',
    name: 'Receipt 10, Issue 3 -> Expected = 7',
    passed: resT2.success && balT2 === 7,
    message: `الرصيد بعد صرف 3 قطع من 10 = ${balT2} (المتوقع 7)`,
  });

  // =========================================================================
  // TEST 3: Issue 8 from stock 7 -> Expected = rejected, new movement = none
  // =========================================================================
  const ledgerCountBeforeT3 = ledgerT1.length;
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
    ledgerT1
  );

  const balT3 = calculateStockBalance(ledgerT1, productPhysical.id, warehouseA.id);
  const t3Passed =
    !resT3.success &&
    ledgerT1.length === ledgerCountBeforeT3 &&
    balT3 === 7;
  results.push({
    id: 'TEST 3',
    name: 'Issue 8 from stock 7 -> Expected = rejected, new movement = none',
    passed: t3Passed,
    message: `تم رفض الحركة برسالة: "${resT3.error || ''}" وبقي الرصيد = ${balT3} دون إضافة حركات`,
  });

  // =========================================================================
  // TEST 4: Adjustment increase 5 -> Expected = +5
  // =========================================================================
  const ledgerT4: StockMovement[] = [];
  const resT4 = executeStockMovement(
    {
      productId: productPhysical.id,
      warehouseId: warehouseA.id,
      movementType: 'adjustment',
      adjustmentDirection: 'increase',
      quantity: 5,
      uomId: testUom.id,
      movementDate: new Date().toISOString(),
    },
    products,
    warehouses,
    locations,
    uoms,
    ledgerT4
  );

  let balT4 = 0;
  if (resT4.success && resT4.data) {
    ledgerT4.push(resT4.data);
    balT4 = calculateStockBalance(ledgerT4, productPhysical.id, warehouseA.id);
  }
  results.push({
    id: 'TEST 4',
    name: 'Adjustment increase 5 -> Expected = +5',
    passed: resT4.success && balT4 === 5 && resT4.data?.adjustmentDirection === 'increase',
    message: `الرصيد بعد تسوية زيادة 5 = ${balT4} (المتوقع 5)`,
  });

  // =========================================================================
  // TEST 5: Adjustment decrease 2 -> Expected = -2 (Balance 5 - 2 = 3)
  // =========================================================================
  const resT5 = executeStockMovement(
    {
      productId: productPhysical.id,
      warehouseId: warehouseA.id,
      movementType: 'adjustment',
      adjustmentDirection: 'decrease',
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

  let balT5 = 0;
  if (resT5.success && resT5.data) {
    ledgerT4.push(resT5.data);
    balT5 = calculateStockBalance(ledgerT4, productPhysical.id, warehouseA.id);
  }
  results.push({
    id: 'TEST 5',
    name: 'Adjustment decrease 2 -> Expected = -2 (Balance decreases by 2)',
    passed: resT5.success && balT5 === 3 && resT5.data?.adjustmentDirection === 'decrease',
    message: `الرصيد بعد تسوية نقص 2 من 5 = ${balT5} (المتوقع 3)`,
  });

  // =========================================================================
  // TEST 6: Adjustment without direction -> Expected = rejected
  // =========================================================================
  const resT6 = executeStockMovement(
    {
      productId: productPhysical.id,
      warehouseId: warehouseA.id,
      movementType: 'adjustment',
      // adjustmentDirection omitted
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
    id: 'TEST 6',
    name: 'Adjustment without direction -> Expected = rejected',
    passed: !resT6.success && resT6.error === 'يجب تحديد اتجاه التسوية (زيادة أو نقص) عند اختيار نوع الحركة تسوية.',
    message: `تم رفض تسوية بدون اتجاه: "${resT6.error || ''}"`,
  });

  // =========================================================================
  // TEST 7: Invalid movementType at runtime -> Expected = rejected
  // =========================================================================
  const resT7 = executeStockMovement(
    {
      productId: productPhysical.id,
      warehouseId: warehouseA.id,
      // @ts-expect-error Testing runtime invalid value
      movementType: 'invalid_type_123',
      quantity: 5,
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
    id: 'TEST 7',
    name: 'Invalid movementType at runtime -> Expected = rejected',
    passed: !resT7.success && resT7.error === 'نوع الحركة المخزنية غير صالح.',
    message: `تم رفض النوع غير الصالح: "${resT7.error || ''}"`,
  });

  // =========================================================================
  // TEST 8: Service product movement -> Expected = rejected
  // =========================================================================
  const resT8 = executeStockMovement(
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
    ledgerT4
  );

  results.push({
    id: 'TEST 8',
    name: 'Service product movement -> Expected = rejected',
    passed: !resT8.success && resT8.error === 'الخدمات لا تخضع لحركات المخزون.',
    message: `تم رفض حركات الخدمات: "${resT8.error || ''}"`,
  });

  // =========================================================================
  // TEST 9: Archived product movement -> Expected = rejected
  // =========================================================================
  const resT9 = executeStockMovement(
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
    ledgerT4
  );

  results.push({
    id: 'TEST 9',
    name: 'Archived product movement -> Expected = rejected',
    passed: !resT9.success && resT9.error === 'الصنف المحدد مؤرشف ولا يمكن إنشاء حركات مخزنية له.',
    message: `تم رفض الصنف المؤرشف: "${resT9.error || ''}"`,
  });

  // =========================================================================
  // TEST 10: Archived warehouse movement -> Expected = rejected
  // =========================================================================
  const resT10 = executeStockMovement(
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
    ledgerT4
  );

  results.push({
    id: 'TEST 10',
    name: 'Archived warehouse movement -> Expected = rejected',
    passed: !resT10.success && resT10.error === 'المستودع المحدد مؤرشف ولا يمكن إنشاء حركات جديدة عليه.',
    message: `تم رفض المستودع المؤرشف: "${resT10.error || ''}"`,
  });

  // =========================================================================
  // TEST 11: Archived location movement -> Expected = rejected
  // =========================================================================
  const resT11 = executeStockMovement(
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
    ledgerT4
  );

  results.push({
    id: 'TEST 11',
    name: 'Archived location movement -> Expected = rejected',
    passed: !resT11.success && resT11.error === 'موقع التخزين المحدد مؤرشف ولا يمكن إنشاء حركات عليه.',
    message: `تم رفض موقع التخزين المؤرشف: "${resT11.error || ''}"`,
  });

  // =========================================================================
  // TEST 12: Location belongs to Warehouse A, Movement uses Warehouse B -> Expected = rejected
  // =========================================================================
  const resT12 = executeStockMovement(
    {
      productId: productPhysical.id,
      warehouseId: warehouseB.id,
      locationId: locationA1.id,
      movementType: 'receipt',
      quantity: 5,
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
    id: 'TEST 12',
    name: 'Location belongs to Warehouse A, Movement uses Warehouse B -> Expected = rejected',
    passed: !resT12.success && resT12.error === 'موقع التخزين المحدد لا يتبع للمستودع المختار.',
    message: `تم رفض عدم تطابق الموقع مع المستودع: "${resT12.error || ''}"`,
  });

  // =========================================================================
  // TEST 13: Location hierarchy: A → B, B → C, Attempt: C → A -> Expected = rejected
  // =========================================================================
  const nodeA: InventoryLocation = {
    id: 'loc-node-a',
    warehouseId: warehouseA.id,
    code: 'TREE-A',
    nameAr: 'موقع A',
    parentId: null,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const nodeB: InventoryLocation = {
    id: 'loc-node-b',
    warehouseId: warehouseA.id,
    code: 'TREE-B',
    nameAr: 'موقع B',
    parentId: nodeA.id, // A -> B
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const nodeC: InventoryLocation = {
    id: 'loc-node-c',
    warehouseId: warehouseA.id,
    code: 'TREE-C',
    nameAr: 'موقع C',
    parentId: nodeB.id, // B -> C
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const hierarchyLocations = [nodeA, nodeB, nodeC];
  // Attempt: Setting A's parent to C (which creates the loop A -> B -> C -> A)
  const resT13 = updateLocation(
    nodeA.id,
    {
      nameAr: nodeA.nameAr,
      parentId: nodeC.id,
    },
    hierarchyLocations
  );

  results.push({
    id: 'TEST 13',
    name: 'Location hierarchy: A → B, B → C, Attempt: C → A -> Expected = rejected',
    passed: !resT13.success && resT13.error === 'لا يمكن تعيين الموقع الأب لأنه سيؤدي إلى إنشاء دورة في هيكل مواقع التخزين.',
    message: `تم كشف الدورة الهرمية ورفضها: "${resT13.error || ''}"`,
  });

  // =========================================================================
  // TEST 14: Direct self-parent: A → A -> Expected = rejected
  // =========================================================================
  const resT14 = updateLocation(
    nodeA.id,
    {
      nameAr: nodeA.nameAr,
      parentId: nodeA.id,
    },
    hierarchyLocations
  );

  results.push({
    id: 'TEST 14',
    name: 'Direct self-parent: A → A -> Expected = rejected',
    passed: !resT14.success && resT14.error === 'لا يمكن تعيين الموقع الأب لأنه سيؤدي إلى إنشاء دورة في هيكل مواقع التخزين.',
    message: `تم رفض ربط الموقع بنفسه: "${resT14.error || ''}"`,
  });

  // =========================================================================
  // TEST 15: Archived Parent -> Attempt to assign archived parent -> Expected = rejected
  // =========================================================================
  const childNode: InventoryLocation = {
    id: 'loc-child-node',
    warehouseId: warehouseA.id,
    code: 'CHILD-1',
    nameAr: 'موقع فرعي جديد',
    parentId: null,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const currentLocsForT15 = [locationA1, locationArchived, childNode];
  const resT15 = updateLocation(
    childNode.id,
    {
      nameAr: childNode.nameAr,
      parentId: locationArchived.id,
    },
    currentLocsForT15
  );

  results.push({
    id: 'TEST 15',
    name: 'Archived Parent -> Attempt to assign archived parent -> Expected = rejected',
    passed: !resT15.success && resT15.error === 'لا يمكن ربط الموقع بموقع أب مؤرشف.',
    message: `تم رفض ربط الموقع بأب مؤرشف: "${resT15.error || ''}"`,
  });

  // =========================================================================
  // TEST 16: Transfer: Warehouse A = 10, Warehouse B = 0, Transfer 4
  // Expected: A = 6, B = 4, 2 movements, mutual relatedMovementId
  // =========================================================================
  const ledgerT16: StockMovement[] = [
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

  const resT16 = executeStockTransfer(
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
    ledgerT16
  );

  let t16Passed = false;
  let balAT16 = 0;
  let balBT16 = 0;
  if (resT16.success && resT16.data) {
    ledgerT16.push(resT16.data.movementOut, resT16.data.movementIn);
    balAT16 = calculateStockBalance(ledgerT16, productPhysical.id, warehouseA.id);
    balBT16 = calculateStockBalance(ledgerT16, productPhysical.id, warehouseB.id);

    const mutualLinked =
      resT16.data.movementOut.relatedMovementId === resT16.data.movementIn.id &&
      resT16.data.movementIn.relatedMovementId === resT16.data.movementOut.id &&
      resT16.data.movementOut.movementType === 'transfer_out' &&
      resT16.data.movementIn.movementType === 'transfer_in';

    t16Passed = balAT16 === 6 && balBT16 === 4 && mutualLinked;
  }

  results.push({
    id: 'TEST 16',
    name: 'Transfer: Warehouse A = 10, Warehouse B = 0, Transfer 4 -> A = 6, B = 4, 2 movements, mutual link',
    passed: t16Passed,
    message: `رصيد A = ${balAT16} ورصيد B = ${balBT16} مع حركتين مرتبطتين تبادلياً`,
  });

  // =========================================================================
  // TEST 17: Transfer 11 from stock 10 -> Expected: rejected, no movements created
  // =========================================================================
  const ledgerT17: StockMovement[] = [
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

  const ledgerCountBeforeT17 = ledgerT17.length;
  const resT17 = executeStockTransfer(
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
    ledgerT17
  );

  const t17Passed = !resT17.success && ledgerT17.length === ledgerCountBeforeT17;
  results.push({
    id: 'TEST 17',
    name: 'Transfer 11 from stock 10 -> Expected: rejected, no movements created',
    passed: t17Passed,
    message: `تم رفض النقل الزائد: "${resT17.error || ''}" وبقي عدد الحركات = ${ledgerT17.length}`,
  });

  // =========================================================================
  // TEST 18: Source and destination identical -> Expected: rejected
  // =========================================================================
  const resT18 = executeStockTransfer(
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
    ledgerT16
  );

  results.push({
    id: 'TEST 18',
    name: 'Source and destination identical -> Expected: rejected',
    passed: !resT18.success && resT18.error === 'لا يمكن التحويل لنفس المستودع والموقع. يجب أن يختلف المستودع أو موقع التخزين.',
    message: `تم رفض تطابق المصدر والوجهة: "${resT18.error || ''}"`,
  });

  return results;
}
