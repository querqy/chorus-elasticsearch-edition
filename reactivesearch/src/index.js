import React from 'react';
import  { createRoot } from 'react-dom/client';
import App from './App';
import registerServiceWorker from './registerServiceWorker';




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
