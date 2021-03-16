import { LookbookAttribute } from '../../../integrations/BridalLive/apiTypes'
import { logInfo } from '../../../logger'
import { DemoAccountSettings } from '../../../settings'
import { BridalLiveDemoData } from '../../../types'
import {
  dataIdInDemo,
  dataWasAddedToDemo,
  obfuscateBaseBridalLiveData,
} from './utils'

const StaticValues = {}

const obfuscateItemAttribute = (
  demoData: BridalLiveDemoData,
  demoSettings: DemoAccountSettings,
  itemAttribute: LookbookAttribute
) => {
  // if the corresponding item isn't in demoData, return null so this itemAttribute
  // doesn't get imported
  if (!dataWasAddedToDemo(demoData, 'items', itemAttribute.itemId)) {
    logInfo(`...no corresponding Item was created in demo data`)
    return null
  }

  // replace any identifying values
  logInfo(`...obfuscating itemAttribute data`)
  itemAttribute = obfuscateBaseBridalLiveData(itemAttribute)

  // set new item id
  itemAttribute.itemId = dataIdInDemo(demoData, 'items', itemAttribute.itemId)

  return {
    ...itemAttribute,
    ...StaticValues,
  }
}

export default obfuscateItemAttribute
