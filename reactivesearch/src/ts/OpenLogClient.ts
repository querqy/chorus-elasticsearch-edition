import axios, {AxiosRequestConfig, AxiosProxyConfig, AxiosInstance} from "axios";
/**
 * Methods and client to talk directly with OpenSearch for logging
 * 
 */



/**
 * Class to handle OpenSearch authentication (eventually) log connectivity
 */
export class OpenLogClient {
    static readonly API = '/_plugins/search_relevance/';

    private readonly baseUrl:string;
    private readonly url:string;
    private readonly log_name:string;
	private readonly client:AxiosInstance;
	private readonly config:AxiosRequestConfig;

    constructor(baseUrl:string, log_name:string) {

        //TODO: param checking
        this.baseUrl = baseUrl;
        this.url = baseUrl + OpenLogClient.API;
        this.log_name = log_name;

        //TODO: add authentication
        this.config = {
			//url
			//method
			//baseUrl
			headers :{
				//'Content-Type':'application/x-www-form-urlencoded',
				'Content-Type': 'application/json',
			},
			//httpAgent
			//httpsAgent
			//proxy :proxy
			//data
			//timeout
			//withCredentials
			//responseType
			//responseEncoding
			//env:FormData
		};

        //TODO: replace with more precise client configuration
        this.client = axios.create({
            baseURL: baseUrl,
            headers: { 'Content-Type': 'application/json' },
        });
		
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
            const response = await this.client.delete(this.url + this.log_name );
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }
    async _get(url) {
        try {
            const response = await this.client.get(url);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    async _post(data) {
        try {
            const response = await this.client.post(this.url + this.log_name, data, this.config);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    async _put(data=null) {
        try {
            const response = await this.client.put(this.url + this.log_name , data);
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


