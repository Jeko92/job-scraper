---
context: API Endpoints
scope: Backend
model: Opus 5.5
---

# Requirements-API Endpoints

- Module in backend with MVC patter and factory design pattern.
- Query several api endpoints
- Reformat API response to match DB_SCHEMA
- (Filter-out duplicates)
- Module has cron jobs to run queries in pre-defined intervals
- Save normalized results to DB tables

## Prompt

### Iteration 001

```md
We need a new backend module with MVC architectural pattern for calling several API endpoints. The different API endpoints have similar data but different responses. Which design pattern would fit here best? Is it adequate to use the Factory Design Pattern? Elaborate and present alternatives if needed. Functionality should be expandable to other endpoints in the future, with minimal changes in code. Match received data to DB_SCHEMA. Create cron jobs with pre-defined intervals to run API calls. Write normalized results to DB tables.           
```
