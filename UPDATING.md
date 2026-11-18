# Updating the upstream version

## Determining the upstream version

The pin is `dockerVersion` in `startos/manifest/index.ts`, a tag of `registry.gitlab.com/fmd-foss/fmd-server`. Upstream tags images without a `v` prefix (`0.17.1`), while its GitLab releases carry one (`v0.17.1`).

Read the latest release:

```bash
curl -s 'https://gitlab.com/api/v4/projects/fmd-foss%2Ffmd-server/releases?per_page=1' | jq -r '.[0].tag_name'
```

Confirm the image tag exists for both architectures before pinning it:

```bash
docker manifest inspect registry.gitlab.com/fmd-foss/fmd-server:<version> | jq -r '.manifests[].platform.architecture'
```

## Applying the bump

1. Set `dockerVersion` in `startos/manifest/index.ts` to the release without its `v`.
2. Set the version in `startos/versions/current.ts` to `<version>:0` and rewrite its release notes.
3. Read the release's notes and `config.example.yml` at the new tag for added, renamed or removed config keys, and reflect any that matter in `startos/fileModels/config.yml.ts`.
4. Check that `fmd-server-ctl listusers` still prints its table to stdout in the format `listAccounts` in `startos/utils.ts` parses.
