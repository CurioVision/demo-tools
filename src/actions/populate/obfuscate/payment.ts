import { BridalLivePayment } from '../../../integrations/BridalLive/apiTypes'
import { logInfo } from '../../../logger'
import { DemoAccountSettings } from '../../../settings'
import { BridalLiveDemoData } from '../../../types'
import {
  dataIdInDemo,
  dataWasAddedToDemo,
  obfuscateBaseBridalLiveData,
  obfuscateDateAsBridalLiveString,
} from './utils'

const StaticValues: Pick<BridalLivePayment, 'registerId'> = {
  registerId: 0,
}

export interface BridalLivePaymentObfuscationData {
  cleanData: BridalLivePayment
  originalPosTransactionId: number
}

const obfuscatePayment = (
  demoData: BridalLiveDemoData,
  demoSettings: DemoAccountSettings,
  payment: BridalLivePayment
): BridalLivePaymentObfuscationData => {
  const originalTrxId = payment.transactionId
  // if no pos transaction was imported into the demo account, return null so
  // this line item doesn't get imported
  if (!dataWasAddedToDemo(demoData, 'posTransactions', originalTrxId)) {
    logInfo(
      `...no corresponding Pos Transaction was created in demo data for original ID: ${originalTrxId}`
    )
    return null
  }

  const demoDataTransactionId = dataIdInDemo(
    demoData,
    'posTransactions',
    originalTrxId
  )

  logInfo(`...Payment has corresponding Pos Transaction in demo data. 
  \tORIGINAL POS TRANSACTION ID: ${payment.transactionId}
  \tDEMO POS TRANSACTION ID: ${demoDataTransactionId}`)

  // replace any identifying values
  logInfo(`...obfuscating payment data`)
  payment = obfuscateBaseBridalLiveData(payment)

  // obfuscate date
  payment.date = obfuscateDateAsBridalLiveString(payment.date)

  // set the new pos transaction id id
  payment.transactionId = demoDataTransactionId

  // set new demo account values
  payment.employeeId = demoSettings.employeeId // BL_DEMO_ACCT_EMPLOYEE_ID,
  payment.employeeName = demoSettings.employeeName // BL_DEMO_ACCT_EMPLOYEE_NAME,
  payment.methodId = demoSettings.paymentMethodId // BL_DEMO_ACCT_PAYMENT_METHOD_ID,
  payment.methodDescription = demoSettings.paymentMethodDescription // BL_DEMO_ACCT_PAYMENT_METHOD_DESCRIPTION,

  return {
    cleanData: {
      ...payment,
      ...StaticValues,
    },
    originalPosTransactionId: originalTrxId,
  }
}

export default obfuscatePayment
