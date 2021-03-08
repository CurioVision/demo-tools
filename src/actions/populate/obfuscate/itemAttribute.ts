import { LookbookAttribute } from '../../../integrations/BridalLive/apiTypes'
import { logInfo } from '../../../logger'
import { BridalLiveDemoData } from '../../../types'
import {
  itemIdInDemoData,
  itemWasAddedToDemoData,
  obfuscateBaseBridalLiveData,
} from './utils'

const StaticValues = {}

const obfuscateItemAttribute = (
  demoData: BridalLiveDemoData,
  itemAttribute: LookbookAttribute
) => {
  // if the corresponding item isn't in demoData, return null so this itemAttribute
  // doesn't get imported
  if (!itemWasAddedToDemoData(demoData, itemAttribute.itemId)) {
    logInfo(`...no corresponding Item was created in demo data`)
    return null
  }

  // replace any identifying values
  logInfo(`...obfuscating itemAttribute data`)
  itemAttribute = obfuscateBaseBridalLiveData(itemAttribute)

  // set new item id
  itemAttribute.itemId = itemIdInDemoData(demoData, itemAttribute.itemId)

  return {
    ...itemAttribute,
    ...StaticValues,
  }
}

export default obfuscateItemAttribute
