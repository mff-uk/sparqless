export interface SPARQLEndpointDefinition {
    url: string;
    name: string;
}

/**
 * List of pre-configured SPARQL endpoints for development.
 *
 * Can be extended at will.
 */
export const ENDPOINTS: SPARQLEndpointDefinition[] = [
    {
        url: 'https://dev.nkod.opendata.cz/sparql',
        name: 'NKOD',
    },
    {
        url: 'https://linked.opendata.cz/sparql',
        name: 'OpenData.cz',
    },
    {
        url: 'http://dbpedia.org/sparql',
        name: 'DBPedia',
    },
    {
        url: 'http://www.scholarlydata.org/sparql/',
        name: 'ScholarlyData.org',
    },
    {
        url: 'https://ldf.fi/ww1lod/sparql',
        name: 'WW1 as LOD',
    },
    {
        url: 'https://ruian.linked.opendata.cz/sparql',
        name: 'RUIAN',
    },
    {
        url: 'https://data.ox.ac.uk/sparql/',
        name: 'University of Oxford',
    },
    {
        url: 'https://openei.org/sparql',
        name: 'OpenEI',
    },
    {
        url: 'http://linkedgeodata.org/sparql',
        name: 'LinkedGeoData',
    },
    {
        url: 'http://setaria.oszk.hu/sparql',
        name: 'Hungarian National Library catalog',
    },
    {
        url: 'https://semantic.eea.europa.eu/sparql',
        name: 'European Environment Agency',
    },
    {
        url: 'https://environment.data.gov.uk/sparql/bwq/query',
        name: 'UK Environment Agency bathing water quality',
    },
    {
        url: 'http://data.allie.dbcls.jp/sparql',
        name: 'Allie database of abbreviations in life sciences',
    },
];
