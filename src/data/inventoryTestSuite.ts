import { Product, UnitOfMeasure, Category } from '../types/product';
import { Warehouse, InventoryLocation, StockMovement } from '../types/inventory';
import { 
  createLocation,
  updateLocation,
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
 * MODULE 02 — Comprehensive Executable Test Suite.
 * Executes all 26 mandatory architectural, hierarchy, and ledger domain tests.
 * All fixtures are completely isolated in-memory for testing only.
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
  // TEST 1: create root location
  // =========================================================================
  const resT1 = createLocation(
    {
      warehouseId: warehouseA.id,
      code: 'ROOT-1',
      nameAr: 'موقع جذر رئيسي',
      parentId: null,
    },
    locations,
    warehouses
  );
  results.push({
    id: 'TEST 1',
    name: 'Create root location',
    passed: resT1.success && resT1.data?.parentId === null,
    message: resT1.success ? `تم إنشاء الموقع الجذر: ${resT1.data?.code}` : resT1.error || '',
  });

  // =========================================================================
  // TEST 2: create child location
  // =========================================================================
  const rootLoc = resT1.data || locationA1;
  const resT2 = createLocation(
    {
      warehouseId: warehouseA.id,
      code: 'CHILD-1',
      nameAr: 'موقع فرعي',
      parentId: rootLoc.id,
    },
    [...locations, rootLoc],
    warehouses
  );
  results.push({
    id: 'TEST 2',
    name: 'Create child location',
    passed: resT2.success && resT2.data?.parentId === rootLoc.id,
    message: resT2.success ? `تم إنشاء الموقع الفرعي بنجاح تحت: ${rootLoc.code}` : resT2.error || '',
  });

  // =========================================================================
  // TEST 3: reject archived parent during creation
  // =========================================================================
  const resT3 = createLocation(
    {
      warehouseId: warehouseA.id,
      code: 'CHILD-FAIL',
      nameAr: 'موقع فرعي فاشل',
      parentId: locationArchived.id,
    },
    locations,
    warehouses
  );
  results.push({
    id: 'TEST 3',
    name: 'Reject archived parent during creation',
    passed: !resT3.success && resT3.error === 'لا يمكن ربط الموقع بموقع أب مؤرشف.',
    message: `تم رفض الإنشاء تحت أب مؤرشف: "${resT3.error || ''}"`,
  });

  // =========================================================================
  // TEST 4: update location with active parent
  // =========================================================================
  const targetLoc: InventoryLocation = {
    id: 'loc-target-update',
    warehouseId: warehouseA.id,
    code: 'TARGET-UP',
    nameAr: 'موقع قابل للتحديث',
    parentId: null,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const resT4 = updateLocation(
    targetLoc.id,
    {
      nameAr: 'موقع بعد التحديث',
      parentId: locationA1.id,
    },
    [...locations, targetLoc]
  );
  results.push({
    id: 'TEST 4',
    name: 'Update location with active parent',
    passed: resT4.success && resT4.data?.parentId === locationA1.id,
    message: resT4.success ? 'تم تحديث الموقع وربطه بأب نشط بنجاح' : resT4.error || '',
  });

  // =========================================================================
  // TEST 5: reject archived parent during update
  // =========================================================================
  const resT5 = updateLocation(
    targetLoc.id,
    {
      nameAr: targetLoc.nameAr,
      parentId: locationArchived.id,
    },
    [...locations, targetLoc]
  );
  results.push({
    id: 'TEST 5',
    name: 'Reject archived parent during update',
    passed: !resT5.success && resT5.error === 'لا يمكن ربط الموقع بموقع أب مؤرشف.',
    message: `تم رفض التحديث تحت أب مؤرشف: "${resT5.error || ''}"`,
  });

  // =========================================================================
  // TEST 6: reject direct self-parent
  // =========================================================================
  const resT6 = updateLocation(
    targetLoc.id,
    {
      nameAr: targetLoc.nameAr,
      parentId: targetLoc.id,
    },
    [...locations, targetLoc]
  );
  results.push({
    id: 'TEST 6',
    name: 'Reject direct self-parent',
    passed: !resT6.success && resT6.error === 'لا يمكن تعيين الموقع الأب لأنه سيؤدي إلى إنشاء دورة في هيكل مواقع التخزين.',
    message: `تم رفض ربط الموقع بنفسه: "${resT6.error || ''}"`,
  });

  // =========================================================================
  // TEST 7: reject indirect cycle: A -> B -> C -> A
  // =========================================================================
  const nodeA: InventoryLocation = {
    id: 'loc-cycle-a',
    warehouseId: warehouseA.id,
    code: 'CYC-A',
    nameAr: 'موقع A',
    parentId: null,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const nodeB: InventoryLocation = {
    id: 'loc-cycle-b',
    warehouseId: warehouseA.id,
    code: 'CYC-B',
    nameAr: 'موقع B',
    parentId: nodeA.id, // A -> B
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const nodeC: InventoryLocation = {
    id: 'loc-cycle-c',
    warehouseId: warehouseA.id,
    code: 'CYC-C',
    nameAr: 'موقع C',
    parentId: nodeB.id, // B -> C
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const hierarchy3 = [nodeA, nodeB, nodeC];
  // Attempt: Set A's parent to C (creates A -> B -> C -> A)
  const resT7 = updateLocation(
    nodeA.id,
    {
      nameAr: nodeA.nameAr,
      parentId: nodeC.id,
    },
    hierarchy3
  );
  results.push({
    id: 'TEST 7',
    name: 'Reject indirect cycle: A -> B -> C -> A',
    passed: !resT7.success && resT7.error === 'لا يمكن تعيين الموقع الأب لأنه سيؤدي إلى إنشاء دورة في هيكل مواقع التخزين.',
    message: `تم كشف الحلقة الثلاثية ورفضها: "${resT7.error || ''}"`,
  });

  // =========================================================================
  // TEST 8: reject longer cycle: A -> B -> C -> D -> A
  // =========================================================================
  const nodeD: InventoryLocation = {
    id: 'loc-cycle-d',
    warehouseId: warehouseA.id,
    code: 'CYC-D',
    nameAr: 'موقع D',
    parentId: nodeC.id, // C -> D
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const hierarchy4 = [nodeA, nodeB, nodeC, nodeD];
  // Attempt: Set A's parent to D (creates A -> B -> C -> D -> A)
  const resT8 = updateLocation(
    nodeA.id,
    {
      nameAr: nodeA.nameAr,
      parentId: nodeD.id,
    },
    hierarchy4
  );
  results.push({
    id: 'TEST 8',
    name: 'Reject longer cycle: A -> B -> C -> D -> A',
    passed: !resT8.success && resT8.error === 'لا يمكن تعيين الموقع الأب لأنه سيؤدي إلى إنشاء دورة في هيكل مواقع التخزين.',
    message: `تم كشف الحلقة الرباعية ورفضها: "${resT8.error || ''}"`,
  });

  // =========================================================================
  // TEST 9: reject parent from another warehouse
  // =========================================================================
  const locInWhB: InventoryLocation = {
    id: 'loc-in-wh-b',
    warehouseId: warehouseB.id,
    code: 'B-101',
    nameAr: 'موقع في المستودع B',
    parentId: null,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const resT9 = updateLocation(
    targetLoc.id, // in warehouse A
    {
      nameAr: targetLoc.nameAr,
      parentId: locInWhB.id, // in warehouse B
    },
    [...locations, targetLoc, locInWhB]
  );
  results.push({
    id: 'TEST 9',
    name: 'Reject parent from another warehouse',
    passed: !resT9.success && resT9.error === 'الموقع الأب يجب أن يتبع لنفس المستودع.',
    message: `تم رفض ربط الموقع بأب في مستودع مختلف: "${resT9.error || ''}"`,
  });

  // =========================================================================
  // TEST 10: warehouseId cannot be changed through update
  // =========================================================================
  const resT10 = updateLocation(
    targetLoc.id,
    // @ts-expect-error Testing immutability against malicious input
    {
      nameAr: targetLoc.nameAr,
      warehouseId: warehouseB.id,
    },
    [...locations, targetLoc]
  );
  results.push({
    id: 'TEST 10',
    name: 'warehouseId cannot be changed through update',
    passed: !resT10.success && resT10.error === 'لا يمكن تغيير المستودع التابع له موقع التخزين.',
    message: `تم حماية ثبات المستودع ورفض التعديل: "${resT10.error || ''}"`,
  });

  // =========================================================================
  // TEST 11: adjustment increase
  // =========================================================================
  const ledgerAdj: StockMovement[] = [];
  const resT11 = executeStockMovement(
    {
      productId: productPhysical.id,
      warehouseId: warehouseA.id,
      movementType: 'adjustment',
      adjustmentDirection: 'increase',
      quantity: 10,
      uomId: testUom.id,
      movementDate: new Date().toISOString(),
    },
    products,
    warehouses,
    locations,
    uoms,
    ledgerAdj
  );
  let balT11 = 0;
  if (resT11.success && resT11.data) {
    ledgerAdj.push(resT11.data);
    balT11 = calculateStockBalance(ledgerAdj, productPhysical.id, warehouseA.id);
  }
  results.push({
    id: 'TEST 11',
    name: 'Adjustment increase',
    passed: resT11.success && balT11 === 10 && resT11.data?.adjustmentDirection === 'increase',
    message: `الرصيد بعد تسوية زيادة 10 = ${balT11}`,
  });

  // =========================================================================
  // TEST 12: adjustment decrease
  // =========================================================================
  const resT12 = executeStockMovement(
    {
      productId: productPhysical.id,
      warehouseId: warehouseA.id,
      movementType: 'adjustment',
      adjustmentDirection: 'decrease',
      quantity: 4,
      uomId: testUom.id,
      movementDate: new Date().toISOString(),
    },
    products,
    warehouses,
    locations,
    uoms,
    ledgerAdj
  );
  let balT12 = 0;
  if (resT12.success && resT12.data) {
    ledgerAdj.push(resT12.data);
    balT12 = calculateStockBalance(ledgerAdj, productPhysical.id, warehouseA.id);
  }
  results.push({
    id: 'TEST 12',
    name: 'Adjustment decrease',
    passed: resT12.success && balT12 === 6 && resT12.data?.adjustmentDirection === 'decrease',
    message: `الرصيد بعد تسوية نقص 4 من 10 = ${balT12}`,
  });

  // =========================================================================
  // TEST 13: invalid adjustment direction
  // =========================================================================
  const resT13 = executeStockMovement(
    {
      productId: productPhysical.id,
      warehouseId: warehouseA.id,
      movementType: 'adjustment',
      // @ts-expect-error Testing runtime invalid direction
      adjustmentDirection: 'upward',
      quantity: 2,
      uomId: testUom.id,
      movementDate: new Date().toISOString(),
    },
    products,
    warehouses,
    locations,
    uoms,
    ledgerAdj
  );
  results.push({
    id: 'TEST 13',
    name: 'Invalid adjustment direction',
    passed: !resT13.success && resT13.error === 'اتجاه التسوية غير صالح. يجب أن يكون زيادة (increase) أو نقص (decrease).',
    message: `تم رفض الاتجاه غير الصالح: "${resT13.error || ''}"`,
  });

  // =========================================================================
  // TEST 14: invalid movement type
  // =========================================================================
  const resT14 = executeStockMovement(
    {
      productId: productPhysical.id,
      warehouseId: warehouseA.id,
      // @ts-expect-error Testing runtime invalid movement type
      movementType: 'non_existent_type',
      quantity: 2,
      uomId: testUom.id,
      movementDate: new Date().toISOString(),
    },
    products,
    warehouses,
    locations,
    uoms,
    ledgerAdj
  );
  results.push({
    id: 'TEST 14',
    name: 'Invalid movement type',
    passed: !resT14.success && resT14.error === 'نوع الحركة المخزنية غير صالح.',
    message: `تم رفض نوع الحركة غير الصالح: "${resT14.error || ''}"`,
  });

  // =========================================================================
  // TEST 15: negative stock prevention
  // =========================================================================
  // Current balance is 6 in ledgerAdj. Attempting to decrease by 7 must be rejected.
  const ledgerCountBeforeT15 = ledgerAdj.length;
  const resT15 = executeStockMovement(
    {
      productId: productPhysical.id,
      warehouseId: warehouseA.id,
      movementType: 'issue',
      quantity: 7,
      uomId: testUom.id,
      movementDate: new Date().toISOString(),
    },
    products,
    warehouses,
    locations,
    uoms,
    ledgerAdj
  );
  const balT15 = calculateStockBalance(ledgerAdj, productPhysical.id, warehouseA.id);
  results.push({
    id: 'TEST 15',
    name: 'Negative stock prevention',
    passed: !resT15.success && ledgerAdj.length === ledgerCountBeforeT15 && balT15 === 6,
    message: `تم منع الصرف السالب: "${resT15.error || ''}" وبقي الرصيد = ${balT15}`,
  });

  // =========================================================================
  // TEST 16: service movement rejection
  // =========================================================================
  const resT16 = executeStockMovement(
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
    ledgerAdj
  );
  results.push({
    id: 'TEST 16',
    name: 'Service movement rejection',
    passed: !resT16.success && resT16.error === 'الخدمات لا تخضع لحركات المخزون.',
    message: `تم رفض حركات الخدمات: "${resT16.error || ''}"`,
  });

  // =========================================================================
  // TEST 17: archived product rejection
  // =========================================================================
  const resT17 = executeStockMovement(
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
    ledgerAdj
  );
  results.push({
    id: 'TEST 17',
    name: 'Archived product rejection',
    passed: !resT17.success && resT17.error === 'الصنف المحدد مؤرشف ولا يمكن إنشاء حركات مخزنية له.',
    message: `تم رفض الصنف المؤرشف: "${resT17.error || ''}"`,
  });

  // =========================================================================
  // TEST 18: archived warehouse rejection
  // =========================================================================
  const resT18 = executeStockMovement(
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
    ledgerAdj
  );
  results.push({
    id: 'TEST 18',
    name: 'Archived warehouse rejection',
    passed: !resT18.success && resT18.error === 'المستودع المحدد مؤرشف ولا يمكن إنشاء حركات جديدة عليه.',
    message: `تم رفض المستودع المؤرشف: "${resT18.error || ''}"`,
  });

  // =========================================================================
  // TEST 19: archived location rejection
  // =========================================================================
  const resT19 = executeStockMovement(
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
    ledgerAdj
  );
  results.push({
    id: 'TEST 19',
    name: 'Archived location rejection',
    passed: !resT19.success && resT19.error === 'موقع التخزين المحدد مؤرشف ولا يمكن إنشاء حركات عليه.',
    message: `تم رفض موقع التخزين المؤرشف: "${resT19.error || ''}"`,
  });

  // =========================================================================
  // TEST 20: invalid location/warehouse relationship
  // =========================================================================
  const resT20 = executeStockMovement(
    {
      productId: productPhysical.id,
      warehouseId: warehouseB.id,
      locationId: locationA1.id, // belongs to Warehouse A!
      movementType: 'receipt',
      quantity: 5,
      uomId: testUom.id,
      movementDate: new Date().toISOString(),
    },
    products,
    warehouses,
    locations,
    uoms,
    ledgerAdj
  );
  results.push({
    id: 'TEST 20',
    name: 'Invalid location/warehouse relationship',
    passed: !resT20.success && resT20.error === 'موقع التخزين المحدد لا يتبع للمستودع المختار.',
    message: `تم رفض عدم تطابق الموقع مع المستودع: "${resT20.error || ''}"`,
  });

  // =========================================================================
  // TEST 21: transfer atomicity
  // =========================================================================
  const ledgerTransfer: StockMovement[] = [
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
  const resT21 = executeStockTransfer(
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
    ledgerTransfer
  );
  let t21Passed = false;
  if (resT21.success && resT21.data) {
    ledgerTransfer.push(resT21.data.movementOut, resT21.data.movementIn);
    const balA = calculateStockBalance(ledgerTransfer, productPhysical.id, warehouseA.id);
    const balB = calculateStockBalance(ledgerTransfer, productPhysical.id, warehouseB.id);
    const mutualLinked =
      resT21.data.movementOut.relatedMovementId === resT21.data.movementIn.id &&
      resT21.data.movementIn.relatedMovementId === resT21.data.movementOut.id &&
      resT21.data.movementOut.movementType === 'transfer_out' &&
      resT21.data.movementIn.movementType === 'transfer_in';

    t21Passed = balA === 6 && balB === 4 && mutualLinked;
  }
  results.push({
    id: 'TEST 21',
    name: 'Transfer atomicity',
    passed: t21Passed,
    message: `تم إنشاء حركتين مترابطتين تبادلياً والرصيد: A=6, B=4`,
  });

  // =========================================================================
  // TEST 22: same source/destination rejection
  // =========================================================================
  const resT22 = executeStockTransfer(
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
    ledgerTransfer
  );
  results.push({
    id: 'TEST 22',
    name: 'Same source/destination rejection',
    passed: !resT22.success && resT22.error === 'لا يمكن التحويل لنفس المستودع والموقع. يجب أن يختلف المستودع أو موقع التخزين.',
    message: `تم رفض تطابق المصدر والوجهة: "${resT22.error || ''}"`,
  });

  // =========================================================================
  // TEST 23: zero quantity rejection
  // =========================================================================
  const resT23 = executeStockMovement(
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
    ledgerAdj
  );
  results.push({
    id: 'TEST 23',
    name: 'Zero quantity rejection',
    passed: !resT23.success && resT23.error === 'يجب أن تكون الكمية أكبر من الصفر.',
    message: `تم رفض الكمية الصفرية: "${resT23.error || ''}"`,
  });

  // =========================================================================
  // TEST 24: negative quantity rejection
  // =========================================================================
  const resT24 = executeStockMovement(
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
    ledgerAdj
  );
  results.push({
    id: 'TEST 24',
    name: 'Negative quantity rejection',
    passed: !resT24.success && resT24.error === 'يجب أن تكون الكمية أكبر من الصفر.',
    message: `تم رفض الكمية السالبة: "${resT24.error || ''}"`,
  });

  // =========================================================================
  // TEST 25: NaN rejection
  // =========================================================================
  const resT25 = executeStockMovement(
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
    ledgerAdj
  );
  results.push({
    id: 'TEST 25',
    name: 'NaN quantity rejection',
    passed: !resT25.success && resT25.error === 'الكمية يجب أن تكون رقماً صالحاً ومحدداً.',
    message: `تم رفض قيمة NaN: "${resT25.error || ''}"`,
  });

  // =========================================================================
  // TEST 26: Infinity rejection
  // =========================================================================
  const resT26 = executeStockMovement(
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
    ledgerAdj
  );
  results.push({
    id: 'TEST 26',
    name: 'Infinity quantity rejection',
    passed: !resT26.success && resT26.error === 'الكمية يجب أن تكون رقماً صالحاً ومحدداً.',
    message: `تم رفض قيمة Infinity: "${resT26.error || ''}"`,
  });

  return results;
}
