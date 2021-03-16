import { BridalLiveItemImage } from '../../../integrations/BridalLive/apiTypes'
import { logInfo } from '../../../logger'
import { DemoAccountSettings } from '../../../settings'
import { BridalLiveDemoData } from '../../../types'
import {
  dataIdInDemo,
  dataWasAddedToDemo,
  obfuscateBaseBridalLiveData,
} from './utils'

const StaticValues = {}

const obfuscateItemImage = (
  demoData: BridalLiveDemoData,
  demoSettings: DemoAccountSettings,
  itemImage: BridalLiveItemImage
) => {
  // if the corresponding item isn't in demoData, return null so this itemImage
  // doesn't get imported
  if (!dataWasAddedToDemo(demoData, 'items', itemImage.inventoryItemId)) {
    logInfo(`...no corresponding Item was created in demo data`)
    return null
  }

  // replace any identifying values
  logInfo(`...obfuscating itemImage data`)
  itemImage = obfuscateBaseBridalLiveData(itemImage)

  // set new item id
  itemImage.inventoryItemId = dataIdInDemo(
    demoData,
    'items',
    itemImage.inventoryItemId
  )

  return {
    ...itemImage,
    ...StaticValues,
  }
}

export default obfuscateItemImage
