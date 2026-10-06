# Architecture pattern

* Status: proposed

## Decision

For the backend, we user the MVC (Model-View-Controller) architecture pattern.

## Options Considered

* We ruled out a Monolith pattern.
* We ruled out a Microservices pattern.

## Rationale

MVC is an architecture pattern that allows us to change the database or AI connection with less coupling as in a Monolith structure. The overhead is reasonable. Another possible approach is a Microservices pattern. We decided that the overhead is too much in a project of this size.

## Consequences

We maybe have to refactor the scraping part of the Platform and build it as a separate encapsulated worker. This will be decided when the need arises.

## Notes

None.

