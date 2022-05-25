import { PropertyDescriptor } from './property';

/**
 * Describes the existence of an attribute, which is a kind of
 * property whose range contains literals (strings, ints,
 * booleans, language-tagged strings, ...)
 */
export interface AttributeDescriptor extends PropertyDescriptor {
    types: string[];
    languages: string[];
}
