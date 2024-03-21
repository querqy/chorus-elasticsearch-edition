import axios, {AxiosRequestConfig, AxiosProxyConfig, AxiosInstance} from "axios";
import { UbiEvent } from "./UbiEvent";

/**
 * Methods and client to talk directly with the OpenSearch Ubi plugin
 * for logging events
 */



/**
 * Class to handle OpenSearch authentication (eventually) log connectivity
 */
export class UbiClient {
    static readonly API = '/_plugins/ubi/';

    private readonly baseUrl:string;
    private readonly url:string;
    private readonly ubi_store:string;
	private readonly rest_client:AxiosInstance; //client for direct http work
	private readonly rest_config:AxiosRequestConfig;
    private user_id:string;
    private session_id:string;
    private search_index:string;
    private index_field:string;
    private verbose:number=0;


    //TODO: ubi headers/cookies
    //TODO: capture response and request headers

    constructor(baseUrl:string, ubi_store:string, user_id:string=null, session_id:string=null) {


        //TODO: param checking
        this.baseUrl = baseUrl;
        this.url = baseUrl + UbiClient.API;
        this.ubi_store = ubi_store;

        this.user_id = (user_id != null) ? user_id : sessionStorage.getItem('user_id');
        this.session_id = (session_id != null) ? session_id : sessionStorage.getItem('session_id');

        //TODO: make these parameters when the interface is more finalized
        this.search_index = sessionStorage.getItem('search_index');
        this.index_field = sessionStorage.getItem('index_field');


        //TODO: add authentication
        this.rest_config = {
			//url
			//method
			//baseUrl
			headers :{
				//'Content-Type':'application/x-www-form-urlencoded',
				'Content-type': 'application/json',
                'X-ubi-store': ubi_store,
                //'X-ubi-query-id': query_id,
                'X-ubi-user-id': user_id,
                'X-ubi-session-id':session_id,
			},
			//httpAgent
			//httpsAgent
			//proxy :proxy
			//data
            //data: {'X-ubi-store': this.ubi_store}
			//timeout
			//withCredentials
			//responseType
			//responseEncoding
			//env:FormData
		};

        //TODO: replace with more precise client configuration
        this.rest_client = axios.create({
            baseURL: baseUrl,
            headers: { 'Content-type': 'application/json' },
            withCredentials:true
        });


        //if the ubi store doesn't exist, create it
        if(this.get_stores().indexOf(this.ubi_store) != -1){
            this.init();
        }

    }

    /**
     * 
     * @returns All available Ubi stores
     */
    get_stores(){
        const response = this._get(this.url).then(
        (response) => {
            if(response.status == 200){
                console.log('Listing stores: ' + JSON.stringify(response));
                return response['data']['stores'];
            }
            }
        ).catch(
            (error) => {
                console.warn('Error querying stores: ' + error);
                console.warn('Ubi Store ' + this.ubi_store + ' needs to be initialized');
                } 
        )
    
        return []
    }

    /**
     * Initialize the Ubi store
     * @returns true, if the store is created
     */
    init(){
        if( this.search_index == null || this.index_field == null){
            try{
                const response = this._put(this.url + this.ubi_store + '/index=' + this.search_index).then(
                    (response) => {
                        console.log('Inititializing ' + this.ubi_store + ': ' + JSON.stringify(response));
                        return true;
                    }
                ).catch(
                    (error) => {
                        console.error('Error initializing ' + this.ubi_store + ': ' + error);
                    } 
                )
            } catch(error){
                console.error('Error initializing ' + this.ubi_store + ': ' + error);
            } 
        } else {
            console.error('Cannot initialize Ubi store.');
        }
        return false;
    }

    async log_event(e:UbiEvent, message:string=null, message_type:string=null){
        if(message){
            if(e.message){
                e['extra_info'] = message;
                if(message_type)
                    e['extra_info_type'] = message_type;
            }
            else{
                e.message = message;
                e.message_type = message_type;
            }
        }
        const json = e.toJson();
        if(this.verbose > 0){
            console.log('POSTing event: ' + json);
        }

        return this._post(json);
    }

    /**
     * Delete the ubi store.  Allow clients to do this?
     * @returns
     *
    async delete() {
        try {
            const response = await this.rest_client.delete(this.url + this.ubi_store, this.rest_config )
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }
    */
    async _get(url) {
        try {
            const response = await this.rest_client.get(url, this.rest_config);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    async _post(data) {
        try {
            const response = await this.rest_client.post(this.url + this.ubi_store, data, this.rest_config);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    async _put(data=null) {
        try {
            const response = await this.rest_client.put(this.url + this.ubi_store , data, this.rest_config);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }


}
