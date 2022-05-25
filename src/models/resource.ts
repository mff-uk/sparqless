/**
 * Describes any RDF resource, i.e. anything with an IRI.
 *
 * The `name` field represents a GraphQL compatible identifier.
 */
export interface ResourceDescriptor {
    iri: string;

    /**
     * Should be a GraphQL friendly name - can only contain [_a-zA-Z0-9]
     */
    name: string;
}
