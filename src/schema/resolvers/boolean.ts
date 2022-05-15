import { FieldResolver } from 'nexus';

export function createBooleanResolver(
    _isArrayType: boolean,
): FieldResolver<string, string> {
    return async (parent, _args, _context, info) => {
        const value = String(parent[info.fieldName]);
        if (['true', '1'].includes(value)) {
            return true;
        }

        return false;
    };
}
