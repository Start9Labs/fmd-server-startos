import { T } from '@start9labs/start-sdk'
import { sdk } from './sdk'

export const uiPort = 8080
export const dataDir = '/data'
export const configPath = `${dataDir}/config.yml`
export const dbDir = `${dataDir}/db`
export const ctlPath = '/opt/fmd-server-ctl'

export function fmdMounts() {
  return sdk.Mounts.of().mountVolume({
    volumeId: 'main',
    subpath: null,
    mountpoint: dataDir,
    readonly: false,
  })
}

// `fmd-server-ctl` takes `--db-dir` only before its subcommand, so the database
// path is passed through the environment instead.
export async function runCtl(
  effects: T.Effects,
  command: string[],
  input?: string,
) {
  return sdk.SubContainer.withTemp(
    effects,
    { imageId: 'fmd-server' },
    fmdMounts(),
    'fmd-server-ctl',
    (subc) =>
      subc.execFail([ctlPath, ...command], {
        env: { FMD_DATABASEDIR: dbDir },
        input,
        user: 'fmd-server',
      }),
  )
}

export type Account = { name: string; lastSeen: string | null }

export async function listAccounts(effects: T.Effects): Promise<Account[]> {
  const { stdout } = await runCtl(effects, ['listusers', '--limit', '1000000'])
  const lines = String(stdout).split('\n')
  const ruler = lines.findIndex((l) => /^-+$/.test(l.trim()))
  if (ruler < 0) return []
  return lines
    .slice(ruler + 1)
    .map((l) => l.trim().split(/\s+/))
    .filter((cols) => cols[0])
    .map(([name, lastSeen]) => ({
      name,
      lastSeen: !lastSeen || Date.parse(lastSeen) <= 0 ? null : lastSeen,
    }))
}
