export interface AttributeDescriptor {
    iri: string;
    name: string; // GraphQL friendly name - only contains [_a-zA-Z0-9]
    type: string;
    count: number;
}
