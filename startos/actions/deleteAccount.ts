import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { listAccounts, runCtl } from '../utils'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  account: Value.text({
    name: i18n('Account ID'),
    description: i18n(
      'The ID of the account to delete, as shown by List Accounts and in the FMD app.',
    ),
    required: true,
    default: null,
  }),
})

export const deleteAccount = sdk.Action.withInput(
  // id
  'delete-account',

  // metadata
  async ({ effects }) => ({
    name: i18n('Delete Account'),
    description: i18n(
      'Permanently delete a device account and all of its locations and pictures.',
    ),
    warning: i18n(
      'This cannot be undone. The device must register again to use this server.',
    ),
    allowedStatuses: 'any',
    group: i18n('Accounts'),
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // optionally pre-fill the input form
  async () => null,

  // the execution function
  async ({ effects, input }) => {
    const account = input.account.trim()
    const accounts = await listAccounts(effects)
    if (!accounts.some((a) => a.name === account)) {
      throw new Error(i18n('No account with this ID exists'))
    }

    await runCtl(effects, ['deleteusers', account], 'delete\n')

    return {
      version: '1',
      title: i18n('Account Deleted'),
      message: i18n('The account and all of its data were deleted.'),
      result: null,
    }
  },
)
