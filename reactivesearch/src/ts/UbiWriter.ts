import {Writer} from "search-collector";
//import {} from '../search_collector.window.bundle'
import {UbiLogger} from "./UbiLogger";
import { default as olPost } from "./UbiLogger";
import { UbiEvent } from "./UbiEvent";

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
 * This connects the UbiLogger to the search-collector's DemoWriter code
 */
export class UbiWriter implements Writer {
	private readonly logger:UbiLogger;

	constructor(olUrl, channel, queryResolver, sessionResolver, debug) {


		this.logger = new UbiLogger(olUrl, channel);

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
		//TODO: chicken/egg?

		//this.logger.info(data);
		//this.writer.write(data);
		console.warn('EVENT WRITE => ' + JSON.stringify(data));
	}

	write_event(e:UbiEvent){
		this.logger.log_event(e);
		console.log('Just logged: ' + e.toJson());

		//TODO: xx this.write(e);  ?
	}
}