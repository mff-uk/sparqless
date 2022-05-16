import { ClassDescriptor } from '../models/class';
import { PostprocessingHookDict } from './hook_types';
import { DescriptorPostprocessor } from './postprocessor';

test('postprocessor runs hooks on correct entities', () => {
    const class1: ClassDescriptor = {
        iri: '1',
        name: '1',
        associations: [],
        attributes: [],
        instances: [],
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
                targetClass: class1,
            },
        ],
        attributes: [
            {
                iri: '2b',
                name: '2b',
                count: 0,
                type: 'string',
            },
        ],
        instances: [],
        numberOfInstances: 0,
    };
    const descriptors: ClassDescriptor[] = [class1, class2];
    const hooks: PostprocessingHookDict = {
        entity: [
            (descriptors) => descriptors.forEach((x) => (x.iri += 'ENTITY')),
        ],
        namedEntity: [
            (descriptors) => descriptors.forEach((x) => (x.iri += 'NAME')),
        ],
        class: [],
        instance: [],
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
    postprocessor.postprocess(descriptors, { hooks });

    expect(class1.iri.includes('ENTITY')).toBe(true);
    expect(class1.iri.includes('NAME')).toBe(true);

    expect(class2.iri.includes('ENTITY')).toBe(true);
    expect(class2.iri.includes('NAME')).toBe(true);

    expect(class2.associations[0].iri.includes('ENTITY')).toBe(true);
    expect(class2.associations[0].iri.includes('NAME')).toBe(true);
    expect(class2.associations[0].iri.includes('PROPERTY')).toBe(true);
    expect(class2.associations[0].iri.includes('ASSOCIATION')).toBe(true);
    expect(class2.associations[0].iri.includes('ATTRIBUTE')).toBe(false);

    expect(class2.attributes[0].iri.includes('ENTITY')).toBe(true);
    expect(class2.attributes[0].iri.includes('NAME')).toBe(true);
    expect(class2.attributes[0].iri.includes('PROPERTY')).toBe(true);
    expect(class2.attributes[0].iri.includes('ATTRIBUTE')).toBe(true);
    expect(class2.attributes[0].iri.includes('ASSOCIATION')).toBe(false);
});
