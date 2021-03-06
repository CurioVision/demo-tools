// TODO: Move BridalLive API types into shared repo
//       If we import from the '../app/integrations/etc TSC to includes
//       'functions/src' in the build output
//       @see https://stackoverflow.com/questions/52121725/maintain-src-folder-structure-when-building-to-dist-folder-with-typescript-3
//
//       Probably need to user Lerna:
//       @see https://lerna.js.org/
//       @see https://stackoverflow.com/a/58862738

export type BridalLiveToken = string | null

export interface BridalLiveResponse<T> {
  total: number // 5,
  page: number // 1,
  size: null
  sortField: string // 'id',
  sortDirection: string // 'asc',
  result: [T]
}

export interface BridalLiveError {
  errors: [
    {
      code: string // 'login.error.invalidLicense'
      message: string // 'Your license does not have api access'
    }
  ]
  fieldErrors: {}
}
export interface BridalLiveCompany extends BaseBridalLiveObject {
  version: number
  createdDate: number // 1551111009000
  createdByUser: string // ""
  modifiedDate: null
  modifiedByUser: null
  modifiedDateAfter: null
  retailerIds: null
  tokenRetailerId: null
  licenseId: number // 3443
  locale: string // "US"
  name: string // "Butterfly Revolution"
  emailAddress: string // "ingrid@butterflyrevolution.com"
  websiteAddress: null
  address1: null
  address2: null
  city: null
  state: null
  zip: null
  phoneNumber: null
  faxNumber: null
  language: string // "en"
  sunOpen: string // "10:00AM"
  sunClose: string // "6:00PM"
  sunClosed: boolean // false
  monOpen: string // "10:00AM"
  monClose: string // "6:00PM"
  monClosed: boolean // false
  tuesOpen: string // "10:00AM"
  tuesClose: string // "6:00PM"
  tuesClosed: boolean // false
  wedOpen: string // "10:00AM"
  wedClose: string // "6:00PM"
  wedClosed: boolean // false
  thursOpen: string // "10:00AM"
  thursClose: string // "6:00PM"
  thursClosed: boolean // false
  friOpen: string // "10:00AM"
  friClose: string // "6:00PM"
  friClosed: boolean // false
  satOpen: string // "10:00AM"
  satClose: string // "6:00PM"
  satClosed: boolean // false
  timeZoneId: string // "America/New_York"
  vatNumber: null
  countryBusinessNumber: null
  businessTypeCode: null
  businessTypeCode2: null
  lastCertifiedTicketId: null
  lastCertifiedEventId: null
  lastCertifiedInvoiceId: null
  lastCertifiedDuplicateId: null
  lastCertifiedTicketGrandTotalId: null
  currentDailyGrandTotalId: null
  currentMonthlyGrandTotalId: null
  currentFiscalYearGrandTotalId: null
  hasNewMarketplaceInformation: boolean // false
  hasNewItemTransferRequest: boolean // false
  sunOpenDum: null
  sunCloseDum: null
  monOpenDum: null
  monCloseDum: null
  tuesOpenDum: null
  tuesCloseDum: null
  wedOpenDum: null
  wedCloseDum: null
  thursOpenDum: null
  thursCloseDum: null
  friOpenDum: null
  friCloseDum: null
  satOpenDum: null
  satCloseDum: null
  fontLocation: null
  usesVat: boolean // false
  vatLabelKey: null
}

export interface BridalLiveDepartment extends BaseBridalLiveObject {
  // 59269,
  version: number // 1,
  createdDate: number // 1551111010000,
  createdByUser: string // '',
  modifiedDate: number // 1556745360000,
  modifiedByUser: string // 'butterfly',
  modifiedDateAfter: null
  retailerIds: null
  tokenRetailerId: null
  name: string // 'Bridal Gowns - SO',
  code: string // 'BG',
  marginPercent: null
  commissionPercent: null
  status: string // 'A',
  displayOnLookbook: null
  imageUrl: null
  qbIncomeSaleId: null
  qbIncomeSpecialOrderId: null
  qbCogsSaleId: null
  qbCogsSpecialOrderId: null
  taxJarProductId: null
  mktCategoryCompanySettingType: null
  isDepartmentVisibleOnLookbook: null
}

export interface BridalLiveEmployee extends BaseBridalLiveObject {
  // 30092,
  version: number // 7,
  createdDate: number // 1579124095077,
  createdByUser: string // "",
  modifiedDate: null
  modifiedByUser: null
  modifiedDateAfter: null
  retailerIds: null
  tokenRetailerId: null
  firstName: string // "Amanda",
  lastName: string // "Kruskenisky",
  emailAddress: null
  homePhoneNumber: string // "4025800938",
  workPhoneNumber: null
  mobilePhoneNumber: null
  address1: null
  address2: null
  city: null
  state: null
  zip: null
  status: string // "A",
  username: string // "AmandaB",
  password: string // "Ab0938",
  roleId: number // 335,
  color: string // "#bd7a9a ",
  appointmentsAllowed: true
  commissionPercent: boolean // number // 2.0,
  profileImageUrl: null
  monthlySalesGoals: null
  employeeAppointmentTypes: []
  scheduleEntries: []
  newPassword: null
  roleDescription: string // "Sales Consultant",
  role: null
  storeLocationDescription: null
  storeName: null
  passwordUpdated: boolean // false
}

export interface BridalLiveStoreSettingsData {
  departments: BridalLiveDepartment[]
  employees: BridalLiveEmployee[]
}

export interface BridalLiveApiCredentials {
  retailerId: string
  apiAccess: boolean
  apiKey: string
}

export interface BridalCustomerSettings {
  retailerName: string
  retailerId: string
  apiKey: string
  gownDeptId: number
}
export interface BaseBridalLiveObject {
  id: number // 1948588,
  retailerId: string // "5b19f2a7",
}
/**
 * The item returned by BridalLive's `/bl-server/api/items/list` endpoint
 */
export interface BridalLiveItem extends BaseBridalLiveObject {
  version: number // 5,
  createdDate: number // 1484247128000,
  createdByUser: string // "Shannon",
  modifiedDate: number // 1553784630000,
  modifiedByUser: string // "Emmy",
  modifiedDateAfter: null
  retailerIds: null
  tokenRetailerId: null
  departmentId: number // 793,
  vendorId: number // 45385,
  itemNumber: number // 1320,
  name: string // "Beckett",
  description: null
  notes: string | null
  quantityOnHand: number // 4,
  reorderPoint: null
  color: string // "Ivory/Ivory/Ivory",
  colorGroupId: null
  colorString: string // "Ivory/Ivory/Ivory,White/White/White,LightChampagne/Candlelight/Ivory",
  color2: null
  color2GroupId: null
  color2String: null
  size: null
  sizeGroupId: null
  vendorItemName: string // "BL219",
  taxCodeId: number // 1986,
  regularPrice: number // 1150.00,
  vat: number // 0.00,
  inventoryCost: number // 459.00,
  cost: number // 0.00,
  orderCost: number // 459.00,
  discontinuedDate: null
  status: string // "A",
  qbSyncStatus: null
  qbListId: null
  qbEditSequence: null
  inventoryItem: boolean // true,
  nonInventoryItem: boolean // false,
  rental: boolean // false,
  service: boolean // false,
  promptToRegister: null
  doNotAllowDiscounts: null
  sample: boolean // true,
  marketplaceId: null
  smartMatchIgnored: boolean // false,
  minedItemsIgnored: boolean // false,
  showOnLookbook: boolean // true,
  salePrice: number // 0.00,
  attributes: LookbookAttribute[] | null // This will be null until combined by BridalLiveData.combineItemData
  attributesOperand: null
  quantityAwaitingPickup: number // 3,
  quantityInStock: number // 1,
  quantityOnPendingPurchaseOrders: null
  quantityOnCompleteTrxButAwaitingPickup: number // 0,
  quantityOnPendingTrxInAlterations: number // 0,
  quantityOnAllTrxInAlterations: null
  departmentCode: string // "BG",
  departmentName: string // "Bridal Gowns",
  vendorCode: string // "BL",
  vendorName: string // "Beloved",
  vendorWebAddress: null
  vendorMarketplaceId: null
  itemNumberString: null
  itemIdString: null
  itemIdNotInString: null
  quantityOnHandOperator: null
  discontinuedDateAfter: null
  canAddToSalesOrder: null
  canAddToSale: null
  attrCount: null
  taxCodeDescription: null
  itemPictureImageUrl: null
  itemPictureSequence: null
  priceMoreThan: null
  priceLessThan: null
  nbrPictures: null
  nbrAttributes: null
  isLinkedToMarketplace: null
  trxId: null
  itemCategoryId: null
  nbrItemsLinked: null
  itemAttributes: null
  retailerLocale: null
  sizeString: null
  isItemVisibleOnLookbook: null
  hasSalePrice: null
  currentPrice: number // 0
}

/**
 * This extends the BridalLive item and adds an images array that we can use
 * to keep all item data together. We create FullBridalLiveItems by fetching
 * all items, attributes, and images and then combining into single objects.
 */
export interface FullBridalLiveItem extends BridalLiveItem {
  images: BridalLiveItemImage[] | null // This will be null until combined by BridalLiveData.combineItemData
}

export interface BridalLiveItemTransaction extends BaseBridalLiveObject {
  adjPrice: number // 300
  balanceDue: number // 0
  color: string | null // null
  color2: string | null // null
  contactId: number // 1859702
  contactName: string // "Savvy Bridal"
  includedTaxAmount: number // 0
  itemDescription: string // "Alex*"
  itemId: number // 1398153
  itemName: string // "Alex*"
  qty: number // 1
  size: string | null // null
  storeNickName: string | null // null
  taxAmount: number // 0
  totalRow: boolean // false
  trxDate: string // "2019-03-12"
  trxId: number // 3766233
  trxNumber: string // "S 617"
  trxStatus: string // "C"
  trxTotal: number // 2050
  vendorCode: string // "SN"
}

export interface BridalLiveReceivingEntry {
  retailerId: string // "5b19f2a7",
  storeNickName: string // null,
  totalRow: boolean // false,
  poId: number // 845305,
  rvId: number // 1010039,
  purchaseOrderNumber: number // 2034,
  vendorCode: string // "SN",
  contactId: string // null,
  contactName: string // null,
  vendorItemName: string // "44045",
  recvQty: number // 1,
  size: string // "10",
  balanceDue: number // null,
  rvCost: number // 439.0,
  poCost: number // 439.0,
  receivingVoucherNumber: number // 2287,
  shipDate: string // null,
  recvDate: string // "2018-12-04"
}

export interface BridalLiveContact extends BaseBridalLiveObject {
  version: number //0;
  createdDate: number //1570205417000;
  createdByUser: string //'butterfly';
  modifiedDate: number // 1570205417000;
  modifiedByUser: string //'butterfly';
  modifiedDateAfter: null
  retailerIds: null
  tokenRetailerId: null
  typeId: number //1;
  firstName: string //'Matt';
  lastName: string //'Gabor';
  emailAddress: null
  homePhoneNumber: null
  workPhoneNumber: null
  mobilePhoneNumber: string //'4015551212';
  address1: null
  address2: null
  city: null
  state: null
  zip: null
  categoryId: number //31341;
  howHeardId: number // 0;
  preferredContactMethodId: null
  employeeId: number // 0;
  smsOptIn: false
  status: string //'A';
  qbSyncStatus: null
  qbListId: null
  qbEditSequence: null
  paymentProfileToken: null
  paymentProfileTokenProvider: null
  paymentProfileMaskedAcctNumber: null
  paymentProfileExpiration: null
  paymentProfileCardType: null
  paymentProfileBillingName: null
  paymentProfileAddedBy: null
  pin: string //'409556';
  country: string //'United States';
  mergedDate: null
  mergedByUser: null
  note: null
  event: null
  eventLocation: null
  budgetRange: null
  eventType: null
  measurements: null
  howHeard: null
  interview: null
  mergeOverview: null
  eventId: number //6165690;
  appointmentRequestId: null
  waitListId: null
  eventDate: null
  contactIdString: null
  employeeName: null
  categoryDescription: null
  bestPhoneNumber: string //'4015551212';
  bestPhoneNumberType: number //3;
  numberOfMembers: null
  budget: null
  formalityId: null
  formality: null
  prefContactMethod: null
  eventTypeId: null
  eventTypeDescription: null
  timeOfDayId: null
  timeOfDay: null
  howHeardDescription: null
  eventDateString: null
  locationId: null
  locationDescription: null
  potentialDuplicate: false
  storeNickName: null
  eventHeadContactId: null
  purchaseHistoryHTML: null
  budgetRangeId: null
  budgetRangeDescription: null
  eventMemberTypeId: null
  eventMemberRoleDescription: null
  itemInterestId: null
  vipFlag: null
  updateType: null
  updateRequestId: null
  itemInterestList: null
  appointments: null
  emailIds: null
  smsIds: null
  taskIds: null
  vip: false
}

export interface BridalLivePosTransactionLineItem extends BaseBridalLiveObject {
  //9851261;
  version: number //3;
  createdDate: number //1609341744000;
  createdByUser: string //butterfly';
  modifiedDate: number //1609341750000;
  modifiedByUser: string //butterfly';
  modifiedDateAfter: null
  retailerIds: null
  tokenRetailerId: null
  transactionId: number //5632736;
  sequenceNumber: number //0;
  inventoryItemId: number //4058720;
  price: number //1200.0;
  quantity: number //1;
  quantitySold: number //1;
  taxCodeId: number //7023;
  taxCodeDescription: string //No Tax';
  taxCodeIsComputed: false
  taxPercent: number //0.0;
  taxAmount: number //0.0;
  includedTaxAmount: number //0.0;
  priceBeforeIncludedTax: number //0;
  unitPriceBeforeIncludedTax: number // 0;
  includedTaxPercent: number // 0.0;
  discountPercent: number //100.0;
  discountAmount: number //1200.0;
  discountType: number //0;
  adjustedPrice: number //0.0;
  note: null
  itemNumber: number //2;
  itemName: string //Example Item (Private Labeled)';
  itemDescription: string //Spring 2016 Collection';
  itemColor: string //Diamond White';
  itemColor2: string //Silver';
  itemSize: string //16';
  eventItemId: null
  purchaseOrderItemId: null
  sizeUpchargeApplied: null
  itemStatus: null
  commissionDisabled: null
  estimatedDeliveryDate: null
  status: string //C';
  itemSalePrice: number // 0.0;
  addressId: null
  taxJarOrderId: null
  shippingTaxPercent: number //0.0;
  shippingTax: number //0;
  shippingCost: number //0.0;
  shippingTaxCodeId: null
  isInventoryItem: null
  isNonInventoryItem: null
  isService: null
  isRental: null
  itemVendorItemName: null
  inventoryModQty: null
  eventItemMemberRoleId: null
  eventItemMemberName: null
  eventLocationDescription: null
  itemRegularPrice: null
  itemOrderCost: null
  itemDepartmentId: null
  itemVendorId: null
  doNotAllowDiscounts: null
  promptToRegister: null
  selected: null
  imageUrl: null
  taxJarProductId: null
  address: null
  addresses: null
  trxNumber: null
  trxTypeId: null
  trxStatus: null
  trxItemStatus: null
  trxContactName: null
  trxContactId: null
  trxContactEventDate: null
  itemNotInInventory: false
  trxOrderDate: null
  purchaseOrderId: null
  purchaseOrderNumber: null
  purchaseOrderShipDate: null
  receivingVoucherReceivedDate: null
  poLineItemQuantity: null
  quantityReceived: null
  poLineItemConfNumber: null
  vendorName: null
  poLineItemSequenceNumber: null
  colorString: null
  color2String: null
  sizeGroup: null
  taxRecalcFieldChanged: false
  inventoryItem: null
}
export interface BridalLivePosTransaction extends BaseBridalLiveObject {
  //5632736;
  version: number //5;
  createdDate: number //1609341721000;
  createdByUser: string //butterfly';
  modifiedDate: number //1609341804000;
  modifiedByUser: string //butterfly';
  modifiedDateAfter: null
  retailerIds: null
  tokenRetailerId: null
  contactId: number //6162109;
  eventId: null
  employeeId: number //27936;
  typeId: number //1;
  trxNumber: number //116;
  orderDate: string //2020-12-30';
  completedDate: string //2020-12-30';
  deposit: number //0.0;
  balanceDue: number //0.0;
  notes: string //Stolen';
  subTotal: number //0.0;
  addtlDiscountPercent: number //0;
  addtlDiscountAmount: number //0.0;
  addtlDiscountType: number //0;
  totalDiscountAmount: number //0.0;
  taxPercent: number //0;
  taxAmount: number //0.0;
  includedTaxPercent: number //0.0;
  includedTaxAmount: number //0.0;
  shippingAndHandling: number //0.0;
  fee: number //0.0;
  totalAmount: number //0.0;
  employeeName: string //Ingrid Heilke';
  contactName: string //Matt Gabor';
  contactPhone: string //4015551212';
  contactPhoneType: number //3;
  eventDate: null
  smartFlowsTriggeredDateTime: null
  smartFlowsProcessedDateTime: null
  qbTxnId: null
  qboExportDateTime: null
  qbEditSequence: null
  status: string //C';
  source: null
  commissionDisabled: null
  shipToName: null
  shipToAddress1: null
  shipToAddress2: null
  shipToCity: null
  shipToState: null
  shipToZip: null
  printCount: number //0;
  originalTrxNumber: number //116;
  hideOnPortal: false
  linkedTransactionId: null
  nf525InvoiceAddress: null
  nf525InvoiceZipCode: null
  nf525InvoiceCity: null
  nf525InvoiceCountry: null
  nf525PreviousSignature: null
  nf525Footprint: null
  nf525Signature: null
  nf525Stamp: null
  nf525PreviousId: null
  nf525NextId: null
  syncRecordId: null
  originalCompletedDate: string //2020-12-30';
  balanceDueZeroDate: null
  lineItems: BridalLivePosTransactionLineItem[]
  payments: any[]
  preAuthPayments: []
  upcomingAppointments: null
  shippingAddresses: null
  contact: BridalLiveContact
  eventContactName: null
  eventDateBefore: null
  eventContactId: null
  percentPaid: number //0;
  orderDateBefore: null
  completedDateBefore: null
  manualSalesTaxCalculation: false
  totalPaymentAmount: number //0;
  changeDue: number //0;
  typeDescription: null
  terms: null
  termsSignature: null
  typeIdString: null
  requestedPaymentAmount: null
  splitPaymentNumber: null
  applicationVersion: null
  failedToRecalculateTax: false
  promptForTip: false
  trxIdNotInString: null
  hasBalanceDue: null
  balanceDueZeroDateBefore: null
  recentlyAddedPayment: null
}

export interface BridalLivePurchaseOrder extends BaseBridalLiveObject {
  // 520
  version: number // 0
  createdDate: number // 1401992507000
  createdByUser: string // 'Emmy'
  modifiedDate: number // 1401998960000
  modifiedByUser: string // 'Emmy'
  modifiedDateAfter: null
  retailerIds: null
  tokenRetailerId: null
  purchaseOrderNumber: number // 118
  vendorId: number // 199
  vendorName: string // 'J Picone'
  employeeId: number // 180
  employeeName: string // 'Emmy Gorman'
  orderDate: string // '2014-06-05'
  shipDate: string // '2014-06-10'
  cancelDate: null
  confirmationNumber: string // 'email'
  submittedDate: string // '2014-06-05'
  notes: string // 'Thanks ladies!'
  subTotal: number // 160.0
  discountPercent: number // 0
  discountAmount: number // 0.0
  fee: number // 0.0
  totalAmount: number // 160.0
  qtyOrdered: number // 4
  qtyReceived: number // 0
  status: string // 'C'
  orderType: string // 'S'
  lineItems: BridalLivePurchaseOrderItem[]
  vendor: null
  qtyDue: null
  unfilledPercent: null
  contactName: null
  contactId: null
  eventContactName: null
  eventContactId: null
  attentionItemSearch: false
  shipDateBefore: null
  eventDate: null
  eventDateBefore: null
}

export interface BridalLivePurchaseOrderItem extends BaseBridalLiveObject {
  // 1354
  version: number // 0
  createdDate: number // 1400173630000
  createdByUser: string // 'Emmy'
  modifiedDate: number // 1404415370000
  modifiedByUser: string // 'Emmy'
  modifiedDateAfter: null
  retailerIds: null
  tokenRetailerId: null
  purchaseOrderId: number // 503
  sequenceNumber: number // 0
  inventoryItemId: number // 2647
  quantity: number // 1
  quantityReceived: number // 1
  cost: number // 399.0
  vat: number // 0.0
  extCost: number // 399.0
  note: null
  itemNumber: number // 160
  itemVendorItemName: string // '2089'
  itemColor: string // 'Ivory'
  itemSize: string // ''
  itemColor2: string // 'Gold/Silver'
  contactId: number // 37906
  sizeUpchargeApplied: false
  status: string // 'C'
  contactName: null
  eventItemMemberName: null
  contactPhone: null
  contactPhoneType: null
  mobilePhoneNumber: null
  workPhoneNumber: null
  homePhoneNumber: null
  preferredContactMethodId: null
  contactEventDate: null
  receivingVoucherNumber: null
  receivingVoucherNumbers: null
  colorString: null
  color2String: null
  sizeGroup: null
  transactionId: null
  transactionTypeDescription: null
  transactionTypeId: null
  transactionNumber: null
  transactionItemId: null
  itemDepartmentId: null
  inventoryItem: null
  nonInventoryItem: null
  rental: null
  service: null
}
export interface FullPurchaseOrderItemWithPO
  extends BridalLivePurchaseOrderItem {
  purchaseOrder: BridalLivePurchaseOrder | null
}

export interface BridalLiveReceivingVoucherItem extends BaseBridalLiveObject {
  // 948
  version: number //  0
  createdDate: number // 1402596501000
  createdByUser: string // 'Emmy'
  modifiedDate: number // 1402596501000
  modifiedByUser: string // 'Emmy'
  modifiedDateAfter: null
  retailerIds: null
  tokenRetailerId: null
  receivingVoucherId: number //  598
  purchaseOrderId: number // 520
  purchaseOrderItemId: number // 1390
  sequenceNumber: number //  0
  inventoryItemId: number //  2679
  quantity: number // 4
  cost: number //  40.0
  vat: number // 0.0
  extCost: number // 160.0
  itemNumber: number // 194
  itemVendorItemName: string // 'RB324T'
  itemColor: string // 'Ivory'
  itemSize: string // ''
  itemColor2: string // ''
  status: string // 'C'
  contactId: null
  contactName: null
  contactHomePhoneNumber: null
  contactWorkPhoneNumber: null
  contactMobilePhoneNumber: null
  contactPreferredContactMethodId: null
  purchaseOrderNumber: null
  receivingVoucherNumber: null
  receiveDate: null
  trxNumber: null
  itemName: null
  itemDepartmentId: null
  quantityAvailableToReceive: null
}

export interface BridalLiveReceivingVoucher extends BaseBridalLiveObject {
  // 598,
  version: number // 0,
  createdDate: number // 1402596501000,
  createdByUser: string // "Emmy",
  modifiedDate: number // 1402596501000,
  modifiedByUser: string // "Emmy",
  modifiedDateAfter: null
  retailerIds: null
  tokenRetailerId: null
  receivingVoucherNumber: number // 100,
  vendorId: number // 199,
  vendorName: string // "J Picone",
  employeeId: number // 180,
  employeeName: string // "Emmy Gorman",
  receiveDate: string // "2014-06-12",
  invoiceDate: string // "2014-06-09",
  invoiceNumber: string // "3463",
  checkNumber: string // "718",
  subTotal: number // 160.00,
  discountAmount: number // 0.00,
  discountPercent: number // 0,
  freight: number // 5.35,
  fee: number // 0.00,
  totalAmount: number // 165.35,
  qbTxnId: string | null
  qboExportDateTime: null
  qbEditSequence: null
  status: string // "C",
  syncRecordId: null
  lineItems: BridalLiveReceivingVoucherItem[]
  vendor: null
  receiveDateBefore: null
  purchaseOrderNumber: string // ''
  purchaseOrderId: null
  vendorListId: null
  specialOrderSubtotal: null
  stockSubtotal: null
}

export interface FullReceivingVoucherItemWithRV
  extends BridalLiveReceivingVoucherItem {
  receivingVoucher: BridalLiveReceivingVoucher | null
}

// export interface SalesDataItem extends BridalLiveItem {
//   calculations: {
//     grossMargin: number
//     roi: number
//     comp?: {
//       qtySold: number
//       trend: number
//     }
//   }
// }

export interface BridalLivePayment extends BaseBridalLiveObject {
  amount: number
  amountRefunded: number
  changeAmount: number
  contactId: number
  contactName: string
  createdByUser: string
  createdDate: string
  date: string
  dateFormatted: string
  employeeId: number
  employeeName: string
  feeAmount: number
  fundedAmount: number
  fundedDate: string
  methodDescription: string
  methodId: number
  modifiedByUser: string
  modifiedDate: string
  modifiedDateAfter: string
  originalPaymentId: number
  partialApproval: boolean
  paymentMethod: any
  paymentMethodCategoryId: number
  paymentMethodDescription: string
  paymentPlanId: number
  payments: any[]
  previousAmount: number
  provider: string
  qbEditSequence: string
  qbTxnId: string
  qboExportDateTime: string
  receiptDetails: any
  receiptHTML: string
  receiptNumber: number
  registerId: number
  retailerIds: any[]
  sequenceNumber: number
  signature: any
  signatureImageURL: string
  splitNumber: number
  status: string
  syncRecordId: number
  tipAmount: number
  tipAmountRefunded: number
  tokenRetailerId: string
  totalAmountPaid: number
  transactionId: number
  transactions: any[]
  trx: BridalLivePosTransaction
  trxLineItems: any[]
  trxNumber: number
  trxStatus: string
  trxTypeId: number
  version: number
  xWebMethodDescription: string
  xWebTransactionIdString: string
  xwebAccountNumber: string
  xwebApprovalCode: string
  xwebTransactionId: string
  yearMonth: string
}

export interface BridalLiveVendor extends BaseBridalLiveObject {
  accountNumber: string
  address1: string
  address2: string
  city: string
  code: string
  colorGroups: any[]
  country: string
  createdByUser: string
  createdDate: string
  displayOnLookbook: boolean
  emailAddress: string
  faxNumber: string
  imageUrl: string
  isVendorVisibleOnLookbook: string
  marketplaceId: number
  modifiedByUser: string
  modifiedDate: string
  modifiedDateAfter: string
  name: string
  notes: string
  phoneNumber: string
  qbListId: string
  retailerIds: any[]
  retailerName: string
  sizeGroups: any[]
  smartMatchIgnored: boolean
  state: string
  status: string
  tokenRetailerId: string
  vatNumber: string
  vatPercent: number
  version: number
  websiteUrl: string
  zip: string
}

export interface LookbookAttribute extends BaseBridalLiveObject {
  // 17820
  version: number // 0
  retailerId: string // '5b19f2a7'
  createdDate: number // 1410538015000
  createdByUser: string // ''
  modifiedDate: string | null // null
  modifiedByUser: string | null // null
  modifiedDateAfter: string | null // null
  retailerIds: string | null // null
  tokenRetailerId: string | null // null
  itemId: number // 2525
  attributeId: number // 37
}

export interface BridalLiveItemImage extends BaseBridalLiveObject {
  // 4298
  version: number // 0
  createdDate: number // 1409864156000
  createdByUser: string // 'Shannon'
  modifiedDate: number // 1409864156000
  modifiedByUser: string // 'Shannon'
  modifiedDateAfter: null
  retailerIds: null
  tokenRetailerId: null
  inventoryItemId: number // 23197
  sequence: number // 0
  imageUrl: string // 'https://bl-online-item-pictures.s3.amazonaws.com/uploads%2F1409864153912-2166_Front.jpg'
  description: null
  itemIds: null
}

export interface PayloadItemAttribute {
  itemId: string // 4206720
  attributeId: string // 30
}

export interface TransactionItemJournalCriteria {
  retailerId: string
  page: number
  sortField: string
  sortDirection: string //asc' | 'desc';
  trxTypeId: number
  vendorIds: number[]
  departmentIds: number[]
  trxStartDate: string
  trxEndDate: string
  trxStatus: string
}

export interface SalesByItemCriteria {
  retailerId: string
  page: number
  sortField: string
  sortDirection: string //asc' | 'desc';
  trxTypeId: number
  vendorIds: number[]
  departmentIds: number[]
  trxStartDate: string
  trxEndDate: string
  trxStatus: string
}

export interface SalesByDeptCriteria {
  page: number // 1
  size?: number // 25
  sortField: string // 'totalPrice'
  sortDirection: string // 'desc'
  retailerId: string // '5b19f2a7'
  trxTypeId: number // -1
  vendorIds: number[] // []
  departmentIds: number[] // []
  trxStartDate: string // '2019-07-01'
  trxEndDate: string // '2019-07-31'
  trxStatus: string // 'P,C'
}

export interface ReceivingReportCriteria {
  retailerId: string
  attributeIds: number[] | null // []
  departmentId: string | number
  page: number // 0,
  sortDirection: string // "asc",
  sortField: string // "purchaseOrderNumber",
  rvStartDate: string // "2018-09-01",
  rvEndDate: string // "2019-09-30"
}

export interface PurchaseOrderCriteria {
  status: string //P' | 'C' | ''; //  Pending | Complete | All
  orderType: string //S' | 'C' | ''; // Stock | Customer | All
}

export interface ReceivingVoucherCriteria {
  status: string //P' | 'C' | ''; //  Pending | Complete | All
}

export interface ItemDetailsForLookbookCriteria {}

export interface ItemListCriteria {}

export interface ItemImagesCriteria {}
