import { Quad } from 'rdf-js';
import { groupBy } from 'lodash';
import {
    ObservationQuads,
    Observations,
    OntologyObservation,
    ontologyIri,
    OntologyProperty,
} from './ontology';
import { ObservationConfig } from '../api/config';
import { DataFactory, Parser, Writer } from 'n3';
import { createWriteStream, readFileSync } from 'fs';

/**
 * Utility function which takes a potentially large number
 * of quads which belong to different observations of different
 * classes, and returns an `Observations` instance containing
 * the quads grouped by subject and observation class.
 *
 * @param quads The quads to group.
 * @param config Observation configuration.
 * @returns `Observations` grouped by subject and observation class.
 */
export function groupObservations(
    quads: Quad[],
    config: ObservationConfig,
): Observations {
    const observations: Observations = Object.assign(
        {},
        ...Object.values(OntologyObservation).map((clazz) => ({ [clazz]: [] })),
    );
    const groupedResults = groupBy(quads, (quad) => quad.subject.value);

    for (const [_subject, subjectQuads] of Object.entries(groupedResults)) {
        const quadMap: ObservationQuads = {};
        const propertyQuads = subjectQuads.filter(
            (quad) =>
                !['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'].includes(
                    quad.predicate.value,
                ),
        );

        for (const quad of propertyQuads) {
            const ontologyProperty = getOntologyPropertyForQuad(quad, config);
            quadMap[ontologyProperty] = quad;
        }

        const ontologyClass = getOntologyClassForQuads(subjectQuads, config);
        observations[ontologyClass]!.push(quadMap);
    }

    Object.keys(observations).map((x) => {
        if (observations[x as OntologyObservation]!.length === 0) {
            delete observations[x as OntologyObservation];
        }
    });

    return observations;
}

/**
 * Writes the `observations` to the file at `filePath`.
 * You can set the `format` argument to a format supported by N3.js
 * if you want to write to a format other than Turtle.
 */
export function writeObservationsToFile(
    observations: Observations,
    filePath: string,
    config: ObservationConfig,
    format = 'Turtle',
) {
    const fileStream = createWriteStream(filePath);
    const writer = new Writer(fileStream, {
        format: format,
        prefixes: { se: config.ontologyPrefixIri },
        end: true, // Close the file stream when done writing
    });
    for (const [observationType, typeObservations] of Object.entries(
        observations,
    )) {
        for (const observation of typeObservations) {
            // Add observation type quad for each observation
            writer.addQuad(
                // All observation properties should have the same subject
                Object.values(observation)[0].subject,
                DataFactory.namedNode(
                    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
                ),
                DataFactory.namedNode(
                    `${config.ontologyPrefixIri}${observationType}`,
                ),
            );

            // Actual observation properties
            for (const quad of Object.values(observation)) {
                writer.addQuad(quad);
            }
        }
    }
    writer.end();
}

/**
 * Parse observations saved in a file at `filePath`:
 *
 * ```
 * const observations = readObservationsFromFile('fooFolder/barFile.ttl', config);
 * ```
 *
 * You may want to use reading and writing observations to a file in case you want
 * to somehow modify them before using them for model parsing.
 *
 * TODO: add example to docs of how to load observations and continue
 */
export function readObservationsFromFile(
    filePath: string,
    config: ObservationConfig,
    format = 'Turtle',
): Observations {
    const fileContents = readFileSync(filePath);
    const parser = new Parser({ format: format });
    const quads = parser.parse(fileContents.toString());
    return groupObservations(quads, config);
}

function getOntologyClassForQuads(
    quads: Quad[],
    config: ObservationConfig,
): OntologyObservation {
    const observationClassQuad = quads.find(
        (quad) =>
            quad.predicate.value ===
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    );
    if (observationClassQuad === undefined) {
        throw new Error(
            'Observation does not have a ontology type defined with rdf:type.',
        );
    }
    const observationClass = Object.entries(
        classIris(config.ontologyPrefixIri),
    ).find(([_clazz, iri]) => observationClassQuad.object.value === iri);
    if (observationClass === undefined) {
        throw new Error(
            `Unknown observation property was found when parsing observations: ${observationClassQuad.object.value}`,
        );
    }

    return observationClass[0] as OntologyObservation;
}

function getOntologyPropertyForQuad(
    quad: Quad,
    config: ObservationConfig,
): OntologyProperty {
    const match = Object.entries(propertyIris(config.ontologyPrefixIri)).find(
        ([_property, iri]) => quad.predicate.value === iri,
    );
    if (match === undefined) {
        throw new Error(
            `Unknown observation property was found when parsing observations: ${quad.predicate.value}`,
        );
    }

    return match[0] as OntologyProperty;
}

function classIris(
    ontologyPrefix: string,
): Record<OntologyObservation, string> {
    return Object.assign(
        {},
        ...Object.values(OntologyObservation).map((clazz) => ({
            [clazz]: ontologyIri(ontologyPrefix, clazz),
        })),
    );
}

function propertyIris(
    ontologyPrefix: string,
): Record<OntologyProperty, string> {
    return Object.assign(
        {},
        ...Object.values(OntologyProperty).map((property) => ({
            [property]: ontologyIri(ontologyPrefix, property),
        })),
    );
}
