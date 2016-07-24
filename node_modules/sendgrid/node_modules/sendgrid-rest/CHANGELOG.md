# Change Log
All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org/).

## [2.2.1] - 2016-06-15
### Fixed
- Sending email with accents: https://github.com/sendgrid/sendgrid-nodejs/issues/239
- Thanks [eaparango](https://github.com/eaparango)!

## [2.2.0] - 2016-06-10
### Added
- Automatically add Content-Type: application/json when there is a request body

## [2.1.0] - 2016-06-08
### Added
- Cleaner request object initialization
- Ability to use http for testing

## [2.0.0] - 2016-06-06
### Changed
- Made the Request and Response variables non-redundant. e.g. request.requestBody becomes request.body

## [1.0.1] - 2016-04-08
### Added
- We are live!