export const DEFAULT_LANG = 'en_US'

const dict = {
  'Starting FMD Server!': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,
  'The FMD Server web interface, and the address the FMD app registers with': 4,
  'Generate Registration Token': 5,
  'Generate a new token the FMD app must present to register a device on this server. Replaces any existing token.': 6,
  'Replaces the current registration token. Devices already registered are unaffected.': 7,
  'Registration Token': 8,
  'Enter this token in the FMD app when registering a device with this server.': 9,
  'Generate a registration token so only your devices can register on this server': 10,
  Settings: 11,
  'Set how much history FMD Server keeps for each device, and which map tile server the web interface uses.': 12,
  'Saved Locations per Device': 13,
  'How many location points FMD Server keeps for each device. Older points are deleted.': 14,
  'Saved Pictures per Device': 15,
  'How many pictures FMD Server keeps for each device. Older pictures are deleted.': 16,
  'Map Tile Server': 17,
  'URL template of the map tile server the web interface loads maps from, such as https://tile.openstreetmap.org/{z}/{x}/{y}.png. Leave empty to use OpenStreetMap.': 18,
  'Must be an https:// URL containing {z}, {x} and {y}': 19,
  Accounts: 20,
  'List Accounts': 21,
  'Show every device account registered on this server and when it was last seen.': 22,
  'No devices are registered on this server.': 23,
  'Last seen: ${time}': 24,
  'Delete Account': 25,
  'Account ID': 26,
  'The ID of the account to delete, as shown by List Accounts and in the FMD app.': 27,
  'Permanently delete a device account and all of its locations and pictures.': 28,
  'This cannot be undone. The device must register again to use this server.': 29,
  'No account with this ID exists': 30,
  'Account Deleted': 31,
  'The account and all of its data were deleted.': 32,
  'Never seen': 33,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
