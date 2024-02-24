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

const log_store_events = '.ubl_log_events';


class LogTable extends Component {
	constructor(){
	  super();
	}
	state = {
	};
  
	handleSearch = value => {
	  this.setState({
		value
	  });
	};
  
	componentDidMount(){
	  console.log('logs mounted ' + this);
  
	}
  
	
  
	render(){
	return (
	  //TODO: move url and other configs to proerties file
	  <ReactiveBase
		url="http://localhost:9200"
		app={log_store_events }
		credentials="elastic:ElasticRocks"
		enableAppbase={false}
		headers={{   
		 
		}}
		transformResponse={async (response, componentId) => {

		  
		  return response;
		}}
		transformRequest={async (request) => {

		  return request;
		}}
  
			  
	  >
		<StateProvider
			onChange={(prevState, nextState) => {
			  let queryString = nextState;
			  //console.log('Page.onChange - ' + queryString.searchbox.value);
			  //this.search_text = queryString.searchbox.value;
			}}
			
		/>
		<div style={{ height: "200px", width: "100%"}}>
			<h3>Event Log</h3>
			<ReactiveList
            componentId="logresults"
            dataField={"action_name"}
            title="Log Events"
			showEndPage={true}
			showResultStats={true}
			infiniteScroll={true}
			//TODO: once timestamp is in the schema
				//sortBy
				//sortOptions { sortyBy, dataField, label}
            size={6}
            showSearch={false}
			onChangeonData={  
				function(data) {
					console.warn('on log change');
				}
			  }
            onQueryChange={  
              function(prevQuery, nextQuery) {
                if(nextQuery != prevQuery){
                  console.log('log events fire');
                
                }
              }
            }
            style={{ "paddingBottom": "10px", "paddingTop": "10px", "height":"50px" }}
            pagination={true}
            react={{
              or: ["market-place", "searchbox", "brandfilter", "typefilter"]
            }}
            render={({ data }) => (
            <ReactiveList.ResultListWrapper>
                {data.map((item) => (
                    <ResultList key={item._id}>
                        <ResultList.Content>

							<div style={{  
								display: "table", 
								textAlign: "left",
								width: "500px",
								}}>
								<div style={{display: "table-row-group"}}>
									<div style={{display: "table-row", height: "15px"}}>
										<div 
										  style={{
											display: "table-cell",
											flexDirection: "column",
											width: "290px",
											margin: "5px",
											marginTop: "3px"
										  }}
										>&nbsp;{item.user_id}</div>
										<div style={{
											display: "table-cell",
											flexDirection: "column",
											textAlign: "left",
											margin: "3px",
											marginTop: "3px"
										  }}
										>&nbsp;{item.message_type}</div>
										<div style={{
											display: "table-cell",
											flexDirection: "column",
											textAlign: "left",
											margin: "3px",
											marginTop: "3px"
										  }}
										>&nbsp;{item.action_name}</div>
									</div>
								</div>
							</div>
                    
                        </ResultList.Content>
                    </ResultList>
                ))}
              </ReactiveList.ResultListWrapper>
            )}
			renderError={(error) => (
				<div>
					Something went wrong loading the logs!<br/>Error details<br/>{error}
				</div>
			)}
            onNoResults={
              function(results) {
                console.warn('no log results');
              }
            }
            onData={
              function(results) {
                console.log('log results => ' + results);
              }
            }
          />
      
      </div>
    </ReactiveBase>
  );
}}
export default LogTable;