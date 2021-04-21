# The Great GraphQL Giraffe! 🦒

## Setup

1. `yarn`
2. Create a `.env`-file (see `.env.example` for sane defaults)

## Develop

1. `yarn watch`
2. Go  to `http://localhost:{4000 OR $PORT}`

## Build

- `yarn build`

## Run compiled

- `yarn start`

## Text keys

Text keys live in [Lokalise](https://lokalise.com/) and are exported from there with the script `yarn download-translations`.

This is the process for updating/adding text keys:

1. Make updates to text keys in Lokalise, i.e. add new text keys or update translations. Preferrably we use the Figma/Sketch
    plugin to export text keys and translations directly from design.
2. Download updates from Lokalise by using `yarn download-translations`
    1. Ensure you have installed  the [Lokalise CLI tool](https://github.com/lokalise/lokalise-cli-2-go)
    2. Generate an API token in your [Lokalise profile page](https://app.lokalise.com/profile)
    3. Run `yarn download-translations` and follow the instructions
    4. All text keys tagged with "giraffe" will be exported to the translation JSON files. 🤑