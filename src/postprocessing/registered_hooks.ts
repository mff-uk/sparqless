import { buildNamesFromIRIs } from './hooks/names';
import { PostprocessingHookDict } from './hook_types';

export function getRegisteredPostprocessingHooks(): PostprocessingHookDict {
    const hooks: PostprocessingHookDict = {
        entity: [],
        namedEntity: [],
        class: [],
        instance: [],
        property: [],
        association: [],
        attribute: [],
    };

    // Register your hooks here.
    // Note that you can use type contravariance for the descriptors here,
    // meaning that you can for example use a PostprocessingHook<Property>
    // and use it as an association or attribute hook.
    // TODO: when using as a library, allow better registration of hooks
    hooks.namedEntity.push(buildNamesFromIRIs);

    return hooks;
}
