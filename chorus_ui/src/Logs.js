import React, {Component, useEffect, useState} from "react";
import { render } from 'react-dom';
import { ReactiveBase, ReactiveList, StateProvider, ResultList, ReactiveComponent} from "@appbaseio/reactivesearch";


const logging_credentials="*:*"
const event_server =  ((sessionStorage.hasOwnProperty('event_server')) ?
          sessionStorage.getItem('event_server')  
          : "http://localhost:9200");

const log_store_events =  ((sessionStorage.hasOwnProperty('log_store')) ?
			//convert the log_store into just the event log store
          '.' + sessionStorage.getItem('log_store') + '_events'
          : '.' + 'log' + '_events');


//TODO: auto refresh.
//the following will refresh the entire page
//xx <meta http-equiv="refresh" content="30" />
//<meta httpEquiv="refresh" content="30" />
setInterval(function(){
	
	//TODO: sort custom query by changing timestamp
	window.logs.timestamp = Date.now();
	console.log('intervale');
  }, 30000);


//https://github.com/appbaseio/reactivesearch/discussions/2025


class LogTable extends Component {
	rows=5;
	
	constructor(){
	  super();
	}
	state = {
	};

	
	componentDidMount(){
	  console.log('logs mounted ' + this);
	}

	forceUpdate(){
		console.log('force update');
	}

	componentDidUpdate(){
		console.log('logs update');
	}
	 
	render(){
	return (
	  <ReactiveBase
        componentId="eventlogs"
		url={event_server}
		app={ log_store_events }
		credentials={logging_credentials}
		enableAppbase={false}
		initialQueriesSyncTime={100}
		
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
			  console.log('logs onChange()')
			}}
			
		/>
		<div style={{ height: "275px", width: "100%"}}>
		  <h3>Event Log</h3>
		  <ReactiveList
            componentId="logresults"
            dataField={"timestamp"}
            title="Log Events"
            size={this.rows}
            pagination={true}
			showEndPage={true}
			showResultStats={true}
			infiniteScroll={true}
			sortOptions={[ 
			{
				sortBy:'desc', 
				dataField:'timestamp', 
				label:'time desc'
			},
			{
				sortBy:'desc', 
				dataField:'_id', 
				label:'ID'
			},{
				sortBy:'desc', 
				dataField:'message_type', 
				label:'message type'
			}, {
				sortBy:'desc', 
				dataField:'action_name', 
				label:'action desc'
			},{
				sortBy:'asc', 
				dataField:'action_name', 
				label:'action asc'
			},

			]}
            showSearch={true}
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
            react={{
              or: ["market-place", "logs", "logresults", "searchbox", "brandfilter", "typefilter"]
            }}
            render={({ data }) => (
            <ReactiveList.ResultListWrapper >
						<div style={{display: "table-row", height: "15px", textAlign:'center', margin:'5px', fontWeight: '800'}}>
							<div style={{ display: "table-cell", width: "270px", }}>
								&nbsp;user_id
							</div>
							<div style={{ display: "table-cell", width: "100px", }}>
								&nbsp;timestamp
							</div>
							<div style={{ display: "table-cell", width: "60px", }}>
								&nbsp;type
							</div>
							<div style={{ display: "table-cell", width: "110px", }}>
								&nbsp;action
							</div>
							<div style={{ display: "table-cell", width: "250px", }}>
								&nbsp;log message
							</div>
							<div style={{ display: "table-cell", width: "210px", }}>
								&nbsp;object id
							</div>
						</div>
                {data.map((item) => (
                    <ResultList key={item._id}>
                        <ResultList.Content>
						<div style={{  display: "table", textAlign: "left", }}>
									<div style={{display: "table-row", height: "15px", width:'1500px'}}>
										<div 
										  style={{
											display: "table-cell", flexDirection: "column",
											width: "275px", margin: "5px", marginTop: "2px"
										  }}
										>&nbsp;{item.user_id}</div>
										<div style={{
											display: "table-cell", flexDirection: "column",
											textAlign: "left",
											width: "100px", margin: "5px", marginTop: "2px"
										}}
										>&nbsp;{
											(item.timestamp != null ) ? new Date(item.timestamp).toLocaleString() : 'null'
										}</div>
										<div style={{
											display: "table-cell", flexDirection: "column",
											textAlign: "left",
											width: "60px", margin: "5px", marginTop: "2px"
										  }}
										>&nbsp;{item.message_type}</div>
										<div style={{
											display: "table-cell", flexDirection: "column",
											textAlign: "left",
											width: "110px", margin: "3px", marginTop: "2px"
										  }}
										>&nbsp;{
											(item.action_name != null )? item.action_name : 'null'
										}</div>
										<div style={{
											display: "table-cell", flexDirection: "column",
											textAlign: "left",
											width: "250px", margin: "3px", marginTop: "2px",
										  }}
										>&nbsp;{
											(item.message != null )? item.message.substring(0, 25) + '...': 'null'
										}</div>
										<div style={{
											display: "table-cell", flexDirection: "column",
											textAlign: "left",
											width: "310px", margin: "3px", marginTop: "2px"
										  }}
										>&nbsp;{
											(item.event_attributes != null && item.event_attributes.data != null ) 
												? item.event_attributes.data.data_type + ': ' +  item.event_attributes.data.data_id
												: 'no object'
										}</div>
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
			onError={  
				function(error) {
                console.warn('Log table error. The log prolly needs to be initialized ' + JSON.stringify(error));
				return 'pap';
              }
			}
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
