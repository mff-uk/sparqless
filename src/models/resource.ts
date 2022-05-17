export interface ResourceDescriptor {
    iri: string;

    /**
     * Should be a GraphQL friendly name - can only contain [_a-zA-Z0-9]
     */
    name: string;
}
