import { sdk } from '../sdk'
import { deleteAccount } from './deleteAccount'
import { listAccounts } from './listAccounts'
import { registrationToken } from './registrationToken'
import { settings } from './settings'

export const actions = sdk.Actions.of()
  .addAction(registrationToken)
  .addAction(settings)
  .addAction(listAccounts)
  .addAction(deleteAccount)
