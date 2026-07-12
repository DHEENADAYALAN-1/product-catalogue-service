# Changelog

All notable changes to this microservice are documented here, following
[Semantic Versioning](https://semver.org/).

## [2.0.0] - Enhanced Search
### Added
- Query parameter support in `/products/search`: `category`, `minPrice`, `maxPrice` (in addition to `keyword`)
- Input validation and error handling (400 for invalid numeric params)
- `/products/:id` returns proper 404 with message when product is not found

### Changed
- Search logic refactored to support combined/chained filters

## [1.1.0] - Search Endpoint
### Added
- `GET /products/search?keyword=` - search products by keyword
- `GET /products/:id` - fetch a single product by id

## [1.0.0] - Base Version
### Added
- `GET /health` - service health check
- `GET /products` - list all products
- Initial Express server setup
