import {
  BridalLiveContact,
  BridalLiveItem,
  BridalLiveItemImage,
  BridalLivePayment,
  BridalLivePosTransaction,
  BridalLivePosTransactionLineItem,
  BridalLivePurchaseOrder,
  BridalLivePurchaseOrderItem,
  BridalLiveReceivingVoucher,
  BridalLiveReceivingVoucherItem,
  BridalLiveVendor,
  LookbookAttribute,
} from './integrations/BridalLive/apiTypes'

export interface MappedBridalLiveItems {
  [id: number]: BridalLiveItem
}
export interface MappedBridalLiveContacts {
  [id: number]: BridalLiveContact
}
export interface MappedBridalLivePurchaseOrders {
  [id: number]: BridalLivePurchaseOrder
}
export interface MappedBridalLivePurchaseOrderItems {
  [id: number]: BridalLivePurchaseOrderItem
}
export interface MappedBridalLiveReceivingVouchers {
  [id: number]: BridalLiveReceivingVoucher
}
export interface MappedBridalLiveReceivingVoucherItems {
  [id: number]: BridalLiveReceivingVoucherItem
}
export interface MappedBridalLivePosTransactions {
  [id: number]: BridalLivePosTransaction
}
export interface MappedBridalLivePosTransactionItems {
  [id: number]: BridalLivePosTransactionLineItem
}
export interface MappedBridalLiveVendors {
  [id: number]: BridalLiveVendor
}
export interface MappedBridalLivePayments {
  [id: number]: BridalLivePayment
}
export interface MappedBridalLiveAttributes {
  [id: number]: LookbookAttribute
}
export interface MappedBridalLiveItemImages {
  [id: number]: BridalLiveItemImage
}

export interface BridalLiveCustomerData {
  items: MappedBridalLiveItems
  purchaseOrders: MappedBridalLivePurchaseOrders
  purchaseOrderItems: MappedBridalLivePurchaseOrderItems
  receivingVouchers: MappedBridalLiveReceivingVouchers
  receivingVoucherItems: MappedBridalLiveReceivingVoucherItems
  posTransactions: MappedBridalLivePosTransactions
  posTransactionItems: MappedBridalLivePosTransactionItems
  vendors: MappedBridalLiveVendors
  attributes: MappedBridalLiveAttributes
  itemImages: MappedBridalLiveItemImages
  // contacts: MappedBridalLiveContacts
  // payments: MappedBridalLivePayments
}

export type TrackedBridalLiveTypes =
  | BridalLiveItem
  | BridalLiveContact
  | BridalLivePurchaseOrder
  | BridalLivePurchaseOrderItem
  | BridalLiveReceivingVoucher
  | BridalLivePosTransaction
  | BridalLivePosTransactionLineItem
  | BridalLiveVendor
  | BridalLivePayment

export interface DemoData<T> {
  newId: number
  cleanData: T
}

export interface DemoItemData extends DemoData<BridalLiveItem> {}
export interface DemoVendorData extends DemoData<BridalLiveVendor> {}
export interface DemoItemImagesData extends DemoData<BridalLiveItemImage> {}
export interface DemoAttributesData extends DemoData<LookbookAttribute> {}
export interface DemoPurchaseOrdersData
  extends DemoData<BridalLivePurchaseOrder> {}
export interface DemoPurchaseOrderItemsData
  extends DemoData<BridalLivePurchaseOrderItem> {}

export interface DemoReceivingVouchersData
  extends DemoData<BridalLiveReceivingVoucher> {}
export interface DemoReceivingVoucherItemsData
  extends DemoData<BridalLiveReceivingVoucherItem> {}

export interface DemoPosTransactionData
  extends DemoData<BridalLivePosTransaction> {}
export interface DemoPosTransactionItemsData
  extends DemoData<BridalLivePosTransactionLineItem> {}

export interface BridalLiveDemoData {
  items: { [originalId: number]: DemoItemData }
  vendors: { [originalId: number]: DemoVendorData }
  itemImages: { [originalId: number]: DemoItemImagesData }
  attributes: { [originalId: number]: DemoAttributesData }
  purchaseOrders: { [originalId: number]: DemoPurchaseOrdersData }
  purchaseOrderItems: { [originalId: number]: DemoPurchaseOrderItemsData }
  receivingVouchers: { [originalId: number]: DemoReceivingVouchersData }
  receivingVoucherItems: { [originalId: number]: DemoReceivingVoucherItemsData }
  posTransactions: { [originalId: number]: DemoPosTransactionData }
  posTransactionItems: { [originalId: number]: DemoPosTransactionItemsData }
}
