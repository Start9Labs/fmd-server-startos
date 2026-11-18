import { registrationToken } from '../actions/registrationToken'
import { configYml } from '../fileModels/config.yml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const watchRegistrationToken = sdk.setupOnInit(async (effects) => {
  const token = await configYml.read((c) => c.RegistrationToken).const(effects)

  if (!token) {
    await sdk.action.createOwnTask(effects, registrationToken, 'critical', {
      reason: i18n(
        'Generate a registration token so only your devices can register on this server',
      ),
    })
  }
})
