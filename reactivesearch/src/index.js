import React from 'react';
import  { createRoot } from 'react-dom/client';
import App from './App';
import registerServiceWorker from './registerServiceWorker';


//import OpenLogClient from './js/OpenLogClient'
var OpenLogClient = require('./ts/OpenLogClient.ts').OpenLogClient;

const {
	CollectorModule,
	Context,
	cookieSessionResolver,
	debounce,
	DefaultWriter,
	FiredSearchCollector,
	InstantSearchQueryCollector,
	positionResolver,
	Query,
	Sentinel,
	Trail,
	TrailType,
	DebugWriter,
	QueryWriter,
	TrailWriter,
	JSONEnvelopeWriter,
	RedirectCollector,
	BrowserTrackingWriter,
	ProductClickCollector,
	ImpressionCollector,
	SearchResultCollector,
	BasketClickCollector,
	CheckoutClickCollector,
	ConsoleTransport,
	SuggestSearchCollector,
	AssociatedProductCollector,
	ListenerType,
} = window.SearchCollector;


/**
 * Used for demo purposes only, store all events in localstorage.
 * For live environments rely on DefaultWriter class shipped with the search-collector packages
 */
class DemoWriter {

	constructor(queryResolver, sessionResolver, channel, debug) {

		const localstorageWriter = {
			write: (data) => {
				const dataArr = JSON.parse(localStorage.getItem("____localstorageWriter") || "[]");
				dataArr.push(data);
				localStorage.setItem("____localstorageWriter", JSON.stringify(dataArr));
			}
		}
		const SearchCollector = window.SearchCollector;
		let writer = new SearchCollector.DebugWriter(localstorageWriter, debug);
		writer = new SearchCollector.QueryWriter(writer, queryResolver);
		writer = new SearchCollector.TrailWriter(writer, new SearchCollector.Trail(queryResolver, sessionResolver), queryResolver);
		writer = new SearchCollector.JSONEnvelopeWriter(writer, sessionResolver, channel);
		writer = new SearchCollector.BrowserTrackingWriter(writer, {
			recordReferrer: true,
			recordUrl: true,
			recordLanguage: true
		});

		this.writer = writer;
	}

	write(data) {
		this.writer.write(data);
	}
}

const sessionResolver = () => cookieSessionResolver();

const queryResolver = () => {
	const params = new URLSearchParams(window.location.search);

	const query = new Query();
	query.setSearch(params.get("query"));

	return query;
}
const debug = true;
const trail = new Trail(queryResolver, sessionResolver);
const context = new Context(window, document);
const writer = new DemoWriter(queryResolver, sessionResolver, "demo-channel", debug);

const collectorModule = new CollectorModule({
	writer,
	context
});

collectorModule.addLogTransport(new ConsoleTransport());

collectorModule.add(new InstantSearchQueryCollector('[data-track-id="searchBox"]'));

collectorModule.add(new SuggestSearchCollector((writer, type, context) => {
	new Sentinel(context.getDocument()).on('[data-track-id="suggestSearchTerm"]', (element) => {
		element.addEventListener("mouseup", () => {
			writer.write({
				type,
				keywords: sanitize(element.textContent)
			});
		})
	});
}));



//< React18
//ReactDOM.render(<App />, document.getElementById('root'));
//React 18+
const root = createRoot(document.getElementById('root'));
root.render(<App />);
registerServiceWorker();
