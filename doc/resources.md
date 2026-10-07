# Resources

A collection of links that were discovered during the project. 

## Schema

* https://jsonld.com/organization/
* https://schema.org/Organization
* https://schema.org/Corporation

## Validator

* https://valibot.dev/
* https://zod.dev/

## Data collection

* https://openregister.de/en/api
* For Google searches through Start-Page: https://scrappa.co/api/startpage/search?query=privacy+tips
* Collection of APIs: https://rapidapi.com/collection/company-information-apis (no idea about pricing)
* https://www.smarte.pro/blog/company-data-api#company-data-api-comparison-table
* https://api.opencorporates.com/documentation/API-Reference
* https://docs.companyenrich.com/docs/getting-started
* https://jobsuche.api.bund.dev/
* https://www.handelsregister.de/rp_web/erweitertesuche/welcome.xhtml

* https://query.wikidata.org/
with query:
```sql
SELECT ?company ?companyLabel ?website ?founded ?employees WHERE {
  ?company wdt:P17 wd:Q183;          # country: Germany
           wdt:P452 wd:Q11661.       # industry: information technology
  OPTIONAL { ?company wdt:P856 ?website. }
  OPTIONAL { ?company wdt:P571 ?founded. }
  OPTIONAL { ?company wdt:P1128 ?employees. }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en". }
}
```

## UX/UI Inspiration

* (AWWARD)[https://www.awwwards.com/]
* (BEHANCE)[https://www.behance.net/]
* (SUB-CAT BEHANCE)[https://www.behance.net/galleries/ui-ux]
* (DRIBBLE)[https://dribbble.com/]

* (COLORHUNT)[https://colorhunt.co/] (color palettes, general mood)
* (Google-font pairings)[https://heyreliable.ie/ultimate-google-font-pairings/?utm_source=chatgpt.com&utm_source=chatgpt.com]
* (Color-palettes and pallet generator)[https://coolors.co/]

## ADRs (Architecture Decision Records)

* https://martinfowler.com/bliki/ArchitectureDecisionRecord.html
* https://github.com/architecture-decision-record/architecture-decision-record

## Charts

* https://mermaid.js.org/intro/

## Coding

* https://www.conventionalcommits.org/en/v1.0.0/
* https://editorconfig.org/#example-file
* https://turborepo.dev/
* Package management: https://pnpm.io/
* Pull-request templates: https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/about-issue-and-pull-request-templates

## Technology and libraries

* https://crawlee.dev/

## Memes

* https://programmerhumor.io/webdev-memes/a-perfectly-stable-technology-stack-2e8j
