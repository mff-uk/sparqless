import { GraphQLObjectType } from 'graphql';
import { Config } from '../../api/config';
import { ClassDescriptor } from '../../models/class';
import { createClassResolver } from './class';

test('class resolver returns instance of object with requested IRI', async () => {
    const classDescriptor: ClassDescriptor = {
        iri: 'http://www.w3.org/ns/dcat#Catalog',
        name: 'Catalog',
        attributes: [
            {
                iri: 'http://xmlns.com/foaf/0.1/homepage',
                name: 'homepage',
                isArray: false,
                count: 10,
                languages: [],
                types: ['string'],
            },
        ],
        associations: [],
        numberOfInstances: 42,
    };
    // @ts-ignore
    const config: Config = {
        endpoint: {
            url: 'https://data.gov.cz/sparql',
            name: 'CZ Government Open Data',
        },
    };
    const resolver = createClassResolver(
        classDescriptor,
        {
            isArrayType: false,
            instanceIri:
                'https://data.gov.cz/zdroj/lokální-katalogy/00551023/861588425',
            areFieldsOptional: true,
        },
        config,
    );

    // @ts-ignore
    const result = await resolver(undefined, {}, undefined, {
        fieldNodes: [
            {
                selectionSet: {
                    selections: [
                        {
                            name: {
                                value: 'homepage',
                                kind: 'Name',
                            },
                            kind: 'Field',
                        },
                    ],
                    kind: 'SelectionSet',
                },
                kind: 'Field',
                name: {
                    kind: 'Name',
                    value: 'Catalog',
                },
            },
        ],
        // @ts-ignore
        parentType: {
            // @ts-ignore
            getFields: () => {
                return {
                    Catalog: {
                        type: new GraphQLObjectType({
                            name: 'Catalog',
                            fields: {
                                homepage: {
                                    // @ts-ignore
                                    type: {
                                        name: 'homepage',
                                    },
                                },
                            },
                        }),
                        args: {},
                    },
                };
            },
            name: 'Query',
        },
    });

    expect(result.homepage[0].value.value).toBe('https://data.mpsv.cz');
});
