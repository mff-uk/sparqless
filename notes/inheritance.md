# Notes about inheritance

We were interested whether it makes sense to query for
inheritance in the form of something like this:

`ns:Superclass a ns:Class a ns:Instance`

We tested our list of endpoints with the following query:

```sparql
PREFIX se: <http://skodapetr.eu/ontology/sparql-endpoint/>
CONSTRUCT {
  [] se:class ?Class ;
    se:superclass ?Superclass;
    se:endpointUri "https://dev.nkod.opendata.cz/sparql";
    se:numberOfInstances ?numberOfInstances .
} WHERE {
  {
    SELECT ?Class ?Superclass (COUNT(?resource) AS ?numberOfInstances)
    WHERE {
      ?resource a ?Class.
      ?Class a ?Superclass.
    }
    GROUP BY ?Class ?Superclass
  }
}
```

We found that this kind of inheritance was *exclusively* used
for metadata annotations using RDFS, OWL or SHACL.
Therefore it may not make sense to even query for this, when
the available datasets do not make use of it.
