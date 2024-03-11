import React, {Component} from "react";
import {
  ReactiveBase,
  DataSearch,
  MultiList,
  ReactiveList,
  ResultCard,
  StateProvider,
  ResultList,
} from "@appbaseio/reactivesearch";
import AlgoPicker from './custom/AlgoPicker';

import {CollectorModule, Context, InstantSearchQueryCollector, Trail, Query, cookieSessionResolver, ConsoleTransport} from "search-collector";

var UbiWriter = require('./ts/UbiWriter.ts').UbiWriter;
var UbiEvent = require('./ts/UbiEvent.ts').UbiEvent;
var UbiAttributes = require('./ts/UbiEvent.ts').UbiEventAttributes;
var UbiData = require('./ts/UbiEvent.ts').UbiEventData;


//######################################
// global variables
//let has_results = false;//debug
//const test = `lorem <b onmouseover="alert('mouseover');">ipsum</b>`;

const event_server = "http://127.0.0.1:9200";
const search_credentials = "*:*";
const search_store = 'ecommerce'
const ubi_store = 'ubi_log'

const user_id = 'USER-eeed-43de-959d-90e6040e84f9'; // demo user id
const session_id = ((sessionStorage.hasOwnProperty('session_id')) ?
          sessionStorage.getItem('session_id') 
          : 'SESSION-' + guiid()); //<- new fake session, otherwise it should reuse the sessionStorage version
sessionStorage.setItem('ubi_store', ubi_store);
sessionStorage.setItem('event_server', event_server);
sessionStorage.setItem('user_id', user_id);
sessionStorage.setItem('session_id', session_id);


//######################################
// util functions, TODO: reorganize
function guiid() {
  let id = '';
  try{
    id = crypto.randomUUID();
  }
  catch(error){
    console.log('tried to generate a guiid in insecure context')
    id ='10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }
  return id;
};

//string format function
String.prototype.f = function () {
  var args = arguments;
  return this.replace(/{([0-9]+)}/g, function (match, index) {
    return typeof args[index] == 'undefined' ? match : args[index];
  });
};

function genQueryId(){
  return 'QUERY-' + guiid();
}

function QueryId(){
  return sessionStorage.getItem('query_id');
}

function CurrentHeaders(){
  let query_id = sessionStorage.getItem('query_id');
  if(query_id == null || query_id == 'null' || query_id==''){
    console.log('query_id is currently null')
    return {   
      'X-ubi-store': ubi_store,
    // if the client were to maintain query_id's:
    //'X-ubi-query-id': genQueryId(),
      'X-ubi-user-id': user_id,
      'X-ubi-session-id':session_id,
    };
  }

  return {   
    'X-ubi-store': ubi_store,
    'X-ubi-query-id': query_id,
    'X-ubi-user-id': user_id,
    'X-ubi-session-id':session_id,
  };
}

function genDataId(){
  return 'OBJECT-'+guiid();
}

function genTransactionId(){
  return 'TRANSACT-'+guiid();
}


/**
 * overriding send so that we can get the query id response
 * from any post
 */
(function(send) { 
  XMLHttpRequest.prototype.send = function(data) { 
      this.addEventListener('readystatechange', function() { 
        if (this.readyState == 4 ){//} && this.status == 200) {
          /**
           * only pull query_id out for searches on the main store
           * otherwise, this also runs for ubi client calls
           */
            if(this.responseURL.includes(search_store)){
              let headers = this.getAllResponseHeaders();
              if(headers.includes('query_id:')) {
              try{
                let query_id = this.getResponseHeader('query_id');
                if(query_id == null || query_id == 'null' || query_id==''){

                  query_id = genQueryId()
                  console.warn('Received null query id.  Generated - ' + query_id);
                }
                sessionStorage.setItem('query_id', query_id);
            }
            catch(error){
              console.log(error);
            }
          }else {
            console.warn('No query id in the search response headers => ' + headers);
          }
        } 
      }

      }, false); 
      try{
        send.call(this, data);
      }
      catch(error){
        console.warm('POST error: ' + error);
        console.log(data);
      }
  }; 
})(XMLHttpRequest.prototype.send);





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


// TODO: move parameters to properties file
const writer = new UbiWriter(event_server, ubi_store, queryResolver, sessionResolver,  debug);



//##################################################################
//on document load, hook things up here
document.addEventListener('DOMContentLoaded', function () {


});

//##################################################################




const queries = {
  'default': function( value ) { return {
    query: {
      multi_match: {
        query: value,
        fields: [ "id", "name", "title", "product_type" , "short_description", "ean", "search_attributes"]
      }
    }
  }}
}

class App extends Component {
  constructor(){
    super();
  }

  state = {
    customQuery: queries['default']('')
  };

  handleSearch = value => {
    this.setState({
      value
    });
  };


  componentDidMount(){
    console.log('mounted ' + this);

  }

  

  render(){
  return (
    //TODO: move url and other configs to proerties file
    <ReactiveBase
      componentId="market-place"
      url={event_server}
      app={search_store}
      credentials={search_credentials}
      //enableAppbase={true}  <- TODO: to allow auto analytics
      //enableAppbase={false} <- orig
      
      //**************************************************************

      
      headers={CurrentHeaders()}
      //**************************************************************
      

      

      recordAnalytics={true}
      searchStateHeader={true}
      
      transformResponse={async (response, componentId) => {
        if( componentId == 'typefilter'){
          //console.log('** Type change =>' + response);
        } else if(componentId == 'brandfilter'){
          //console.log('** Brand change =>' + response);
        } else if(componentId == 'results'){
          console.log('** Search results =>' + response);
          //has_results = true;
        }else if(componentId == 'logresults'){
          //event log update
          console.warn('log update');
        } else{
          console.warn(response, componentId);
        }

        
        return response;
      }}
      transformRequest={async (request) => {
        //request.headers['test'] = 'xyz';
       //console.log(request);
        
        return request;
      }}

            
    >
      <StateProvider
          onChange={(prevState, nextState) => {
            let queryString = nextState;
            console.log('Page.onChange - ' + queryString.searchbox.value);
            //this.search_text = queryString.searchbox.value;
            
          }}
          
      />
      <div style={{ height: "200px", width: "100%"}}>
        <img style={{ height: "100%", class: "center"  }} src={require('./assets/chorus-logo.png').default} />
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "20%",
            margin: "10px",
            marginTop: "50px"
          }}
        >
          <AlgoPicker
            title="Product Sort"
            componentId="algopicker" 
            writer={writer}
            user_id={user_id}
            query_id={QueryId()}
            session_id={session_id}
            />
          <MultiList
            componentId="brandfilter"
            dataField="supplier"
            title="Filter by Brands"
            size={20}
            showSearch={false}
            onQueryChange={  
              function(prevQuery, nextQuery) {
                if(nextQuery != prevQuery){
                  console.log('filtering on brands');
                  let e = new UbiEvent('brand_filter', user_id, QueryId());
                  e.message = 'filtering on brands';
                  e.session_id = session_id;
                  e.page_id = window.location.pathname;

                  e.event_attributes.data = new UbiData('filter_data', genDataId(), nextQuery);
                  writer.write_event(e);
                }
              }
            }
            react={{
              and: ["searchbox", "typefilter"]
            }}
            style={{ "paddingBottom": "10px", "paddingTop": "10px" }}
          />
          <MultiList
            componentId="typefilter"
            dataField="filter_product_type"
            title="Filter by Product Types"
            size={20}
            showSearch={false}
            onQueryChange={  
              function(prevQuery, nextQuery) {
                if(nextQuery != prevQuery){
                  console.log('filtering on product types');
                  let e = new UbiEvent('type_filter', user_id, QueryId());
                  e.message = 'filtering on product types';
                  e.session_id = session_id;
                  e.page_id = window.location.pathname;

                  e.event_attributes.data = new UbiData('filter_data', genDataId(), nextQuery);
                  writer.write_event(e);
                }
              }
            }
            react={{
              and: ["searchbox", "brandfilter"]
            }}
            style={{ "paddingBottom": "10px", "paddingTop": "10px" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: "75%" }}>
          <DataSearch 
          onValueChange={
            function(value) {
              console.log("onValueChanged search value: ", value)

              //TODO: pull in user id, query id, page id, etc.
              let e = new UbiEvent('on_search', user_id, QueryId(), value);
              e.message_type = 'QUERY'
              e.session_id = session_id
              e.page_id = window.location.pathname;
              writer.write_event(e);
            }
          }
          onChange={
            function(value, cause, source) {
            //  console.log("onChange current value: ", value)
            }
          } 
          onValueSelected={
            function(value, cause, source) {
              console.log("onValueSelected current value: ", value)
            }
          }
          beforeValueChange = { function(value){
            // The update is accepted by default
            //if (value) {
                // To reject the update, throw an error
          //    console.log("beforeValueChanged current value: ", value)
            
        }}
          onQueryChange={
            function(prevQuery, nextQuery) {
              // use the query with other js code
              console.log('prevQuery', prevQuery);
              console.log('nextQuery', nextQuery);
            }
          }
            style={{
              marginTop: "35px"
            }}
            componentId="searchbox"
            placeholder="Search for products, brands or EAN"
            autosuggest={false}
            dataField={["id", "name", "title", "product_type" , "short_description", "ean", "search_attributes"]}
            customQuery={ 
              function(value) {
                  return queries[ 'default' ](value);
              }
            }
          />
          <ReactiveList
            componentId="results"
            dataField="title"
            size={20}
            pagination={true}
            react={{
              and: ["searchbox", "brandfilter", "typefilter"]
            }}
            onClick={
            function(results) {
              //page scrolling
              console.warn('on click');
            }
          }
            onPageClick={
              function(results) {
                //page scrolling
                //console.warn('click');
              }
            }
            style={{ textAlign: "center" }}
            render={({ data }) => (
              <ReactiveList.ResultCardsWrapper>
                {data.map((item) => (
                  <div id='product_item' key={item.id} 
                  onMouseOver={
                    function(_event) {
                        console.log('mouse over ' + item.title);
                        let e = new UbiEvent('product_hover', user_id, QueryId());
                        e.message = item.title + ' (' + item.id + ')';
                        e.session_id = session_id;
                        e.page_id = window.location.pathname;
      
                        e.event_attributes.data = new UbiData('product', genDataId(), item.title, item);
                        e.event_attributes.data.data_id = item.id;
                        e.event_attributes.data.data_type = item.name;
                        writer.write_event(e);
                    }
                  }
                  onDoubleClick={    
                    function(_event) {
                      
                      if (window.confirm('Do you want to buy ' + item.title)) {
                        let e = new ubievent('product_purchase', user_id, QueryId());
                        e.message_type = 'PURCHASE';
                        e.message = item.title + ' (' + item.id + ')';
                        e.session_id = session_id;
                        e.page_id = window.location.pathname;
      
                        e.event_attributes.data = new UbiData('product', genDataId(), item.title, item);
                        e.event_attributes.data.data_id = item.id;
                        e.event_attributes.data.transaction_id = genTransactionId()
                        e.event_attributes.data.data_type = item.name;
                        writer.write_event(e);                       
                        console.log('User just bought ' + item.title);
                      } else {
                        let e = new UbiEvent('declined_product', user_id, QueryId());
                        e.message_type = 'REJECT'
                        e.message = item.title + ' (' + item.id + ')'
                        e.session_id = session_id
                        e.page_id = window.location.pathname;
      
                        e.event_attributes.data = new UbiData('product', genDataId(), item.title, item);
                        e.event_attributes.data.data_id = item.id;
                        e.event_attributes.data.data_type = item.name;
                        writer.write_event(e);
                        console.log('User declined to buy ' + item.title);
                      }
                    }
                  }
                  >
                  <ResultCard key={item._id} >
                    <ResultCard.Image
                      style={{
                        backgroundSize: "cover",
                        backgroundImage: `url(${item.img_500x500})`
                      }}

                    />
                    <ResultCard.Title
                      dangerouslySetInnerHTML={{
                        __html: item.title
                      }}
                    />
                    <ResultCard.Description>
                      {item.price/100 +
                        " $ | " +
                        item.supplier}
                    </ResultCard.Description>
                    
                  </ResultCard>
                  </div>
                ))}
              </ReactiveList.ResultCardsWrapper>
            )}
            onNoResults={
              function(results) {
                console.warn('no results');
              }
            }
            onData={
              function(results) {
                console.log('data query results => ' + results);
              }
            }
          />
        </div>
      </div>
    </ReactiveBase>
  );
}}
export default App;
