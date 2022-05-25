import { DataFactory } from 'rdf-data-factory';
import { createLangStringResolver } from './lang_string';

test('lang string resolver returns valid lang string objects', async () => {
    const resolver = createLangStringResolver({ isArrayType: true });
    const factory = new DataFactory();
    const parentObject = {
        _rdf_iri: 'http://example.com/Garfield',
        description: [
            {
                value: factory.literal('Fat cat', 'en'),
            },
            {
                value: factory.literal('Tlustá kočka', 'cs'),
            },
            {
                value: factory.literal('Orange cat', 'en'),
            },
            {
                value: factory.literal('Fat cat (unknown language)'),
            },
        ],
    };

    // @ts-ignore
    const result = await resolver(parentObject, {}, undefined, {
        fieldName: 'description',
    });

    expect(result.en.length).toBe(2);
    expect(result.cs.length).toBe(1);
    expect(result._no_language.length).toBe(1);
});
