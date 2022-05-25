import { DataFactory } from 'rdf-data-factory';
import { createStringResolver } from './string';

test('string resolver returns strings', async () => {
    const resolver = createStringResolver({ isArrayType: false });
    const factory = new DataFactory();
    const parentObject = {
        _rdf_iri: 'http://example.com/Garfield',
        name: [
            {
                value: factory.literal('Garfield'),
            },
        ],
    };

    // @ts-ignore
    const result = await resolver(parentObject, {}, undefined, {
        fieldName: 'name',
    });

    expect(result).toBe('Garfield');
});
