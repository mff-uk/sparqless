import { DataFactory } from 'rdf-data-factory';
import { createBooleanResolver } from './boolean';

test('boolean resolver returns booleans', async () => {
    const resolver = createBooleanResolver({ isArrayType: false });
    const factory = new DataFactory();
    const parentObject = {
        _rdf_iri: 'http://example.com/Garfield',
        isFat: [
            {
                value: factory.literal('true'),
            },
        ],
    };

    // @ts-ignore
    const result = await resolver(parentObject, {}, undefined, {
        fieldName: 'isFat',
    });

    expect(result).toBe(true);
});
