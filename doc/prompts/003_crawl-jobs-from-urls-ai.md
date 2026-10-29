# JobScraper MVP — Crawl jobs from company websites with AI provider

# Objective

Take one URL from company table. Create endpoint to utilize OpenAI API
integration to crawl open job listing on career pages of company websites.
Restrict the LLM as much as possible to achieve uniform outputs. 

## Prompting

### Iteration 001

```prompt
Take providers from @src/ai/providers and make them shared.

Use the shared providers in for MVC at @src/ai and @src/jobs

Create a POST endpoint in jobs MVC at @src/jobs to trigger jobCrawler to use the OpenAI API, registered at the provider.

The jobCrawler receives a URL. The corresponding service makes a system and user prompt, including upper limit for token use, and most importantly: defines strict output format for that prompt.

The output format is equivalent to `interface CreateJobRequest` in @src/jobs/dto/create-job.dto.ts
```

### Iteration 002

```prompt
I like the current CRAWL_INSTRUCTIONS. Please augment with:

* The website URL from the company table is the starting point for the crawling process.
* Keep the company website as the only source of truth. 
* Do not use job boards, portals, or aggregators.
* Use sitemap files, navigation bar, and footer to find the career or job listings page of the website. 
* Crawl/scrape each job listing individually. 
* Save those listings to the jobs table in the database as already done. 
```
