import { FieldResolver } from 'nexus';
import { AssociationDescriptor } from '../models/association';
import { ClassDescriptor } from '../models/class';
import { createClassResolver } from './class';

export function createAssociationResolver(
    classDescriptor: ClassDescriptor,
    associationDescriptor: AssociationDescriptor,
    isArrayType: boolean,
): FieldResolver<string, string> {
    return async (parent, args, context, info) => {
        return await createClassResolver(
            associationDescriptor.targetClass,
            isArrayType,
            true,
            parent[info.fieldName],
        )(parent, args, context, info);
    };
}
