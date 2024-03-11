//##########################
//TODO: place holder for demo, most of what is below is old code 
//##########################

// to link search collector in to an old demo
// from the demo at https://github.com/searchhub/search-collector/tree/master/demo and https://www.searchhub.io/search-collector/demo/ for collector implementation details
//import {CollectorModule, Context, DefaultWriter, FiredSearchCollector, InstantSearchQueryCollector, Trail, Query, cookieSessionResolver, ConsoleTransport, positionResolver, ListenerType, ProductClickCollector} from "search-collector";
import { UbiWriter } from "./UbiWriter";

/**
 * 
 * Search collector wiring
const lastPathSegmentRegex = /\/(?:.(?!\/))+$/g;

function redirect(path) {
	document.location.href = window.location.href.replace(lastPathSegmentRegex, "") + path;
}	

function resetEvents(){
	localStorage.setItem("____localstorageWriter", "[]");
	localStorage.setItem("search-collector-trail", "{}");
	sessionStorage.setItem("search-collector-trail", "{}");
	document.cookie = "SearchCollectorSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	let e = document.querySelector("#events");
	if(e != null)
		e.innerHTML = "";
	else
		console.log("#events control is null");

	document.querySelector("#clearEvents")?.addEventListener("click", () => {
		resetEvents();
		document.location.reload();
	});

const sessionResolver = () => cookieSessionResolver();
const queryResolver = () => {
	const params = new URLSearchParams(window.location.search);
	const query = new Query();
	query.setSearch(params.get("query"));
	return query;
}

	
const firedSearchCallback = callback => {
	const searchBox = document.querySelector('[data-track-id="searchBox"]');
	const searchButton = document.querySelector('[data-track-id="searchButton"]');

	searchBox?.addEventListener("keypress", (event) => {
		if (event.key === "Enter" && searchBox.value && event.repeat === false) {
			callback(searchBox.value);
		}
	});

	searchButton?.addEventListener("click", (event) => {
		if (searchBox.value)
			callback(searchBox.value);
	});
}
*/

/**
const debug = true;
const trail = new Trail(queryResolver, sessionResolver);
const context = new Context(window, document);




const writer = new UbiWriter('http://127.0.0.1:9200', 'bad_log_shouldnt_exist', queryResolver, sessionResolver,  debug);

const collector = new CollectorModule({
	writer,
	context
});



collector.addLogTransport(new ConsoleTransport())
//xx ListenerType.Sentinel ?
collector.add(
	//TODO: fake product selection
	new ProductClickCollector('[data-track-id="timeButton"]', {
		idResolver: element => '42', //element.getAttribute('data-product-id'),
		positionResolver: element => positionResolver('[data-track-id="timeButton"]', element),
		priceResolver: element => 42,// extractPrice(element.querySelector('[data-track-id="priceContainer"]')?.textContent),
		metadataResolver: element => void 42, // metadata can be anything
		trail
	}));



document.querySelector('[data-track-id="searchButton"]')?.addEventListener("click", event => {
		//writer.write(JSON.stringify("I am here xx3"))
		//writer.write(location)
		redirect('/events.html?onclick')
	});

collector.add(new InstantSearchQueryCollector('[data-track-id="searchBox"]'));
collector.add(new FiredSearchCollector((writer, type, context) => {
	firedSearchCallback((searchPhrase) => {
		const query = new Query();
		query.setSearch(searchPhrase);
		writer.write({
			"type": type,
			"keywords": searchPhrase,
			"query": query.toString()
		});
	});
}));
collector.start();
*/