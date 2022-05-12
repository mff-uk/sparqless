import { EntityDescriptor } from './entity';

export interface NamedEntityDescriptor extends EntityDescriptor {
    name: string; // GraphQL friendly name - only contains [_a-zA-Z0-9]
}
