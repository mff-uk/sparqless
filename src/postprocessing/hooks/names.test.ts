import { ClassDescriptor } from '../../models/class';
import { buildNamesFromIris } from './names';

test('names postprocessing without conflicts shortens all names', () => {
    const class1: ClassDescriptor = {
        iri: 'http://www.w3.org/2000/01/rdf-schema#Class',
        name: '',
        associations: [],
        attributes: [],
        numberOfInstances: 0,
    };
    const class2: ClassDescriptor = {
        iri: 'http://www.w3.org/2000/01/rdf-schema#Property',
        name: '',
        associations: [],
        attributes: [],
        numberOfInstances: 0,
    };
    const class3: ClassDescriptor = {
        iri: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Datatype',
        name: '',
        associations: [],
        attributes: [],
        numberOfInstances: 0,
    };

    buildNamesFromIris([class1, class2, class3]);

    expect(class1.name).toBe('Class');
    expect(class2.name).toBe('Property');
    expect(class3.name).toBe('Datatype');
});

test('names postprocessing with conflicts shortens non-conflicting names', () => {
    const class1: ClassDescriptor = {
        iri: 'http://www.w3.org/2000/01/rdf-schema#Class',
        name: '',
        associations: [],
        attributes: [],
        numberOfInstances: 0,
    };
    const class2: ClassDescriptor = {
        iri: 'http://www.w3.org/2000/01/rdf-schema#Property',
        name: '',
        associations: [],
        attributes: [],
        numberOfInstances: 0,
    };
    const class3: ClassDescriptor = {
        iri: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#Class',
        name: '',
        associations: [],
        attributes: [],
        numberOfInstances: 0,
    };

    buildNamesFromIris([class1, class2, class3]);

    expect(class1.name === class3.name).toBe(false);
    expect(class2.name).toBe('Property');
});
