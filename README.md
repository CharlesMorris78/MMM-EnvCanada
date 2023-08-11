# MMM-EnvCanada
MagicMirror² Module to display weather forecast information from Environment Canada.

Version 1.0, August 2023 Copyright © Charles Morris

[![Platform](https://img.shields.io/badge/platform-MagicMirror-informational)](https://MagicMirror.builders)
![License](https://img.shields.io/badge/license-MIT-informational)

![Example Screenshot](screenshot.png?raw=true)
## Purpose
MMM-EnvCanada is a MagicMirror² Module to display Environment Canada weather forecast information. The default Weather Module has an envcanada provider to display Environment Canada data in the MagicMirror² Weather Module. However, Environment Canada provides more information than the default module can display. This module displays the text forecast, the marine wind forecast, and a graphical display of the forecast for day and night. This module does not display current conditions, as the default weather module provides that function very well. Some code from the envcanada provider has been incorporated or modified and incorporated into this module.

## Installation
1. Navigate to the `modules` folder
	```bash
	cd ~/MagicMirror/modules
	```
2. Clone the repository
	```bash
	git clone https://github.com/CharlesMorris78/MMM-EnvCanada.git
	```
3. Add the module to your Magic Mirror by copying the sample configuration below and add that to your `config.js`

## Sample Config
Here's an example of a basic config for the module. See full list of available settings below under [Configuration](#configuration)
```javascript
		{
			module: 'MMM-EnvCanada',
			position: 'top_right',
			header: "Environment Canada Forecast for Picton",
			config: {
				siteCode: "s0000702",
				provCode: "ON", 
				updateInterval: 10 * 60 * 1000,
				language: "e",
				textForecasts: 2,
				showAlerts: true,
				showforecastDays: 5,
				marineRegion: "great_lakes",
				marineSubRegion: "m0000144",
				marineLocation: "Eastern Lake Ontario"
			}
		},
```

## Configuration
| **Setting** | **Description**|
| --- | --- |
| `language` | The display language provided by Environment Canada: English (e) or French (f).<br><br> <ul><li>**Type:** `string`</li><li>**Default:** `"e"`</li><li>**Possible values:** `"e"` or `"f"`</li></ul> |
| `marineEndMonth` | Final month to display the Marine Forecast.<br><br> <ul><li>**Type:** `number`</li><li>**Default:** `10`</li><li>**Possible values:** 1 through 12</li></ul> |
| `marineLocation` | Location for Marine Forecast. If language is f (French), must be the French language version of the location.<br><br> <ul><li>**Type:** `string`</li><li>**Default:** `""`</li><li>**Possible values:** see [Environment Canada website](https://weather.gc.ca/marine/index_e.html)</li></ul> |
| `marineRegion` | The region for Marine Forecast. If set to empty string (the default) no Marine Forecast is displayed. Other paramters must be correct or no Marine Forecast will be displayed.<br><br> <ul><li>**Type:** `string`</li><li>**Default:** `""`</li><li>**Possible values:** `"arctic"`, `"atlantic"`, `"great_lakes"`, `"hudson"`, `"mackenzie"`, `"pacific"`, `"prairies"`, `"st_lawrence"`</li></ul> |
| `marineStartMonth` | First month to display the Marine Forecast.<br><br> <ul><li>**Type:** `number`</li><li>**Default:** `5`</li><li>**Possible values:** 1 through 12</li></ul> |
| `marineSubRegion` | The subregion code for Marine Forecast.<br><br> <ul><li>**Type:** `string`</li><li>**Default:** `""`</li><li>**Possible values:** see the Environment Canada document listing all the [sub region codes](https://dd.weather.gc.ca/marine_weather/docs/region_list_regions_en.csv)</li></ul> |
| `provCode` | The 2-character province code for the selected city/town.<br><br> <ul><li>**Type:** `string`</li><li>**Default:** `"ON"`</li><li>**Possible values:** see the Environment Canada document listing all the [siteCode and provCode values for a Canadian city/town](https://dd.weather.gc.ca/citypage_weather/docs/site_list_en.csv)</li></ul> |
| `showAlerts` | Boolean to decide if weather warnings should be included in the forecast text.<br><br> <ul><li>**Type:** `boolean`</li><li>**Default:** `true`</li><li>**Possible values:** `true` or `false`</li></ul> |
| `showforecastDays` | The number of days to display the forecast in graphical format. If less than 3, no graphical forecast is displayed.<br><br> <ul><li>**Type:** `number`</li><li>**Default:** `5`</li><li>**Possible values:** `0` to `5`</li></ul> |
| `siteCode` | The city/town unique identifier for which weather is to be displayed. Format is 's0000000'.<br><br> <ul><li>**Type:** `string`</li><li>**Default:** `"s1234567"` which is not valid. Must be set to a valid entry.</li><li>**Possible values:** see the Environment Canada document listing all the [siteCode and provCode values for a Canadian city/town](https://dd.weather.gc.ca/citypage_weather/docs/site_list_en.csv)</li></ul> |
| `textForecasts` | The number of text forecasts to display. Environment Canada provides two forecasts for each day: today and tonight. If set to 0, no text forecast is disdplayed.<br><br> <ul><li>**Type:** `number`</li><li>**Default:** `2`</li><li>**Possible values:** `0` to `5`</li></ul> |
| `updateInterval` | The duration of time between each attempt to refresh the forecast information, in miliseconds.<br><br> <ul><li>**Type:** `number`</li><li>**Default:** `10 * 60 * 1000` which is 10 minutes</li></ul> |

## Support
This is my first MagicMirror module. There probably are better ways to do some of the things I have implemented, but this represents what I have learned so far, with thanks to the authors of the envcanada provider code for the default weather module. I will respond to questions and suggestions as promptly as possible.
