# Dataset

A seed list of German IT companies, taken from Wikidata. 

## Source

* https://query.wikidata.org/

## Query

```sql
SELECT ?company ?companyLabel 
       ?hqLabel 
       (SAMPLE(?website) AS ?officialWebsite)
       (MIN(?founded) AS ?foundedDate)
       (MAX(?employees) AS ?employeeCount)
WHERE {
  # Match either country = Germany OR headquarters located in Germany
  { ?company wdt:P17 wd:Q183. }
  UNION
  { ?company wdt:P159/wdt:P17 wd:Q183. }

  # Subclasses of IT (software development, cloud computing, cybersecurity, etc.)
  ?company wdt:P452/wdt:P279* wd:Q11661.

  # Location (Headquarters)
  OPTIONAL { ?company wdt:P159 ?hq. }

  # Optional attributes
  OPTIONAL { ?company wdt:P856 ?website. }
  OPTIONAL { ?company wdt:P571 ?founded. }
  OPTIONAL { ?company wdt:P1128 ?employees. }

  SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". }
}
GROUP BY ?company ?companyLabel ?hqLabel
ORDER BY ?companyLabel
```



## Result

Run on 2026-10-08: 112 rows, 105 unique companies (a company with more than one headquarters shows up once per headquarters).

* JSON: [dataset/wikidata-it-companies.json](dataset/wikidata-it-companies.json)
