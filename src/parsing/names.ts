import { deburr } from 'lodash';

/**
 * Update the names for the given descriptors using their IRIs.
 *
 * The algorithm will attempt to give them a simplified short name for
 * clarity in the schema, but if multiple entities would have the same
 * short name, a long version will be used instead.
 *
 * @param descriptors Descriptors for which the names will be updated.
 */
export function buildNamesFromIRIs(
    descriptors: { iri: string; name: string }[],
) {
    const nameDict: { [name: string]: { iri: string; name: string }[] } = {};

    // Make a dictionary to detect conflicting short names.
    // Also make sure to deburr the name to make the resulting
    // short names as readable as possible when things like accented characters
    // are present in the IRI. It will replace them with the accentless version,
    // rather than an underscore.
    for (const descriptor of descriptors) {
        const shortName = deburr(
            descriptor.iri.split(/[/#]/).slice(-1).pop()!,
        ).replace(/[^_a-zA-Z0-9]/gi, '_');
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
            // In case of conflict of short name between classes, just give them all
            // long unique names. This could probably be improved to take only
            // as long of a name as necessary, not the whole IRI.
            for (const descriptor of descriptors) {
                descriptor.name = deburr(descriptor.iri).replace(
                    /[^_a-zA-Z0-9]/gi,
                    '_',
                );
            }
        }
    }
}
