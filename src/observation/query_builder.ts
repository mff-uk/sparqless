import { ONTOLOGY_PREFIX_IRI } from '../api/config';

/**
 * Use this builder's static functions to build SPARQL queries
 * which can be used to carry out endpoint observations.
 */
export class QueryBuilder {
    static CLASSES_AND_INSTANCE_NUMBERS = () =>
        `PREFIX se: <${ONTOLOGY_PREFIX_IRI}>
        CONSTRUCT {
            []
              a se:ClassObservation ;
              se:describedClass ?class ;
              se:numberOfInstances ?numberOfInstances .
        } WHERE {
            {
                SELECT ?class (COUNT(?resource) AS ?numberOfInstances)
                WHERE {
                    ?resource a ?class.
                }
                GROUP BY ?class
            }
        }`;

    // TODO: make number of examined instances configurable
    static CLASS_INSTANCES = (classIri: string) =>
        `PREFIX se: <${ONTOLOGY_PREFIX_IRI}>
        CONSTRUCT {
            []
              a se:InstanceObservation ;
              se:classInstance ?resource ;
              se:parentClass <${classIri}> .
        } WHERE {
            {
              SELECT ?resource WHERE {
                  ?resource a <${classIri}> .
              }
              LIMIT 5 
            }
        }`;

    static INSTANCE_ATTRIBUTES = (classIri: string, instanceIri: string) =>
        `PREFIX se: <${ONTOLOGY_PREFIX_IRI}>
        CONSTRUCT {
          []
            a se:AttributeObservation ;
            se:describedAttribute ?property ;
            se:attributeSourceClass <${classIri}> ;
            se:targetLiteral ?targetLiteral .
        } WHERE {
          {
            SELECT ?targetLiteral  ?property
            WHERE {
              <${instanceIri}> ?property ?targetLiteral .
              FILTER isLiteral(?targetLiteral) 
            }
          } 
        }`;

    static INSTANCE_ASSOCIATIONS = (classIri: string, instanceIri: string) =>
        `PREFIX se: <${ONTOLOGY_PREFIX_IRI}>
        CONSTRUCT {
          []
            a se:AssociationObservation ;
            se:describedAssociation ?property ;
            se:associationSourceClass <${classIri}> ;
            se:targetClass ?targetClass .
        } WHERE {
          {
            SELECT ?targetClass ?property
            WHERE {
              <${instanceIri}> ?property ?targetResource .
              OPTIONAL {
                ?targetResource a ?targetClass .
              }
            }
            GROUP BY ?targetClass ?property
          } 
        }`;

    // TODO: check if we can make this faster with LIMIT and therefore enable hot reload
    static NUMBER_OF_INSTANCE_PROPERTIES = (classIri: string) =>
        `PREFIX se: <${ONTOLOGY_PREFIX_IRI}>
        CONSTRUCT {
          []
            a se:PropertyCountObservation ;
            se:countedProperty ?property ;
            se:countedPropertySourceClass <${classIri}> ;
            se:numberOfPropertyInstances ?numberOfInstances .
        } WHERE {
          {
            SELECT ?targetClass ?property (COUNT(*) AS ?numberOfInstances)
            WHERE {
              ?s
                a <${classIri}> ;
                ?property ?targetResource .
              OPTIONAL {
                ?targetResource a ?targetClass .
              }
            }
            GROUP BY ?targetClass ?property
          } 
        }`;

    static CLASS_PROPERTY_IRIS = (classIri: string) =>
        `PREFIX se: <${ONTOLOGY_PREFIX_IRI}>
        CONSTRUCT {
          []
            a se:PropertyExistenceObservation ;
            se:propertyOf <${classIri}> ;
            se:propertyIri ?property .
        }
        WHERE
        {
          {
            SELECT DISTINCT ?property
            WHERE {
              ?instance
                a <${classIri}> ;
                ?property ?value .
            }
          }
        }`;

    static SINGLE_PROPERTY_COUNT = (
        classIri: string,
        propertyIri: string,
        maxCount = 0,
    ) =>
        `PREFIX se: <${ONTOLOGY_PREFIX_IRI}>
        CONSTRUCT {
          []
            a se:PropertyCountObservation ;
            se:countedProperty <${propertyIri}> ;
            se:countedPropertySourceClass <${classIri}> ;
            se:numberOfPropertyInstances ?numberOfInstances .
        }
        WHERE
        {
          {
            SELECT (COUNT(*) AS ?numberOfInstances)
            WHERE {
              {
                SELECT ?value
                WHERE
                {
                  ?instance
                    a <${classIri}> ;
                    <${propertyIri}> ?value .
                }
                ${maxCount > 0 ? `LIMIT ${maxCount}` : ''}
              }
            }
          }
        }`;

    static SINGLE_ATTRIBUTE = (classIri: string, propertyIri: string) =>
        `PREFIX se: <${ONTOLOGY_PREFIX_IRI}>
        CONSTRUCT {
          []
            a se:AttributeObservation ;
            se:describedAttribute <${propertyIri}> ;
            se:attributeSourceClass <${classIri}> ;
            se:targetLiteral ?targetLiteral .
        } WHERE {
          {
            SELECT ?targetLiteral
            WHERE {
              ?instance
                a <${classIri}> ;
                <${propertyIri}> ?targetLiteral .
              FILTER isLiteral(?targetLiteral) 
            }
            LIMIT 1
          } 
        }`;

    static SINGLE_ASSOCIATION = (classIri: string, propertyIri: string) =>
        `PREFIX se: <${ONTOLOGY_PREFIX_IRI}>
        CONSTRUCT {
          []
            a se:AssociationObservation ;
            se:describedAssociation <${propertyIri}> ;
            se:associationSourceClass <${classIri}> ;
            se:targetClass ?targetClass .
        } WHERE {
          {
            SELECT ?targetClass
            WHERE {
              ?instance
                a <${classIri}> ;
                <${propertyIri}> ?targetResource .
              
              ?targetResource a ?targetClass .
            }
            LIMIT 1
          } 
        }`;
}
