import { deburr } from 'lodash';
import { ResourceDescriptor } from '../../models/resource';

/**
 * Update the names for the given descriptors using their IRIs.
 *
 * The algorithm will attempt to give them a simplified short name for
 * clarity in the schema, but if multiple entities would have the same
 * short name, a long version will be used instead.
 *
 * @param descriptors Descriptors for which the names will be updated.
 */
export function buildNamesFromIRIs(descriptors: ResourceDescriptor[]) {
    const nameDict: { [name: string]: ResourceDescriptor[] } = {};

    // Make a dictionary to detect conflicting short names.
    // Also make sure to deburr the name to make the resulting
    // short names as readable as possible when things like accented characters
    // are present in the IRI. It will replace them with the accentless version,
    // rather than an underscore.
    for (const descriptor of descriptors) {
        let shortName = convertIRIToLongName(
            descriptor.iri.split(/[/#]/).slice(-1).pop()!,
        );
        if (!shortName) {
            shortName = convertIRIToLongName(descriptor.iri);
        }

        if (nameDict[shortName]) {
            nameDict[shortName].push(descriptor);
        } else {
            nameDict[shortName] = [descriptor];
        }
    }

    for (const [shortName, descriptors] of Object.entries(nameDict)) {
        if (descriptors.length === 1) {
            descriptors[0].name = shortName;
        } else {
            resolveNameConflict(descriptors);
        }
    }
}

function resolveNameConflict(descriptors: ResourceDescriptor[]) {
    // Try taking the last IRI segment before the resource name and
    // adding that as a prefix to the conflicting names.
    // We have to take care to remove leading numbers since
    // leading numbers are not allowed in GraphQL identifiers.
    const prefixedNames = descriptors
        .map((x) =>
            convertIRIToLongName(x.iri.split(/[/#]/).slice(-2).join('_')),
        )
        .map((x) => x.replace(/^[\d_]*/, ''));
    if (new Set(prefixedNames).size === prefixedNames.length) {
        // No conflicts with prefixed names, so we can use them
        for (let i = 0; i < prefixedNames.length; i++) {
            descriptors[i].name = prefixedNames[i];
        }
        return;
    }

    // In case of conflict of even prefixed name between descriptors, just give them all
    // long unique names. This could probably be improved to take only
    // as long of a name as necessary, not the whole IRI.
    for (const descriptor of descriptors) {
        descriptor.name = convertIRIToLongName(descriptor.iri);
    }
}

function convertIRIToLongName(iri: string): string {
    return deburr(iri).replace(/[^_a-zA-Z0-9]/gi, '_');
}
