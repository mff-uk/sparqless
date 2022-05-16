# Development

Build, lint and test are automatically run in GitHub Actions.
They are required to pass for every PR and commit to `master`.

Contributions should be in the form of PRs opened against `master`, containing a comprehensive
description of what was changed and why. Bonus points if you include a video or screenshot
showcasing the functionality. Tests should also be included with contributions.

Development should follow [GitHub Flow](https://githubflow.github.io/) and commit messages
should follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) spec.

## Useful commands

The following commands will likely be useful to you during development.

### Install dependencies

`npm ci` or `npm install` - both will install the dependencies,
but `npm ci` will make sure that they match `package-lock.json` exactly,
and may take longer to run.

### Compile everything

`npm run build` will compile the TypeScript files.

### Linting

`npm run lint` will list all linting issues without fixing them automatically.

### Formatting (lint w/ autofix)

`npm run format` will run linting and auto-fix all possible issues.

### Running

`npm start` will start the app.

Alternatively, if you use VSCode for development, a `Debug API` debug config
is included in the repository. Running this debugging config will automatically
compile the required files and run `src/main.ts` in debug mode.

### Testing

`npm test` will run tests with Jest and generate a testing + coverage report.
