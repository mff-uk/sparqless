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
