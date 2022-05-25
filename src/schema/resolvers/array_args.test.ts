import { objectIriComparator } from '../utils';
import { addSortLimitOffsetArgs } from './array_args';

test('limit argument limits results for decorated resolver', async () => {
    const resolver = async () => [
        {
            _rdf_iri: 'http://example.com/Garfield',
            name: 'Garfield',
        },
        {
            _rdf_iri: 'http://example.com/Elf',
            name: 'Elf',
        },
        {
            _rdf_iri: 'http://example.com/GrumpyCat',
            name: 'Grumpy Cat',
        },
        {
            _rdf_iri: 'http://example.com/Felix',
            name: 'Felix',
        },
    ];

    const decoratedResolver = addSortLimitOffsetArgs(
        resolver,
        objectIriComparator,
        { isArrayType: true },
    );
    const result = await decoratedResolver(
        undefined,
        {
            limit: 2,
        },
        undefined,
        // @ts-ignore
        undefined,
    );

    expect(result.length).toBe(2);
    expect(result[0].name).toBe('Garfield');
    expect(result[1].name).toBe('Elf');
});

test('no limit argument does not limit results for decorated resolver', async () => {
    const resolver = async () => [
        {
            _rdf_iri: 'http://example.com/Garfield',
            name: 'Garfield',
        },
        {
            _rdf_iri: 'http://example.com/Elf',
            name: 'Elf',
        },
        {
            _rdf_iri: 'http://example.com/GrumpyCat',
            name: 'Grumpy Cat',
        },
        {
            _rdf_iri: 'http://example.com/Felix',
            name: 'Felix',
        },
    ];

    const decoratedResolver = addSortLimitOffsetArgs(
        resolver,
        objectIriComparator,
        { isArrayType: true },
    );
    // @ts-ignore
    const result = await decoratedResolver(undefined, {}, undefined, undefined);

    expect(result.length).toBe(4);
});

test('offset argument returns offset results for decorated resolver', async () => {
    const resolver = async () => [
        {
            _rdf_iri: 'http://example.com/Garfield',
            name: 'Garfield',
        },
        {
            _rdf_iri: 'http://example.com/Elf',
            name: 'Elf',
        },
        {
            _rdf_iri: 'http://example.com/GrumpyCat',
            name: 'Grumpy Cat',
        },
        {
            _rdf_iri: 'http://example.com/Felix',
            name: 'Felix',
        },
    ];

    const decoratedResolver = addSortLimitOffsetArgs(
        resolver,
        objectIriComparator,
        { isArrayType: true },
    );
    const result = await decoratedResolver(
        undefined,
        {
            offset: 2,
        },
        undefined,
        // @ts-ignore
        undefined,
    );

    expect(result.length).toBe(2);
    expect(result[0].name).toBe('Grumpy Cat');
    expect(result[1].name).toBe('Felix');
});

test('filter argument returns only specified instance for decorated resolver', async () => {
    const resolver = async () => [
        {
            _rdf_iri: 'http://example.com/Garfield',
            name: 'Garfield',
        },
        {
            _rdf_iri: 'http://example.com/Elf',
            name: 'Elf',
        },
        {
            _rdf_iri: 'http://example.com/GrumpyCat',
            name: 'Grumpy Cat',
        },
        {
            _rdf_iri: 'http://example.com/Felix',
            name: 'Felix',
        },
    ];

    const decoratedResolver = addSortLimitOffsetArgs(
        resolver,
        objectIriComparator,
        { isArrayType: true },
    );
    const result = await decoratedResolver(
        undefined,
        {
            filter: 'http://example.com/GrumpyCat',
        },
        undefined,
        // @ts-ignore
        undefined,
    );

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Grumpy Cat');
});

test('sort ASC argument returns results in ascending order for decorated resolver', async () => {
    const resolver = async () => [
        {
            _rdf_iri: 'http://example.com/Garfield',
            name: 'Garfield',
        },
        {
            _rdf_iri: 'http://example.com/Elf',
            name: 'Elf',
        },
        {
            _rdf_iri: 'http://example.com/GrumpyCat',
            name: 'Grumpy Cat',
        },
        {
            _rdf_iri: 'http://example.com/Felix',
            name: 'Felix',
        },
    ];

    const decoratedResolver = addSortLimitOffsetArgs(
        resolver,
        objectIriComparator,
        { isArrayType: true },
    );
    const result = await decoratedResolver(
        undefined,
        {
            sort: 'ASC',
        },
        undefined,
        // @ts-ignore
        undefined,
    );

    expect(result.length).toBe(4);
    expect(result[0].name).toBe('Elf');
    expect(result[1].name).toBe('Felix');
    expect(result[2].name).toBe('Garfield');
    expect(result[3].name).toBe('Grumpy Cat');
});

test('sort DESC argument returns results in descending order for decorated resolver', async () => {
    const resolver = async () => [
        {
            _rdf_iri: 'http://example.com/Garfield',
            name: 'Garfield',
        },
        {
            _rdf_iri: 'http://example.com/Elf',
            name: 'Elf',
        },
        {
            _rdf_iri: 'http://example.com/GrumpyCat',
            name: 'Grumpy Cat',
        },
        {
            _rdf_iri: 'http://example.com/Felix',
            name: 'Felix',
        },
    ];

    const decoratedResolver = addSortLimitOffsetArgs(
        resolver,
        objectIriComparator,
        { isArrayType: true },
    );
    const result = await decoratedResolver(
        undefined,
        {
            sort: 'DESC',
        },
        undefined,
        // @ts-ignore
        undefined,
    );

    expect(result.length).toBe(4);
    expect(result[0].name).toBe('Grumpy Cat');
    expect(result[1].name).toBe('Garfield');
    expect(result[2].name).toBe('Felix');
    expect(result[3].name).toBe('Elf');
});
