import { FieldResolver } from 'nexus';
import { AssociationDescriptor } from '../models/association';
import { ClassDescriptor } from '../models/class';

export function createAssociationResolver(
    classDescriptor: ClassDescriptor,
    associationDescriptor: AssociationDescriptor,
    isArrayType: boolean,
): FieldResolver<string, string> {
    return async (_root, _args, _context, info) => {
        const x = info;
        const y = _root;
        const z = _context;
        const a = _args;
        return {};
    };
}
