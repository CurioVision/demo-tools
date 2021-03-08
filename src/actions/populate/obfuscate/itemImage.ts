import { BridalLiveItemImage } from '../../../integrations/BridalLive/apiTypes'
import { logInfo } from '../../../logger'
import { BridalLiveDemoData } from '../../../types'
import { obfuscateBaseBridalLiveData } from './utils'

const StaticValues = {}

const obfuscateItemImage = (
  demoData: BridalLiveDemoData,
  itemImage: BridalLiveItemImage
) => {
  // if the corresponding item isn't in demoData, return null so this itemImage
  // doesn't get imported
  if (
    !demoData.gowns.hasOwnProperty(itemImage.inventoryItemId) ||
    !demoData.gowns[itemImage.inventoryItemId].newId
  ) {
    logInfo(`...no corresponding Item was created in demo data`)
    return null
  }

  // replace any identifying values
  logInfo(`...obfuscating itemImage data`)
  itemImage = obfuscateBaseBridalLiveData(itemImage)

  // set new item id
  itemImage.inventoryItemId = demoData.gowns[itemImage.inventoryItemId].newId

  return {
    ...itemImage,
    ...StaticValues,
  }
}

export default obfuscateItemImage
