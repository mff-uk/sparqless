import { DataFactory } from 'rdf-data-factory';
import { createIntResolver } from './int';

test('int resolver returns ints', async () => {
    const resolver = createIntResolver({ isArrayType: false });
    const factory = new DataFactory();
    const parentObject = {
        _rdf_iri: 'http://example.com/Garfield',
        age: [
            {
                value: factory.literal('42'),
            },
        ],
    };

    // @ts-ignore
    const result = await resolver(parentObject, {}, undefined, {
        fieldName: 'age',
    });

    expect(result).toBe(42);
});
