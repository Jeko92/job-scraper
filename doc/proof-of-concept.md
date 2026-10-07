# Proof of concept

## Prompting

### Iteration 001

Taking the first step from stage two and fill with keywords:

```prompt
Please search the web for companies that are interesting for a candidate with the following interests and skills. Stop after you found 12 companies. Output in TOON-format.

Interest:
* Start-up
* Hybrid option
* AI friendly
* Hamburg
* 20-50 employees

Skills:
* NestJS
* FastAPI
* TypeScript
* Postgres
* Testing
```

Result:
* Crawls job portals
* Burns many tokens, 80k+

### Iteration 002

Forbid the agent to crawl job portals.

```prompt
Please search the web for companies that are interesting for a candidate with the following interests and skills. Stop after you found 12 companies. Avoid job portals. Output in TOON-format for further investigation.

Interest:
* Start-up
* Hybrid option
* AI friendly
* Hamburg
* 20-50 employees

Skills:
* NestJS
* FastAPI
* TypeScript
* Postgres
* Testing
```

Result:
* Worked better than iteration 001
* Used only the websearch
* Burns through 90k tokens
* Verifies each criteria for each company it found


### Iteration 003

Explicitly search for companies on NorthData.

```prompt
Please search northdata.de for companies that are interesting for a candidate with the following interests and skills. Stop after you found 12 companies. Avoid other sources. Output in TOON-format for further investigation.

Interest:
* Start-up
* Hybrid option
* AI friendly
* Hamburg
* 20-50 employees

Skills:
* NestJS
* FastAPI
* TypeScript
* Postgres
* Testing
```

Result:
* NorthData has limited access without a premium subscription

### Iteration 004

Crawl company website links on northdata.

```prompt
Search on northdata.de for 12 start-ups. Find their website url and output company name and link.
```

Result:
* Burned 100k token
* This is not applicable

### Iteration 005

Only search for companies with one criteria, try to find more companies based on the findings.

```prompt

```

## Quantity over quality

The benifit for the Platform is higher with more data sources opposed to fewer but higher quality data sources.

## Constraints

Because of multiple data sources and continuous crawling, it's crucial to have mechanisms that prevent most of the dublicates that are a) further token-heavy crawled and b) poluting the database. Eliminate dublicates as early as possible. 

## Idea

Use all available free APIs and API searches to find as many company names and websites as possible. The idea is to build an exhaustive list of companies in Germany. This list is mostly dublicate free.

Build a schema of all the parameters that we need to allocate Job Seekers to positions. Add all parameters we need to build useful filters for the Job Seekers. Examples: `numbers_of_employees`, `hq_location`, `jurisdiction`, `industry`, ...

Then use iterative crawling to fill-in as many of the parameters as possible in the background through free APIs, API searches, and AI crawling.
