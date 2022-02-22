export type SparqlEndpointUrl = string;

export class Endpoints {
    static endpointMapping: Record<string, SparqlEndpointUrl> = {
        'data.gov.cz': 'https://data.gov.cz/sparql',
        'eea.europa.eu': 'https://semantic.eea.europa.eu/sparql',
    };
}

export class EndpointDetails {
    constructor(
        readonly endpointName: string,
        readonly endpointUrl: SparqlEndpointUrl,
    ) {}
}
