import { QueryConfig } from './query_config';
import * as fs from 'fs';
import { renderString } from 'nunjucks';

export class QueryLoader {
    private readonly configTemplate: string =
        'LIMIT {{ limit }}\nOFFSET {{ offset }}';

    constructor(private readonly config: QueryConfig) {}

    /**
     * Load query with configured settings and return the query string.
     * The configured options (limit, offset) will be appended
     * to the end of the query.
     *
     * @param {string} filePath Path to the query file to load.
     * @return {string} Loaded query string.
     */
    load_query(filePath: string): string {
        const loadedQuery = fs.readFileSync(filePath).toString();
        const renderedConfig = renderString(
            this.configTemplate,
            this.config.templateConfig,
        );
        return `${loadedQuery}\n${renderedConfig}`;
    }
}
