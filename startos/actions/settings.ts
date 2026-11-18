import {
  configYml,
  defaultMaxSavedLoc,
  defaultMaxSavedPic,
} from '../fileModels/config.yml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  maxSavedLoc: Value.number({
    name: i18n('Saved Locations per Device'),
    description: i18n(
      'How many location points FMD Server keeps for each device. Older points are deleted.',
    ),
    required: true,
    default: defaultMaxSavedLoc,
    min: 1,
    max: 3999,
    integer: true,
  }),
  maxSavedPic: Value.number({
    name: i18n('Saved Pictures per Device'),
    description: i18n(
      'How many pictures FMD Server keeps for each device. Older pictures are deleted.',
    ),
    required: true,
    default: defaultMaxSavedPic,
    min: 1,
    max: 99,
    integer: true,
  }),
  tileServerUrl: Value.text({
    name: i18n('Map Tile Server'),
    description: i18n(
      'URL template of the map tile server the web interface loads maps from, such as https://tile.openstreetmap.org/{z}/{x}/{y}.png. Leave empty to use OpenStreetMap.',
    ),
    required: false,
    default: null,
    placeholder: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    patterns: [
      {
        regex: '^https://(?=.*\\{z\\})(?=.*\\{x\\})(?=.*\\{y\\}).*$',
        description: i18n(
          'Must be an https:// URL containing {z}, {x} and {y}',
        ),
      },
    ],
  }),
})

export const settings = sdk.Action.withInput(
  // id
  'settings',

  // metadata
  async ({ effects }) => ({
    name: i18n('Settings'),
    description: i18n(
      'Set how much history FMD Server keeps for each device, and which map tile server the web interface uses.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // optionally pre-fill the input form
  async ({ effects }) => {
    const config = await configYml.read().once()
    return {
      maxSavedLoc: config?.MaxSavedLoc ?? defaultMaxSavedLoc,
      maxSavedPic: config?.MaxSavedPic ?? defaultMaxSavedPic,
      tileServerUrl: config?.TileServerUrl || null,
    }
  },

  // the execution function
  async ({ effects, input }) => {
    await configYml.merge(effects, {
      MaxSavedLoc: input.maxSavedLoc,
      MaxSavedPic: input.maxSavedPic,
      TileServerUrl: input.tileServerUrl ?? '',
    })
  },
)
