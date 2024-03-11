import axios, {AxiosRequestConfig, AxiosProxyConfig, AxiosInstance} from "axios";
import {Client} from '@opensearch-project/opensearch'
import { UbiEvent } from "./UbiEvent";

/**
 * Methods and client to talk directly with OpenSearch for logging
 *
 */



/**
 * Class to handle OpenSearch authentication (eventually) log connectivity
 */
export class UbiLogger {
    static readonly API = '/_plugins/ubi/';

    private readonly baseUrl:string;
    private readonly url:string;
    private readonly ubi_store:string;
	private readonly rest_client:AxiosInstance; //client for direct http work
	private readonly rest_config:AxiosRequestConfig;
    private readonly os_client:Client;       //client for OpenSearch easier, general interactions
    private user_id:string;
    private session_id:string;

    constructor(baseUrl:string, ubi_store:string, user_id:string=null, session_id:string=null) {


        //TODO: param checking
        this.baseUrl = baseUrl;
        this.url = baseUrl + UbiLogger.API;
        this.ubi_store = ubi_store;

        this.user_id = (user_id != null) ? user_id : sessionStorage.getItem('user_id');
        this.session_id = (session_id != null) ? session_id : sessionStorage.getItem('session_id');

        //TODO: uncomment to work through webpack fallback errors
        // this.os_client = new Client({node:baseUrl});

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

        //TODO: init if it doesn't exist
        //this.init();
    }

    init(){
        try{
            const response = this.rest_client.put(this.url + this.ubi_store , null, this.rest_config).then(
                (response) => {
                    console.log('Inititializing ' + this.ubi_store + ': ' + JSON.stringify(response));
                  }
            ).catch(
                (error) => {
                    console.error('Error initializing ' + this.ubi_store + ': ' + error);
                  } 
            )
        } catch(error){
            console.error('Error initializing ' + this.ubi_store + ': ' + error);
        }
    }

    //TODO: ubi headers/cookies
    //TODO: init event stores
    //TODO: capture response and request headers

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

        return this._post(e.toJson());
    }

    async log(level, message:string, data=null){
        var json = (data == null) ?
            JSON.stringify({'level':level, 'text': message}) :
            JSON.stringify({'level':level, 'text': message, 'data':data});
        return this._post(json);
    }

    async debug(message:string, data=null){
        return this.log('DEBUG', message, data)
    }
    async info(message:string, data=null){
        return this.log('INFO', message, data)
    }
    async error(message:string, data=null){
        return this.log('ERROR', message, data)
    }

    /**
     * Delete the index.  Allow clients to do this?
     * @returns
     */
    async delete() {
        try {
            const response = await this.rest_client.delete(this.url + this.ubi_store, this.rest_config )
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }
    async _get(url) {
        try {
            const response = await this.rest_client.get(url);
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
