import axios, {AxiosRequestConfig, AxiosProxyConfig, AxiosInstance} from "axios";
import OS from '@opensearch-project/opensearch'
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
    private readonly log_name:string;
	private readonly rest_client:AxiosInstance; //client for direct http work
	private readonly rest_config:AxiosRequestConfig;
    private readonly os_client:OS.Client;       //client for OpenSearch general interactions

    constructor(baseUrl:string, log_name:string) {

        
        //TODO: param checking
        this.baseUrl = baseUrl;
        this.url = baseUrl + UbiLogger.API;
        this.log_name = log_name;

        //TODO: add authentication
        this.rest_config = {
			//url
			//method
			//baseUrl
			headers :{
				//'Content-Type':'application/x-www-form-urlencoded',
				'Content-type': 'application/json',
                //'Cookie': 'X-ubi-store:' + this.log_name
			},
			//httpAgent
			//httpsAgent
			//proxy :proxy
			//data
            //data: {'X-ubi-store': this.log_name}
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
            const response = await this.rest_client.delete(this.url + this.log_name, this.rest_config )
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
            document.cookie = 'X-ubi-store:' + this.log_name
            const response = await this.rest_client.post(this.url + this.log_name, data, this.rest_config);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    async _put(data=null) {
        try {
            const response = await this.rest_client.put(this.url + this.log_name , data, this.rest_config);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }


}



/**
 * Barebones OpenSearch post method
 */
export default function post(msg) {
    //alert('About to post');
    try{
        var rq = new XMLHttpRequest;

        rq.onreadystatechange = function() {
            if (this.readyState == 4 ){//} && this.status == 200) {
                if(this.responseText != null && this.responseText != ''){
                    console.log(this.responseText);
                    //alert('Response -> ' + this.responseText)
                }
                else
                    console.log('Possible CORS violation')
            }
        };

        /*
        rq.onerror = function(){
            if(this.error != null && this.error != ''){
                console.log(this.error);
                alert('ERROR: ' + this.error);
            }
            else
                alert('unspecified error');
        }
*/

        var j = JSON.stringify({'text': msg});
        rq.open("POST", "http://127.0.0.1:9200/_plugins/search_relevance/os_logger");

        /**
        * changing from form-urlencoded to json, will trigger an 
        * addtional CORS HTTP query of "OPTIONS"
        * before actually POSTing, which *could* throw errors before the POST
        * could even be triggered
        * BUT OpenSearch doesn't allow form-urlencoded posts out of the box
        */
            rq.setRequestHeader("Content-type", "application/json");
            //rq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

            rq.send(j);
            //alert('No errors thrown. Check log for: ' + j);
        } catch(error){
            console.log(error)
            //alert("Ahh sorry. That didn't work! " + error);
        }

}


