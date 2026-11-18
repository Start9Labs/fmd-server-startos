import { configYml } from '../fileModels/config.yml'
import { sdk } from '../sdk'

export const seedFiles = sdk.setupOnInit(async (effects) => {
  await configYml.merge(effects, {})
})
