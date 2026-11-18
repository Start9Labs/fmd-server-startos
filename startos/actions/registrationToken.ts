import { utils } from '@start9labs/start-sdk'
import { configYml } from '../fileModels/config.yml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const registrationToken = sdk.Action.withoutInput(
  // id
  'registration-token',

  // metadata
  async ({ effects }) => ({
    name: i18n('Generate Registration Token'),
    description: i18n(
      'Generate a new token the FMD app must present to register a device on this server. Replaces any existing token.',
    ),
    warning: (await configYml.read((c) => c.RegistrationToken).const(effects))
      ? i18n(
          'Replaces the current registration token. Devices already registered are unaffected.',
        )
      : null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // the execution function
  async ({ effects }) => {
    const token = utils.getDefaultString({
      charset: 'a-z,A-Z,0-9',
      len: 32,
    })

    await configYml.merge(effects, { RegistrationToken: token })

    return {
      version: '1',
      title: i18n('Registration Token'),
      message: i18n(
        'Enter this token in the FMD app when registering a device with this server.',
      ),
      result: {
        type: 'single',
        value: token,
        masked: true,
        copyable: true,
        qr: true,
        launchable: false,
      },
    }
  },
)
