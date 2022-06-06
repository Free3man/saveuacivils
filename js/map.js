"use strict";
//enums
const markerType = {
	basic: "basic",
	transport: "transport",
	military: "military"
},
styles = {
	streets: "mapbox://styles/mapbox/streets-v11",
	light: "mapbox://styles/mapbox/light-v10",
},
territoryRegions = {
	country: "country",
	region: "region",
	postcode: "postcode",
	district: "district",
	place: "place",
	locality: "locality",
	neighborhood: "neighborhood",
	address: "address",
	poi: "poi"
},
types = {
	geojson: "geojson",
	feature: "Feature",
	point: "Point"
};
//variables
const accessToken = "pk.eyJ1Ijoic3VhYyIsImEiOiJjbDJudDdycXkxNjE1M2lxY3QyOTM3NHV3In0.KkzJGb4qqdkbDH0NequqPA",
searchProperties = ["autocomplete", "bbox", "country", "fuzzyMatch", 
			"language", "limit", "proximity", "routing", "types", "worldview"],
defaultSearchSettings = {
	"language" : "uk"
};
let geojsons = [],
markers = [],
map;
//API
/**
 * this function is used to init and build map on the page
 * map will be saved in the variable called map
 * @param {HTMLElement} container in this container map will be uploaded
 * @param {link} style There is an object "styles" in which you can find two links and use them,
 *  if you find more, just insert them to that place not to male a mess here
 * @param {coordinates} center Array start coordinates which will be in the center of the screem after initialization 
 * @param {int} zoom zoom
 */
function mapInit(container, style, center, zoom) {
	mapboxgl.accessToken = accessToken;
	map = new mapboxgl.Map({
		container: container,
		style: style,
		center: center,
		zoom: zoom
	});
}
/**
 * renders a marker on a map that is located due to the coordinates
 * @param {coordinates} coordinates is responsible for the marker`s location
 */
function renderMarker(coordinates) {
	console.log(coordinates);
	const element = document.createElement("div");
	element.className = "marker";
	markers[markers.length] = new mapboxgl.Marker(element).setLngLat(coordinates).addTo(map);
}

/**
 * it is obvious
 * @param {array} coordinates where it is located
 * @param {string} title it is obvious
 * @returns geojson and automaticaly adds it in the end of geojsons
 */
function createGeoJson(coordinates, title) {
	const geojsonData = {
		type: types.geojson,
		data: {
			type: types.feature,
			geometry: {
				type: types.point,
				coordinates: coordinates
			},
			properties: {
				title: title,
			}
		}
	};
	geojsons[geojsons.length] = geojsonData;
	return geojsonData;
}

/**
 * collects coordinates from geojson faster then you type it each time
 * @param {object} geojson 
 * @returns coordinates from enterd geojson
 */
function getCoordinatesFromGeojson(geojson){
	return geojson.data.geometry.coordinates;
}

/**
 * converts search request and parameters to link
 * @param {string} search thing that you are searching
 * @param {object} searchSettings object with properties: 
 * -autocomplete(boolean)
 * Specify whether to return autocomplete results (true, default) or not (false).
 * When autocomplete is enabled, results will be included that start with the requested string, 
 * rather than just responses that match it exactly. For example, a query for India might return both 
 * India and Indiana with autocomplete enabled, but only India if it’s disabled. When autocomplete is enabled, 
 * each user keystroke counts as one request to the Geocoding API. For example, a search for "coff" would be 
 * reflected as four separate Geocoding API requests. To reduce the total requests sent, you can configure your 
 * application to only call the Geocoding API after a specific number of characters are typed.

 * -bbox [x1, y1, x2, y2]
 * Limit results to only those contained within the supplied bounding box. 
 * Bounding boxes should be supplied as four numbers separated by commas, in minLon,minLat,maxLon,maxLat order.
 * The bounding box cannot cross the 180th meridian.

 * -country(string)
 * Limit results to one or more countries. 
 * Permitted values are ISO 3166 alpha 2 country codes separated by commas.

 * -fuzzyMatch(boolean)
 * Specify whether the Geocoding API should attempt approximate, as well as exact, 
 * matching when performing searches (true, default), or whether it should opt out of
 * this behavior and only attempt exact matching (false). 
 * For example, the default setting might return Washington, 
 * DC for a query of wahsington, even though the query was misspelled.

 * -language(string)
 * Specify the user’s language. This parameter controls the language of the 
 * text supplied in responses, and also affects result scoring, with results matching the user’s
 * query in the requested language being preferred over results that match in another language. 
 * For example, an autocomplete query for things that start with Frank might return Frankfurt as 
 * the first result with an English (en) language parameter, but Frankreich (“France”) 
 * with a German (de) language parameter.
 * Options are IETF language tags comprised of a mandatory ISO 639-1 language code and, 
 * optionally, one or more IETF subtags for country or script.
 * More than one value can also be specified, separated by commas, 
 * for applications that need to display labels in multiple languages.
 * For more information on which specific languages are supported, see the language coverage section.

 * -limit(integer)
 * Specify the maximum number of results to return. The default is 5 and the maximum supported is 10.

 * -proximity(string)
 * Bias the response to favor results that are closer to this location. 
 * Provided as two comma-separated coordinates in longitude,latitude order,
 * or the string ip to bias based on reverse IP lookup.

 * -routing(boolean)
 * Specify whether to request additional metadata about the recommended navigation destination 
 * corresponding to the feature (true) or not (false, default). Only applicable for address features.
 * For example, if routing=true the response could include data about a point on the road the feature fronts. 
 * Response features may include an array containing one or more routable points.
 * Routable points cannot always be determined. Consuming applications should fall back to using the feature’s
 * normal geometry for routing if a separate routable point is not returned.

 * -types(string)
 * Filter results to include only a subset (one or more) of the available feature types. 
 * Options are country, region, postcode, district, place, locality, neighborhood, address, and poi. 
 * Multiple options can be comma-separated. Note that poi.landmark is a deprecated type that, while still supported, 
 * returns the same data as is returned using the poi type.
 * For more information on the available types, see the data types section.

 * -worldview(string)
 * Available worldviews are: cn,in,jp,us. If a worldview is not set, us worldview 
 * boundaries will be returned. For more information on using worldviews, see the worldviews section.
 * @returns link using which you can get a json with data due your search
 */
function convertIntoGeocoding(search, searchSettings){
	let request = `${search.replace(" ", "%20")}.json?`;
	if (searchSettings.hasOwnProperty("limit")){
		if(searchSettings.limit>10){
			searchSettings.limit = 10;
		}
		if (searchSettings.limit<0){
			searchSettings.limit = 5;
		}
	}
	for (const key in searchSettings) {
		if (searchSettings.hasOwnProperty(key) && searchProperties.includes(key)){
			request += `${key}=${searchSettings[key]}&`;
		}
	}
	for (const key in defaultSearchSettings) {
		if (defaultSearchSettings.hasOwnProperty(key) && !searchSettings.hasOwnProperty(key) &&
																	searchProperties.includes(key)) {
			request += `${key}=${defaultSearchSettings[key]}&`;
		}
	}
	return `https://api.mapbox.com/geocoding/v5/mapbox.places/${request}access_token=${accessToken}`;
}
/**
 * gets an object that contains a response to your reques
 * @param {string} search thing that you are searching
 * @param {object} searchSettings object with properties: 
 * 
 * @returns Promise which contains a response to your reques
 */
async function searching(search, searchSettings){
	const responce = await fetch(convertIntoGeocoding(search, searchSettings), {
		method: "GET"
	});
	return responce.json();
}

/**
 * recieves geojsons from server and fills geojsons(array) with them
 */
async function getGeojsons() {
	const response =  await fetch("php/getGeojson.php", {method: "GET"});
	const answer = response.json();
	answer.then(geojsons => {
		if(geojsons.hasOwnProperty('array')){
			geojsons.array.forEach(item => {
				item = JSON.parse(item);
				createGeoJson([+item.x, +item.y], item.title);
			});
		}
	});
}
/**
 * save all NEW geojsons on server
 * @returns Promise that containce an object with the responce if the operation was successful(in "result"(property))
 */
async function saveGeoJson() {
	const temp = geojsons;
	temp.forEach(item => item = JSON.stringify({
		title: item.title,
		x: getCoordinatesFromGeojson(item)[0],
		y: getCoordinatesFromGeojson(item)[1],
	}));
	return await fetch("php/saveGeojson.php", {
		method:"POST",
		body: JSON.stringify({array: temp})
	}).then(response => response.json());
}
//hiding bad things
window.addEventListener("load", ()=>{
	document.getElementsByClassName("mapboxgl-ctrl-bottom-right")[0].remove();
	document.getElementsByClassName("mapboxgl-ctrl-bottom-left")[0].remove();
});
//place where you will be writing your code using my api
document.addEventListener("DOMContentLoaded",  async () => {
	//mainflow
	
});