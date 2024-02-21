import React, {Component} from "react";
import {
  ReactiveBase,
  DataSearch,
  MultiList,
  ReactiveList,
  ResultCard,
  StateProvider,
} from "@appbaseio/reactivesearch";
import AlgoPicker from './custom/AlgoPicker';

import {CollectorModule, Context, InstantSearchQueryCollector, Trail, Query, cookieSessionResolver, ConsoleTransport} from "search-collector";

//var UbiLogger = require('./ts/UbiLogger.ts').UbiLogger;
var UbiWriter = require('./ts/UbiWriter.ts').UbiWriter;
var UbiEvent = require('./ts/UbiEvent.ts').UbiEvent;
var UbiAttributes = require('./ts/UbiEvent.ts').UbiEventAttributes;
var UbiData = require('./ts/UbiEvent.ts').UbiEventData;

//import UbiWriter from 'UbiWriter';
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
const writer = new UbiWriter('http://127.0.0.1:9200', 'ubl_log', queryResolver, sessionResolver,  debug);

//##################################################################
//on document load, hook things up here
document.addEventListener('DOMContentLoaded', function () {


  var elem = document.getElementById('algopicker');
  var algo = "";
  if (elem) {
    algo = elem.value
    
    //elem.setState({'writer':writer});
    elem.setAttribute('writer', writer);
    elem.setWriter(writer);
  
    //elem.writer = writer;
    console.log('Writer assignment');
  }
  else
  console.log('no algo')

});
//##################################################################


// utils.js - string format function
String.prototype.f = function () {
  var args = arguments;
  return this.replace(/{([0-9]+)}/g, function (match, index) {
    return typeof args[index] == 'undefined' ? match : args[index];
  });
};

const queries = {
  'default': function( value ) { return {
    query: {
      multi_match: {
        query: value,
        fields: [ "id", "name", "title", "product_type" , "short_description", "ean", "search_attributes"]
      }
    }
  }},
  'querqy_preview':function( value ) { return{
    query: {
      querqy: {
        matching_query: {
          query: value
        },
        query_fields: [ "id", "name", "title", "product_type" , "short_description", "ean", "search_attributes"],
        rewriters: ["replace_prelive", "common_rules_prelive"]
      }
    }
  }},
  'querqy_live':function( value ) { return{
    query: {
      querqy: {
        matching_query: {
          query: value
        },
        query_fields: [ "id", "name", "title", "product_type" , "short_description", "ean", "search_attributes"],
        rewriters: ["replace", "common_rules"]
      }
    }
  }},
  'querqy_boost_by_img_emb':function( value ) { return{
    query: {
      querqy: {
        matching_query: {
          query: value
        },
        query_fields: [ "id", "name", "title", "product_type" , "short_description", "ean", "search_attributes"],
        rewriters: [
          {
            "name": "embimg",
            "params": {
              "topK": 200,
              "mode": "BOOST",
              "f": "product_image_vector",
              "boost": 10.0
            }
          }
        ]
      }
    }
  }},
  'querqy_match_by_img_emb':function( value ) { return{
    query: {
      querqy: {
        matching_query: {
          query: value
        },
        query_fields: [ "id", "name", "title", "product_type" , "short_description", "ean", "search_attributes"],
        rewriters: [
          {
            "name": "embimg",
            "params": {
              "topK": 200,
              "mode": "MAIN_QUERY",
              "f": "product_image_vector"
            }
          }
        ]
      }
    }
  }},
  'querqy_boost_by_txt_emb': function( value ) { return{
    query: {
      querqy: {
        matching_query: {
          query: value
        },
        query_fields: [ "id", "name", "title", "product_type" , "short_description", "ean", "search_attributes"],
        rewriters: [
          {
            "name": "embtxt",
            "params": {
              "topK": 200,
              "mode": "BOOST",
              "f": "product_vector",
              "boost": 10.0
            }
          }
        ]
      }
    }
  }},
  'querqy_match_by_txt_emb':function( value ) { return{
    query: {
      querqy: {
        matching_query: {
          query: value
        },
        query_fields: [ "id", "name", "title", "product_type" , "short_description", "ean", "search_attributes"],
        rewriters: [
          {
            "name": "embtxt",
            "params": {
              "topK": 200,
              "mode": "MAIN_QUERY",
              "f": "product_vector"
            }
          }
        ]
      }
    }
  }},
}

class App extends Component {
  constructor(){
    super();
  }

  search_text=''
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


    let e = new UbiEvent('logon', 'user123', 'query_token');
    e.message = 'This is a test message'
    e['outer'] =  'outer test';
    
    //xx console.log(JSON.stringify(e));

    e.page_id = 'chorus_page1';
    e.session_id = '18734032'
    e.event_attributes['test'] =  'this is a test';
    e.event_attributes['test2'] =  1234;
    //xx console.log(JSON.stringify(e));

    e.event_attributes.data = new UbiData('test_data', 'not real data', {'inner':'data object'});
    //xx console.log(e.toJson());

    //writer.write(e.toJson());

    
  }

  

  render(){
  return (
    //TODO: move url and other configs to proerties file
    <ReactiveBase
      url="http://localhost:9200"
      app="ecommerce"
      credentials="elastic:ElasticRocks"
      enableAppbase={false}
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
            title="Pick your Algo"
            componentId="algopicker" 
            writer={writer}
            />
          <MultiList
            componentId="brandfilter"
            dataField="supplier"
            title="Filter by Brands"
            size={20}
            showSearch={false}
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
              let e = new UbiEvent('on_search', 'user123', 'query_id', 'Searched on: ' + value);
              writer.write_event(e);
              //writer.write(value);

              //App.handleSearch(value)
              //handleSearch(value);
              //this.search_text = value;
              //App.customQuery = new_render(value);
              //this.customQuery(value);
              // set the state
              // use the value with other js code
              //this.setCustomQuery(new_render(value))
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
                //throw Error('Search value should not contain social.');
                //this.setState({searchText:value});
                //this.state.searchText = value
                //alert(this.state)

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
            /**/ 
            customQuery={ 
              function(value) {
                var elem = document.getElementById('algopicker');
                var algo = "";
                if (elem) {
                  algo = elem.value
                } else {console.log("Unable to determine selected algorithm!");}
                if (algo in queries) {
                  //xx console.log(JSON.stringify(queries[ algo ](value)));
                  
                  return queries[ algo ](value);

                } else {
                  console.log("Could not determine algorithm");
                }
              }
             }
             /**/
          />
          <ReactiveList
            componentId="results"
            dataField="title"
            size={20}
            pagination={true}
            react={{
              and: ["searchbox", "brandfilter", "typefilter"]
            }}
            style={{ textAlign: "center" }}
            render={({ data }) => (
              <ReactiveList.ResultCardsWrapper>
                {data.map((item) => (
                  <ResultCard key={item._id}>
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
                ))}
              </ReactiveList.ResultCardsWrapper>
            )}
          />
        </div>
      </div>
    </ReactiveBase>
  );
}}
export default App;
