export class QueryConfig {
    constructor(
        readonly templateConfig: QueryTemplateConfig,
        readonly executionConfig?: QueryExecutionConfig,
    ) {}
}

export class QueryTemplateConfig {
    constructor(readonly limit: number, readonly offset: number) {}
}

export class QueryExecutionConfig {
    constructor(readonly timeoutMs: number) {}
}
