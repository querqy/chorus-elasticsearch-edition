import {Writer} from "search-collector";
//import {} from '../search_collector.window.bundle'
import {OpenLogClient} from "./OpenLogClient";
import { default as olPost } from "./OpenLogClient";

/*
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
*/

/**
 * This connects the OpenLogClient to the search-collector's DemoWriter code
 */
export class OLWriter implements Writer {
	private readonly logger:OpenLogClient;

	constructor(olUrl, channel, queryResolver, sessionResolver, debug) {

		this.logger = new OpenLogClient(olUrl, channel);

		const localstorageWriter = {
			write: (data) => {
				const dataArr = JSON.parse(localStorage.getItem("____localstorageWriter") || "[]");
				dataArr.push(data);
				localStorage.setItem("____localstorageWriter", JSON.stringify(dataArr));
			}
		}
		/*
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
		*/
	}

	write(data) {
		//olPost(data);
		this.logger.info(data);
		//alert(data);
		//this.writer.write(data);
	}
}