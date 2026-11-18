import { configYml } from './fileModels/config.yml'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { configPath, dbDir, fmdMounts, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting FMD Server!'))

  await configYml.read().const(effects)

  const subcontainer = await sdk.SubContainer.of(
    effects,
    { imageId: 'fmd-server' },
    fmdMounts(),
    'fmd-server-sub',
  )

  return sdk.Daemons.of(effects)
    .addOneshot('chown', {
      subcontainer,
      exec: {
        command: [
          'sh',
          '-c',
          `mkdir -p ${dbDir} && chown -R fmd-server:fmd-server ${dbDir}`,
        ],
        user: 'root',
      },
      requires: [],
    })
    .addDaemon('primary', {
      subcontainer,
      exec: {
        command: ['/opt/fmd-server', 'serve', '--config', configPath],
      },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('The web interface is ready'),
            errorMessage: i18n('The web interface is not ready'),
          }),
      },
      requires: ['chown'],
    })
})
