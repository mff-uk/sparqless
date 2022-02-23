export class QueryBuilder {
    static CLASSES_AND_INSTANCE_NUMBERS = () =>
        `PREFIX se: <http://skodapetr.eu/ontology/sparql-endpoint/>
        CONSTRUCT {
            [] se:class ?Class ;
                se:numberOfInstances ?numberOfInstances .
        } WHERE {
            {
                SELECT ?Class (COUNT(?resource) AS ?numberOfInstances)
                WHERE {
                    ?resource a ?Class.
                }
                GROUP BY ?Class
            }
        }`;

    static CLASS_INSTANCES = (classIri: string) =>
        `PREFIX se: <http://skodapetr.eu/ontology/sparql-endpoint/>
        CONSTRUCT {
            [] se:resource ?resource ;
                se:class ?class .
        } WHERE {
            {
                SELECT ?resource ?class WHERE {
                    VALUES ( ?class ) {
                        ( <${classIri}> )
                    }
                    ?resource a ?class .
                }
                LIMIT 5
            }
        }`

    static INSTANCE_ATTRIBUTES = (classIri: string, instanceIri: string) =>
        `PREFIX se: <http://skodapetr.eu/ontology/sparql-endpoint/>
        CONSTRUCT {
          [] se:property ?property ;
            se:sourceClass ?class ;
            se:targetLiteral ?targetLiteral .
        } WHERE {
          {
            SELECT ?class ?targetLiteral  ?property
            WHERE {
              VALUES ( ?class ?resource ) {
                ( <${classIri}> <${instanceIri}> )
              }
              ?resource ?property ?targetLiteral .
              FILTER isLiteral(?targetLiteral) 
            } LIMIT 5
          } 
        }`

    static INSTANCE_ASSOCIATIONS = (classIri: string, instanceIri: string) =>
        `PREFIX se: <http://skodapetr.eu/ontology/sparql-endpoint/>
        CONSTRUCT {
          [] se:property ?property ;
            se:sourceClass ?class ;
            se:targetClass ?targetClass .
        } WHERE {
          {
            SELECT ?class ?targetClass ?property
            WHERE {
              VALUES ( ?class ?resource ) {
                ( <${classIri}> <${instanceIri}> )
              }
              ?resource ?property ?targetResource .
              OPTIONAL {
                ?targetResource a ?targetClass .
              }
            }
            GROUP BY ?class ?targetClass ?property
          } 
        }`

    static NUMBER_OF_INSTANCE_PROPERTIES = (classIri: string) =>
        `PREFIX se: <http://skodapetr.eu/ontology/sparql-endpoint/>
        CONSTRUCT {
          [] se:property ?property ;
            se:sourceClass ?class ;
            se:numberOfInstances ?numberOfInstances;
            se:targetClass ?targetClass .
        } WHERE {
          {
            SELECT ?class ?targetClass ?property (COUNT(*) AS ?numberOfInstances)
            WHERE {
              VALUES ( ?class ) {
                ( <${classIri}>  )
              }
              ?s a ?class ;
                ?property ?targetResource .
              OPTIONAL {
                ?targetResource a ?targetClass .
              }
            }
            GROUP BY ?class ?targetClass ?property
          } 
        }`
}
