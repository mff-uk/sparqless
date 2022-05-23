import { ClassDescriptor } from '../models/class';
import { PropertyDescriptor } from '../models/property';

export function getPropertyDescription(
    property: PropertyDescriptor,
    propertyType: string,
    maxPropertyCount: number | undefined,
): string {
    return `This ${propertyType} has ${
        property.count === 0 ? 'an unknown number of' : property.count
    }${property.count === maxPropertyCount ? '+' : ''} occurence${
        property.count === 1 ? '' : 's'
    }.\n
Original IRI is ${property.iri}.`;
}

export function getClassDescription(classDescriptor: ClassDescriptor): string {
    return `Generated SPARQL class with ${
        classDescriptor.numberOfInstances === 0
            ? 'an unknown number of'
            : classDescriptor.numberOfInstances
    } instance${classDescriptor.numberOfInstances === 1 ? '' : 's'}.\n
Original IRI is ${classDescriptor.iri}.`;
}
