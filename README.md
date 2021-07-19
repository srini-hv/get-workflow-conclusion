# setup-gradle-cli

[![Tests](https://github.com/hv-actions/setup-gradle-cli/actions/workflows/test.yml/badge.svg)](https://github.com/hv-actions/setup-gradle-cli/actions/workflows/test.yml)

Action to set up [Gradle CLI](https://gradle.org/) and add it to the `PATH`.

This Action enables you to run Gradle CLI commands as part of your workflow.

## Example

```yaml
on:
  push:
    branches:
      - main
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: hv-actions/setup-gradle-cli@v1
        with:
          gradle-version: "7.1.1"
      - run: gradle -v
```

## Inputs

### `version`

The Gradle CLI version to install. Installs the latest version by default.


## License

This project is licensed under the [Apache-2.0 License](LICENSE).
