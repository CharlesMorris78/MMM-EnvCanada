/* MagicMirror²
 * Module: EnvCanada 
 *
 * By Charles Morris
 * some material based on envcanada provider for default Weather Module
 * version 2.0.2 October 2025
 * MIT Licensed.
 * 
 * Module displays current alert warnings and current textweather 
 * forecast from Environment Canada for configured location for today
 * and tonight, or for tonight and tomorrow.
 * 
 * If configured, also displays Environment Canada forecast for 5 days,
 * showing two lines for "today" and "tonight" forecasts (Weather Module only 
 * shows one line)
 * 
 * If configured, also displays Marine Wind forecast
 */
 
var locationHeader = "";
var forecast = "Starting ...";
var marine = "";
var airquality = "";
var airQI = "";
var airQIStat = "low";
var airQIF = "";
var airQIFStat = "low";
var days = [];
var fileSuffix = "";
var mfileSuffix = "";
 
Module.register("MMM-EnvCanada", {
	// Default module config.
	defaults: {
		updateInterval: 10 * 60 * 1000,
		siteCode: "s1234567",
		provCode: "ON",
		language: "en",
		textForecasts: 2,
		showAlerts: true,
		showForecastDays: 5,
		marineRegion: "",
		marineSubRegion: "",
		marineLocation: "",
		marineStartMonth: 5,
		marineEndMonth: 10,
		airQualityProv: "",
		airQualityRegion: ""
	},
	
	start() {
		Log.log("MMM-EnvCanada starting version 2.0.2");		
		setInterval(() => {
			this.getForecast();
			}, this.config.updateInterval);
		if (this.config.language != "fr") this.config.language = "en";
		if (this.config.textForecasts > 6) this.config.textForecasts = 6;
		if (this.config.showForecastDays > 6) this.config.showForecastDays = 6;
		if (this.config.marineStartMonth < 1) this.config.marineStartMonth = 1;
		if (this.config.marineEndMonth > 12) this.config.marineEndMonth = 12;
		if (this.data.header) locationHeader = this.data.header;
		this.getForecast();
	},
	
	getStyles() {
		return ["weather-icons.css", "MMM-EnvCanada.css"];
	},
	
	getScripts() {
		return ["forecastdata.js"];
	},
	
	getTemplate() {
		return "MMM-EnvCanada.njk";
	},

	getTemplateData() {
		return {
			mytext: forecast,
			marine: marine,
			airquality: airquality,
			airQI: airQI,
			airQIF: airQIF,
			airQIStat: airQIStat,
			airQIFStat: airQIFStat,
			language: this.config.language,
			forecastDays: this.config.showForecastDays,
			forecast: days
			};
	},
	
	getHeader() {
		return locationHeader;
	},

	
	getForecast() {
		this.fetchForecastFile();
		this.fetchMarineFile();
		
		if (this.config.airQualityRegion != "") {
			this.performWebRequest(this.getAirQualityUrl(), "xml", true, undefined, undefined)
			.then((data) => {
				var region = data.querySelector("conditionAirQuality region");
				if (region) {
					airquality = region.getAttribute("nameEn");
					airQI = data.querySelector("conditionAirQuality airQualityHealthIndex").textContent;
					if (airQI > 6) airQIStat = "high";
					else if (airQI > 3) airQIStat = "med";
					else airQIStat = "low";
					this.updateDom(0);
				}
			});

			this.performWebRequest(this.getAirQualityForecastUrl(), "xml", true, undefined, undefined)
			.then((data) => {
				airQIF = data.querySelector("forecastAirQuality forecastGroup forecast airQualityHealthIndex").textContent;
					if (airQIF > 6) airQIFStat = "high";
					else if (airQIF > 3) airQIFStat = "med";
					else airQIFStat = "low";
				this.updateDom(0);
			});
		}
	},
	
	getCurrentHourGMT() {
		const now = new Date();
		return now.toISOString().substring(11, 13); // "HH" in GMT
	},

	async fetchForecastFile() {
		const date = new Date();
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		let forecastURL = "https://dd.weather.gc.ca/${year}${month}${day}/";

		forecastURL += "WXO-DD/citypage_weather/" + this.config.provCode;
		const hour = this.getCurrentHourGMT();

		forecastURL += `/${hour}/`;
		fileSuffix = this.config.siteCode + "_" + this.config.language + ".xml";

		// Fetch the file from the directory listing
		const request = {};
		requestUrl = this.getCorsUrl(forecastURL, undefined, undefined);
		const response = await fetch(requestUrl, request);
		const data = await response.text();

		let forecastFile = '';
		let forecastFileURL = '';
		let nextFile = data.split(fileSuffix);
		if (nextFile.length > 1) {
			// Find the last occurrence
			forecastFile = nextFile[nextFile.length - 2].slice(-41) + fileSuffix;
			forecastFileURL = forecastURL + forecastFile;
			this.forecastCallback(forecastFileURL);
		}
	},
	
	forecastCallback(forecastURL) {
		this.performWebRequest(forecastURL, "xml", true, undefined, undefined)
		.then((data) => {
			if (locationHeader == "false") {
				locationHeader = ""
			} else {
				if (locationHeader == "") {
					locationHeader = data.querySelector("siteData location name").textContent;
					if (this.config.language == "fr") locationHeader = "Prévisions pour " + locationHeader;
					else locationHeader = "Forecast for " + locationHeader;
				}
			}
			var forecastArray = data.querySelectorAll("siteData forecastGroup forecast");
			forecast = "";
			for (let i = 0; i < this.config.textForecasts; i += 1) {
				forecast += "<b>" + forecastArray[i].querySelector("period").getAttribute("textForecastName") + ":</b> ";
				forecast += forecastArray[i].querySelector("textSummary").textContent + " ";
			}
			
			if (this.config.showAlerts) {
				var alert = data.querySelectorAll("siteData warnings event");
				if (alert && alert.length > 0) {
					for (let i = 0; i < alert.length; i += 1) {
						if (alert[i].getAttribute("type") === "warning")  {
							forecast = "<b>" + alert[i].getAttribute("description") + "</b>. " + forecast;
						}
					}
				}
			}
			
			if (this.config.showForecastDays > 2) {
				var firstEntry = forecastArray[0].querySelector("period").getAttribute("textForecastName");
				var today = "Today";
				if (this.config.language === "fr") {
					today = "Aujourd'hui";
				}
				var forecastObj = new ForecastData();
				var newdays = [];
				forecastObj.date = today;
				try {
				for (let i = 0; i < 12; i += 1) {
						if ((firstEntry === today && i % 2 == 0) || (firstEntry != today && i % 2 == 1)) {
							forecastObj.date = forecastArray[i].querySelector("period").getAttribute("textForecastName");
							forecastObj.condition = this.convertWeatherType(forecastArray[i].querySelector("abbreviatedForecast iconCode").textContent);
							forecastObj.temp = forecastArray[i].querySelector("temperatures temperature").textContent + "\u00B0";
							forecastObj.pop = forecastArray[i].querySelector("abbreviatedForecast pop").textContent;
							if (forecastObj.pop > 0) forecastObj.pop += "%";
						} else {
							forecastObj.nightCondition = this.convertWeatherType(forecastArray[i].querySelector("abbreviatedForecast iconCode").textContent);
							forecastObj.nightTemp = forecastArray[i].querySelector("temperatures temperature").textContent + "\u00B0";
							forecastObj.nightPop = forecastArray[i].querySelector("abbreviatedForecast pop").textContent;
							if (forecastObj.nightPop > 0) forecastObj.nightPop += "%";
							newdays.push(forecastObj);
							forecastObj = new ForecastData();
						}
					}
				} catch (error) {
					Log.error(error);
				}
				if (newdays.length < 6) {
					Log.error("Error retrieving forecast ", days.length);
				} else {
					days.splice(0);
					days = newdays;
				}
			}
			
			this.updateDom(0);
		});
	},
	
	async fetchMarineFile() {
		if (this.config.marineRegion != "") {
			const date = new Date();
			var month = date.getMonth() + 1;
			var inPeriod = true;
			if (this.config.marineStartMonth < this.config.marineEndMonth) {
				if (month < this.config.marineStartMonth || month > this.config.marineEndMonth) inPeriod = false;
			} else {
				if (month < this.config.marineStartMonth && month > this.config.marineEndMonth) inPeriod = false;
			}
			
			if (inPeriod) {			
				let forecastURL = "https://dd.weather.gc.ca/marine_weather/" + this.config.marineRegion;
				const hour = this.getCurrentHourGMT();
				forecastURL += `/${hour}/`;
				mfileSuffix = this.config.marineSubRegion + "_" + this.config.language + ".xml";

				// Fetch the file from the directory listing
				const request = {};
				requestUrl = this.getCorsUrl(forecastURL, undefined, undefined);
				const response = await fetch(requestUrl, request);
				const data = await response.text();

				let forecastFile = '';
				let forecastFileURL = '';
				let nextFile = data.split(mfileSuffix);
				if (nextFile.length > 1) {
					// Find the last occurrence
					forecastFile = nextFile[nextFile.length - 2].slice(-39) + mfileSuffix;
					forecastFileURL = forecastURL + forecastFile;
					this.marineCallback(forecastFileURL);
				}
			}
		}
	},
	
	marineCallback(forecastURL) {
		this.performWebRequest(forecastURL, "xml", true, undefined, undefined)
		.then((data) => {
			var warningsArray = data.querySelectorAll("marineData warnings location");
			marine = "";
			if (warningsArray && warningsArray.length > 0) {
				for (let i = 0; i < warningsArray.length; i += 1) {
					var name = warningsArray[i].getAttribute("name");
					if (!name || name === this.config.marineLocation) {
						var event = warningsArray[i].querySelector("event");
						if (event) {
							var status = event.getAttribute("status");
							if (status && (status === "EN VIGUEUR" || status === "IN EFFECT")) {
								marine += "<b>" + event.getAttribute("name") + ".</b> ";
							}
						}
					}
				}
			}
			
			var marineArray = data.querySelectorAll("marineData regularForecast location");
			if (marineArray && marineArray.length > 0) {
				for (let i = 0; i < marineArray.length; i += 1) {
					var name = marineArray[i].getAttribute("name");
					if (!name || name === this.config.marineLocation) {
						var wind = marineArray[i].querySelector("weatherCondition wind");
						marine += wind.textContent + " ";
					}
				}
			}

			if (marine != "") {
				if (this.config.language === "fr") marine = "<b>Météo maritime:</b> " + marine;
				else marine = "<b>Marine Forecast:</b> " + marine;
				this.updateDom(0);
			}
		});
	},
	
	getAirQualityUrl() {
		return `https://dd.weather.gc.ca/air_quality/aqhi/${this.config.airQualityProv}/observation/realtime/xml/AQ_OBS_${this.config.airQualityRegion}_CURRENT.xml`;
	},
	
	getAirQualityForecastUrl() {
		return `https://dd.weather.gc.ca/air_quality/aqhi/${this.config.airQualityProv}/forecast/realtime/xml/AQ_FCST_${this.config.airQualityRegion}_CURRENT.xml`;
	},
	
	convertWeatherType(weatherType) {
		const weatherTypes = {
			"00": "day-sunny",
			"01": "day-sunny",
			"02": "day-sunny-overcast",
			"03": "day-cloudy",
			"04": "day-cloudy",
			"05": "day-cloudy",
			"06": "day-sprinkle",
			"07": "day-showers",
			"08": "day-snow",
			"09": "day-thunderstorm",
			10: "cloud",
			11: "showers",
			12: "rain",
			13: "rain",
			14: "sleet",
			15: "sleet",
			16: "snow",
			17: "snow",
			18: "snow",
			19: "thunderstorm",
			20: "cloudy",
			21: "cloudy",
			22: "day-cloudy",
			23: "day-haze",
			24: "fog",
			25: "snow-wind",
			26: "sleet",
			27: "sleet",
			28: "rain",
			29: "na",
			30: "night-clear",
			31: "night-clear",
			32: "night-partly-cloudy",
			33: "night-alt-cloudy",
			34: "night-alt-cloudy",
			35: "night-partly-cloudy",
			36: "night-alt-showers",
			37: "night-rain-mix",
			38: "night-alt-snow",
			39: "night-thunderstorm",
			40: "snow-wind",
			41: "tornado",
			42: "tornado",
			43: "windy",
			44: "smoke",
			45: "sandstorm",
			46: "thunderstorm",
			47: "thunderstorm",
			48: "tornado"
		};

		return weatherTypes.hasOwnProperty(weatherType) ? weatherTypes[weatherType] : null;
	},
	
	async performWebRequest(url, type = "json", useCorsProxy = false, requestHeaders = undefined, expectedResponseHeaders = undefined) {
		const request = {};
		let requestUrl;
		if (useCorsProxy) {
			requestUrl = this.getCorsUrl(url, requestHeaders, expectedResponseHeaders);
		} else {
			requestUrl = url;
			request.headers = this.getHeadersToSend(requestHeaders);
		}
		const response = await fetch(requestUrl, request);
		const data = await response.text();

		if (type === "xml") {
			return new DOMParser().parseFromString(data, "text/html");
		} else {
			if (!data || !data.length > 0) return undefined;

			const dataResponse = JSON.parse(data);
			if (!dataResponse.headers) {
				dataResponse.headers = this.getHeadersFromResponse(expectedResponseHeaders, response);
			}
			return dataResponse;
		}
	},

/**
 * Gets a URL that will be used when calling the CORS-method on the server.
 * @param {string} url the url to fetch from
 * @param {Array.<{name: string, value:string}>} requestHeaders the HTTP headers to send
 * @param {Array.<string>} expectedResponseHeaders the expected HTTP headers to receive
 * @returns {string} to be used as URL when calling CORS-method on server.
 */
	getCorsUrl(url, requestHeaders, expectedResponseHeaders) {
		if (!url || url.length < 1) {
			throw new Error(`Invalid URL: ${url}`);
		} else {
			let corsUrl = `${location.protocol}//${location.host}/cors?`;

			const requestHeaderString = this.getRequestHeaderString(requestHeaders);
			if (requestHeaderString) corsUrl = `${corsUrl}sendheaders=${requestHeaderString}`;

			const expectedResponseHeadersString = this.getExpectedResponseHeadersString(expectedResponseHeaders);
			if (requestHeaderString && expectedResponseHeadersString) {
				corsUrl = `${corsUrl}&expectedheaders=${expectedResponseHeadersString}`;
			} else if (expectedResponseHeadersString) {
				corsUrl = `${corsUrl}expectedheaders=${expectedResponseHeadersString}`;
			}

			if (requestHeaderString || expectedResponseHeadersString) {
				return `${corsUrl}&url=${url}`;
			}
			return `${corsUrl}url=${url}`;
		}
	},

	/**
	 * Gets the part of the CORS URL that represents the HTTP headers to send.
	 * @param {Array.<{name: string, value:string}>} requestHeaders the HTTP headers to send
	 * @returns {string} to be used as request-headers component in CORS URL.
	 */
	getRequestHeaderString(requestHeaders) {
		let requestHeaderString = "";
		if (requestHeaders) {
			for (const header of requestHeaders) {
				if (requestHeaderString.length === 0) {
					requestHeaderString = `${header.name}:${encodeURIComponent(header.value)}`;
				} else {
					requestHeaderString = `${requestHeaderString},${header.name}:${encodeURIComponent(header.value)}`;
				}
			}
			return requestHeaderString;
		}
		return undefined;
	},

	/**
	 * Gets headers and values to attach to the web request.
	 * @param {Array.<{name: string, value:string}>} requestHeaders the HTTP headers to send
	 * @returns {object} An object specifying name and value of the headers.
	 */
	getHeadersToSend(requestHeaders) {
		const headersToSend = {};
		if (requestHeaders) {
			for (const header of requestHeaders) {
				headersToSend[header.name] = header.value;
			}
		}

		return headersToSend;
	},

	/**
	 * Gets the part of the CORS URL that represents the expected HTTP headers to receive.
	 * @param {Array.<string>} expectedResponseHeaders the expected HTTP headers to receive
	 * @returns {string} to be used as the expected HTTP-headers component in CORS URL.
	 */
	getExpectedResponseHeadersString(expectedResponseHeaders) {
		let expectedResponseHeadersString = "";
		if (expectedResponseHeaders) {
			for (const header of expectedResponseHeaders) {
				if (expectedResponseHeadersString.length === 0) {
					expectedResponseHeadersString = `${header}`;
				} else {
					expectedResponseHeadersString = `${expectedResponseHeadersString},${header}`;
				}
			}
			return expectedResponseHeaders;
		}
		return undefined;
	},

	/**
	 * Gets the values for the expected headers from the response.
	 * @param {Array.<string>} expectedResponseHeaders the expected HTTP headers to receive
	 * @param {Response} response the HTTP response
	 * @returns {string} to be used as the expected HTTP-headers component in CORS URL.
	 */
	getHeadersFromResponse(expectedResponseHeaders, response) {
		const responseHeaders = [];

		if (expectedResponseHeaders) {
			for (const header of expectedResponseHeaders) {
				const headerValue = response.headers.get(header);
				responseHeaders.push({ name: header, value: headerValue });
			}
		}

		return responseHeaders;
	},

});
