// Checkout out the demo at https://github.com/searchhub/search-collector/tree/master/demo and https://www.searchhub.io/search-collector/demo/ for collector implementation details

import {CollectorModule, Context, DefaultWriter, FiredSearchCollector, InstantSearchQueryCollector, Trail, Query, cookieSessionResolver, ConsoleTransport, positionResolver, ListenerType, ProductClickCollector} from "search-collector";
import { OLWriter } from "./OLWriter";
import { default as olPost } from "./OpenLogClient";

//let debug_events = '[{"type":"search","action":"search","url":"http://localhost:10202/demo.html","ref":"","lang":"en-US","timestamp":1706109997947,"session":"rbn3lg0","channel":"demo-channel","query":""},{"type":"instant-search","keywords":"knvmjhvbkj","timestamp":1706110004006,"url":"http://localhost:10202/demo.html","ref":"","lang":"en-US","session":"rbn3lg0","channel":"demo-channel","query":""},{"type":"fired-search","keywords":"knvmjhvbkj","query":"$s=knvmjhvbkj/","url":"http://localhost:10202/demo.html","ref":"","lang":"en-US","timestamp":1706110006726,"session":"rbn3lg0","channel":"demo-channel"},{"type":"search","keywords":"knvmjhvbkj","action":"search","url":"http://localhost:10202/demo.html?query=knvmjhvbkj","ref":"http://localhost:10202/demo.html","lang":"en-US","timestamp":1706110009040,"session":"rbn3lg0","channel":"demo-channel","query":"$s=knvmjhvbkj/"}]'


export function post(msg){
	return olPost(msg);
} 


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
}

	/**
	 * Clear Events
	 */
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

	/*
	searchBox?.addEventListener("keypress", (event) => {
		if (event.key === "Enter" && searchBox.value && event.repeat === false) {
			callback(searchBox.value);
		}
	});

	searchButton?.addEventListener("click", (event) => {
		if (searchBox.value)
			callback(searchBox.value);
	});
*/
}

//##################################################################
//on document load, hook things up here
document.addEventListener('DOMContentLoaded', function () {

	//alert('LOADED');

});
//##################################################################


const debug = true;
const trail = new Trail(queryResolver, sessionResolver);
const context = new Context(window, document);




/**/
const writer = new OLWriter('http://127.0.0.1:9200', 'ubl_log', queryResolver, sessionResolver,  debug);

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
