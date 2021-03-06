import {
  BridalLiveContact,
  BridalLiveItem,
  BridalLiveItemImage,
  BridalLivePayment,
  BridalLivePosTransaction,
  BridalLivePosTransactionLineItem,
  BridalLivePurchaseOrder,
  BridalLiveReceivingVoucher,
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
export interface MappedBridalLiveReceivingVouchers {
  [id: number]: BridalLiveReceivingVoucher
}
export interface MappedBridalLivePosTransactions {
  [id: number]: BridalLivePosTransaction
}
export interface MappedBridalLivePosTransactionLineItems {
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
  gowns: MappedBridalLiveItems
  contacts: MappedBridalLiveContacts
  purchaseOrders: MappedBridalLivePurchaseOrders
  receivingVouchers: MappedBridalLiveReceivingVouchers
  posTransactions: MappedBridalLivePosTransactions
  posTransactionItems: MappedBridalLivePosTransactionLineItems
  vendors: MappedBridalLiveVendors
  payments: MappedBridalLivePayments
  attributes: MappedBridalLiveAttributes
  itemImages: MappedBridalLiveItemImages
}

export type TrackedBridalLiveTypes =
  | BridalLiveItem
  | BridalLiveContact
  | BridalLivePurchaseOrder
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

export interface BridalLiveDemoData {
  gowns: { [originalId: number]: DemoItemData }
  vendors: { [originalId: number]: DemoVendorData }
}
