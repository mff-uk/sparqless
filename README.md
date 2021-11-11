# sparql2graphql
Trying to make SPARQL easy to use by adding a GraphQL facade! Coming soon ™

## Dependencies

Node 16.13.0 (Gallium LTS) - easily managed with [nvm](https://github.com/nvm-sh/nvm)

npm

## Development

Build, lint and test are run in GitHub Actions - required to pass for every PR and commit to `master`.

Development should follow [GitHub Flow](https://githubflow.github.io/) and commit messages should follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) spec.

## Useful commands

### Install dependencies

`npm ci`

### Compile everything

`npm run build`

### Linting

`npm run lint`

### Formatting (lint w/ autofix)

`npm run format`

### Testing

`npm test` will run tests with Jest and generate a testing + coverage report.
