import { BridalLivePayment } from '../../../integrations/BridalLive/apiTypes'
import { logInfo } from '../../../logger'
import {
  BL_DEMO_ACCT_EMPLOYEE_ID,
  BL_DEMO_ACCT_EMPLOYEE_NAME,
  BL_DEMO_ACCT_PAYMENT_METHOD_DESCRIPTION,
  BL_DEMO_ACCT_PAYMENT_METHOD_ID,
} from '../../../settings'
import { BridalLiveDemoData } from '../../../types'
import {
  dataIdInDemo,
  dataWasAddedToDemo,
  obfuscateBaseBridalLiveData,
  obfuscateDateAsBridalLiveString,
} from './utils'

const StaticValues: Pick<
  BridalLivePayment,
  | 'employeeId'
  | 'employeeName'
  | 'methodId'
  | 'methodDescription'
  | 'registerId'
> = {
  employeeId: BL_DEMO_ACCT_EMPLOYEE_ID,
  employeeName: BL_DEMO_ACCT_EMPLOYEE_NAME,
  methodId: BL_DEMO_ACCT_PAYMENT_METHOD_ID,
  methodDescription: BL_DEMO_ACCT_PAYMENT_METHOD_DESCRIPTION,
  registerId: 0,
}

export interface BridalLivePaymentObfuscationData {
  cleanData: BridalLivePayment
  originalPosTransactionId: number
}

const obfuscatePayment = (
  demoData: BridalLiveDemoData,
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

  return {
    cleanData: {
      ...payment,
      ...StaticValues,
    },
    originalPosTransactionId: originalTrxId,
  }
}

export default obfuscatePayment
