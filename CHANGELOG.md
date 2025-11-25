# MMM-EnvCanada Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/) and this project adheres to [Semantic Versioning](https://semver.org/).

## \[2.0.3] - 2025-11-25

### Changed

Changed Readme file links to Environment Canada documentation links (they moved the files)



## \[2.0.3] - 2025-10-09

### Changed

Change to provide support for changed Environment Canada server file folder names. Merged a better fix than the one I was working on, and then applied it for the Marine forecast and Air Quality Index features.



## \[2.0.2] - 2025-10-08

### Changed

Change to provide support for changed Environment Canada server file folder names.



## \[2.0.0] - 2025-09-09

### Changed

Added header font size to MMM-EnvCanada.css. Version changed to comply with Sematic Versioning and to highlight breaking change introduced in v1.3.0 to language parameter.



## \[1.4.0] - 2025-07-18

### Changed

Handle case where xml file doesn't parse: happens rarely, but when it does we keep the forecast data from the last successful fetch rather than clear it.



## \[1.3.0] - 2025-07-12

### Changed

Major update to provide support for changed Environment Canada server file names. Breaking change: Language parameter must now be en or fr (previously e or f). Will not actually break for most users, as it defaults to en if neither en nor fr are specified.



## \[1.2.0] - 2025-02-24

### Changed

Added support additional option of header parameter: if set to "false", no header is displayed.



## \[1.1.1] - 2023-08-18

## Fixed

Was relying on utils script being loaded by the default weather module -- failed if that module was not configured. Incorporated the utility functions directly into codebase to be independent.



## \[1.1.0] - 2023-08-13

## Added

Added configuration option for display of Air Quality Health Index.



## \[1.0.0] - 2023-08-12

### Added

Initial release of MMM-EnvCanada

