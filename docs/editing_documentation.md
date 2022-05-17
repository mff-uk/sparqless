# Editing documentation

This documentation is generated using [mkdocs](https://www.mkdocs.org/) from the Markdown files
in the `docs` directory, and manually deployed to GitHub Pages with `mkdocs gh-deploy`.
The URL for the deployed documentation is
[https://yawnston.github.io/sparql2graphql/](https://yawnston.github.io/sparql2graphql/).

If you want to modify the documentation, simply modify the Markdown source
of whichever documentation you wish. If you create a new documentation page,
you will need to add it to the `nav` in `mkdocs.yml`:

```yaml
nav:
  - Home: 'index.md'
  - 'User Guide':
    - Usage: 'usage.md'
  - 'How it works':
    - Overview: 'overview.md'
    - Observation: 'observation.md'
    - Parsing: 'model_parsing.md'
    - Postprocessing: 'postprocessing.md'
    - 'Schema Creation': 'schema.md'
    - Querying: 'querying.md'
  - 'Developer Guide':
    - Development: 'development.md'
```

## Installing requirements

In order to build, serve or deploy the documentation, you will
need to have Python 3 installed, since it is required to run [mkdocs](https://www.mkdocs.org/).

To install mkdocs and other required plugins, run `pip install -r requirements.txt`.

## Viewing documentation locally

Run `mkdocs serve` to build the documentation and serve it on localhost.
In the terminal, you will see a link to open this documentation
in your web browser.

## Generating PDF documentation

If for any reason you want to have a PDF version of the documentation,
run `mkdocs build`. This will generate a PDF containing the documentation
in `site/pdf/documentation.pdf`.

Note that you may see an error about a missing theme during build - this is unavoidable
when using the same `mkdocs.yaml` for both the website and the PDF documentation, and you
may safely ignore this error.

## Deploying documentation

If you want to deploy the documentation to GitHub Pages, run `mkdocs gh-deploy`,
and the updated documentation should be available at
[https://yawnston.github.io/sparql2graphql/](https://yawnston.github.io/sparql2graphql/)
within a few minutes. Note that you may need to refresh the page without caching in order
to see the changes (`Ctrl` + `F5` or `Shift` + `F5` in Google Chrome).
