import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { listAccounts as readAccounts } from '../utils'

export const listAccounts = sdk.Action.withoutInput(
  // id
  'list-accounts',

  // metadata
  async ({ effects }) => ({
    name: i18n('List Accounts'),
    description: i18n(
      'Show every device account registered on this server and when it was last seen.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Accounts'),
    visibility: 'enabled',
  }),

  // the execution function
  async ({ effects }) => {
    const accounts = await readAccounts(effects)

    if (!accounts.length) {
      return {
        version: '1',
        title: i18n('Accounts'),
        message: i18n('No devices are registered on this server.'),
        result: null,
      }
    }

    return {
      version: '1',
      title: i18n('Accounts'),
      message: null,
      result: {
        type: 'group',
        value: accounts.map(({ name, lastSeen }) => ({
          type: 'single' as const,
          name,
          description: lastSeen
            ? i18n('Last seen: ${time}', { time: lastSeen })
            : i18n('Never seen'),
          value: name,
          masked: false,
          copyable: true,
          qr: false,
          launchable: false,
        })),
      },
    }
  },
)
