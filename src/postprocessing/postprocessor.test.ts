import { ClassDescriptor } from '../models/class';
import { DataModel } from '../models/data_model';
import { PostprocessingHookDict } from './hook_types';
import { DescriptorPostprocessor } from './postprocessor';

test('postprocessor runs hooks on correct entities', () => {
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
    const hooks: PostprocessingHookDict = {
        resource: [
            (descriptors) => descriptors.forEach((x) => (x.iri += 'NAME')),
        ],
        class: [],
        property: [
            (descriptors) => descriptors.forEach((x) => (x.iri += 'PROPERTY')),
        ],
        association: [
            (descriptors) =>
                descriptors.forEach((x) => (x.iri += 'ASSOCIATION')),
        ],
        attribute: [
            (descriptors) => descriptors.forEach((x) => (x.iri += 'ATTRIBUTE')),
        ],
    };

    const postprocessor = new DescriptorPostprocessor();
    const model = new DataModel(descriptors);
    postprocessor.postprocess(model, { hooks });

    expect(class1.iri.includes('NAME')).toBe(true);

    expect(class2.iri.includes('NAME')).toBe(true);

    expect(class2.associations[0].iri.includes('NAME')).toBe(true);
    expect(class2.associations[0].iri.includes('PROPERTY')).toBe(true);
    expect(class2.associations[0].iri.includes('ASSOCIATION')).toBe(true);
    expect(class2.associations[0].iri.includes('ATTRIBUTE')).toBe(false);

    expect(class2.attributes[0].iri.includes('NAME')).toBe(true);
    expect(class2.attributes[0].iri.includes('PROPERTY')).toBe(true);
    expect(class2.attributes[0].iri.includes('ATTRIBUTE')).toBe(true);
    expect(class2.attributes[0].iri.includes('ASSOCIATION')).toBe(false);
});
