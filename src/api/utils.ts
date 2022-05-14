import { PropertyDescriptor } from '../models/property';
import { MAX_PROPERTY_COUNT } from './config';

export function getPropertyDescription(
    property: PropertyDescriptor,
    propertyType: string,
): string {
    return `This ${propertyType} has ${property.count}${
        property.count === MAX_PROPERTY_COUNT ? '+' : ''
    } occurences.\n
Original IRI is ${property.iri}.`;
}
