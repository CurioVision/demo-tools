import { BridalLiveItemImage } from '../../../integrations/BridalLive/apiTypes'
import { logInfo } from '../../../logger'
import { BridalLiveDemoData } from '../../../types'
import {
  itemIdInDemoData,
  itemWasAddedToDemoData,
  obfuscateBaseBridalLiveData,
} from './utils'

const StaticValues = {}

const obfuscateItemImage = (
  demoData: BridalLiveDemoData,
  itemImage: BridalLiveItemImage
) => {
  // if the corresponding item isn't in demoData, return null so this itemImage
  // doesn't get imported
  if (!itemWasAddedToDemoData(demoData, itemImage.inventoryItemId)) {
    logInfo(`...no corresponding Item was created in demo data`)
    return null
  }

  // replace any identifying values
  logInfo(`...obfuscating itemImage data`)
  itemImage = obfuscateBaseBridalLiveData(itemImage)

  // set new item id
  itemImage.inventoryItemId = itemIdInDemoData(
    demoData,
    itemImage.inventoryItemId
  )

  return {
    ...itemImage,
    ...StaticValues,
  }
}

export default obfuscateItemImage
