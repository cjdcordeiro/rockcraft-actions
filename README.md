[![Test the action](https://github.com/canonical/action-build-rock/actions/workflows/test.yml/badge.svg)](https://github.com/canonical/action-build-rock/actions/workflows/test.yml)

# Rockcraft Build Action

This is a custom GitHub Action that can be used to build a ROCK, using
[Rockcraft](https://canonical-rockcraft.readthedocs-hosted.com/en/latest/).

If a project already contains a `rockcraft.yaml` file, then it is sufficient to:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: canonical/action-rockcraft-build@latest
```

This will invoke a composition action 