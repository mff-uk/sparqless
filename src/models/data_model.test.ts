import { ClassDescriptor } from '../models/class';
import { DataModel } from './data_model';

test('model serialization and deserialization returns equivalent model', () => {
    const class1: ClassDescriptor = {
        iri: '1',
        name: '1',
        associations: [],
        attributes: [],
        numberOfInstances: 0,
    };
    const class2: ClassDescriptor = {
        iri: '2',
        name: '2',
        associations: [
            {
                iri: '2a',
                name: '2a',
                count: 0,
                targetClasses: [class1],
                isArray: false,
            },
        ],
        attributes: [
            {
                iri: '2b',
                name: '2b',
                count: 0,
                types: ['string'],
                languages: ['en'],
                isArray: false,
            },
        ],
        numberOfInstances: 0,
    };
    const descriptors: ClassDescriptor[] = [class1, class2];
    const model = new DataModel(descriptors);

    const jsonModel = model.toJSON();
    const parsedModel = DataModel.fromJSON(jsonModel);

    expect(parsedModel[0].iri).toBe('1');
    expect(parsedModel[0].name).toBe('1');
    expect(parsedModel[0].associations.length).toBe(0);
    expect(parsedModel[0].attributes.length).toBe(0);
    expect(parsedModel[0].numberOfInstances).toBe(0);

    expect(parsedModel[1].iri).toBe('2');
    expect(parsedModel[1].name).toBe('2');
    expect(parsedModel[1].associations.length).toBe(1);
    expect(parsedModel[1].associations[0].targetClasses[0]).toBe(
        parsedModel[0],
    );
    expect(parsedModel[1].attributes.length).toBe(1);
    expect(parsedModel[1].attributes[0].types[0]).toBe('string');
    expect(parsedModel[1].numberOfInstances).toBe(0);
});
