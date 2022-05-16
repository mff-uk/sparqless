import { FieldResolver } from 'nexus';
import { Config } from '../../api/config';
import { AssociationDescriptor } from '../../models/association';
import { ClassDescriptor } from '../../models/class';
import { createClassResolver } from './class';

export function createAssociationResolver(
    _classDescriptor: ClassDescriptor,
    resolverConfig: {
        associationDescriptor: AssociationDescriptor;
        isArrayType: boolean;
    },
    config: Config,
): FieldResolver<string, string> {
    return async (parent, args, context, info) => {
        return await createClassResolver(
            resolverConfig.associationDescriptor.targetClass,
            {
                isArrayType: resolverConfig.isArrayType,
                areFieldsOptional: true,
                instanceIRI: parent[info.fieldName],
            },
            config,
        )(parent, args, context, info);
    };
}
