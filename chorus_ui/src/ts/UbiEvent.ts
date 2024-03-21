import { integer } from "@opensearch-project/opensearch/api/types";

/**
 * Ubi Event data structures
 */


export class UbiEventData {
	public readonly data_type:string;
	public data_id:string;
	public description:string;
	public data_detail:{};
	constructor(type:string, id:string=null, description=null, details=null) {
		this.data_type = type;
		this.data_id = id;
		this.description = description;
		this.data_detail = details;
	}
}

export class UbiEventAttributes {
	/**
	 * Attributes should be in the form of
	 * attributes['item1'] = 1
	 * attributes['item2'] = '2'
	 * 
	 * The data member is reserved for further, relevant data payloads or classes
	 */
	public data:UbiEventData ; //any data object
	constructor(data:UbiEventData=null) {
		if(data)
			this.data = data;
	}
}

export class UbiEvent {
	/**
	 * The following are keywords for the logging schema
	 * All other event attributes should be set in this.event_attributes
	 */
	public readonly action_name:string;
	public readonly user_id:string;
	public query_id:string;
	public session_id:string;
	public page_id:string= window.location.pathname
	public message_type:string='INFO';
	public message:string;
	public timestamp:number=Date.now();
	public event_attributes:UbiEventAttributes = new UbiEventAttributes();

	constructor(action_name:string, user_id:string, query_id:string, message:string=null) {
		this.action_name = action_name;
		this.user_id = user_id;
		this.query_id = query_id;

		if( message )
			this.message = message;
	}

	setMessage(message:string, message_type:string='INFO'){
		this.message = message
		this.message_type = message_type
	}

	/**
	 * 
	 * @returns json string
	 */
	toJson():string {
		return JSON.stringify(this);
	}
}