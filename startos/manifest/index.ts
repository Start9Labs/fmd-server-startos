import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

const dockerImage = 'registry.gitlab.com/fmd-foss/fmd-server'
const dockerVersion = '0.17.1'

export const manifest = setupManifest({
  id: 'fmd-server',
  title: 'FMD Server',
  license: 'GPL-3.0-or-later',
  packageRepo: 'https://github.com/Start9Labs/fmd-server-startos',
  upstreamRepo: 'https://gitlab.com/fmd-foss/fmd-server',
  marketingUrl: 'https://fmd-foss.org',
  donationUrl: 'https://liberapay.com/FMD',
  description: { short, long },
  volumes: ['main'],
  images: {
    'fmd-server': {
      source: { dockerTag: `${dockerImage}:${dockerVersion}` },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
