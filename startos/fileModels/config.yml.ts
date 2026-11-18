import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { dbDir, uiPort } from '../utils'

export const defaultMaxSavedLoc = 500
export const defaultMaxSavedPic = 10

const shape = z.looseObject({
  DatabaseDir: z.literal(dbDir).catch(dbDir),
  UnixSocketPath: z.literal('').catch(''),
  PortInsecure: z.literal(String(uiPort)).catch(String(uiPort)),
  PortSecure: z.literal('').catch(''),
  ServerCrt: z.literal('').catch(''),
  ServerKey: z.literal('').catch(''),
  RemoteIpHeader: z.literal('X-Forwarded-For').catch('X-Forwarded-For'),
  MetricsAddrPort: z.literal('[::1]:9100').catch('[::1]:9100'),
  RegistrationToken: z.string().catch(''),
  MaxSavedLoc: z.number().int().positive().catch(defaultMaxSavedLoc),
  MaxSavedPic: z.number().int().positive().catch(defaultMaxSavedPic),
  TileServerUrl: z.string().catch(''),
  LogLevel: z.string().catch('info'),
})

export const configYml = FileHelper.yaml(
  { base: sdk.volumes.main, subpath: '/config.yml' },
  shape,
)
