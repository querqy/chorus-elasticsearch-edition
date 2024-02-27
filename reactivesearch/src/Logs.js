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

const event_server =  ((sessionStorage.hasOwnProperty('event_server')) ?
          sessionStorage.getItem('event_server')  
          : "http://localhost:9200");

const log_store_events =  ((sessionStorage.hasOwnProperty('log_store')) ?
          '.' + sessionStorage.getItem('log_store') + '_events'
          : '.' + 'ubi_log' + '_events');


class LogTable extends Component {
	rows=5;

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
		url={event_server}
		app={ log_store_events }
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
			}}
			
		/>
		<div style={{ height: "200px", width: "100%"}}>
			<h3>Event Log</h3>
			<ReactiveList
            componentId="logresults"
            dataField={"action_name"}
            title="Log Events"
            size={this.rows}
            pagination={true}
			showEndPage={true}
			showResultStats={true}
			infiniteScroll={true}
			//TODO: once timestamp is in the schema
			//sortBy='desc'
			sortOptions={[ {
				sortBy:'desc', 
				dataField:'timestamp', 
				label:'time desc'
			}, {
				sortBy:'desc', 
				dataField:'action_name', 
				label:'action desc'
			},{
				sortBy:'asc', 
				dataField:'timestamp', 
				label:'action asc'
			},

			]}
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
            react={{
              or: ["market-place", "searchbox", "brandfilter", "typefilter"]
            }}
            render={({ data }) => (
            <ReactiveList.ResultListWrapper >
				{/*
				<div style={{  display: "table", textAlign: "left", }}>
					<div style={{display: "table-row-group", textAlign: 'left'}}>
			*/}
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
								&nbsp;object type
							</div>
						</div>
                {data.map((item) => (

                    <ResultList key={item._id}>
                        <ResultList.Content >
						<div style={{  display: "table", textAlign: "left", }}>
									<div style={{display: "table-row", height: "15px", width:'1500px'}}>
										<div 
										  style={{
											display: "table-cell",
											flexDirection: "column",
											width: "275px",
											margin: "5px",
											marginTop: "2px"
										  }}
										>&nbsp;{item.user_id}</div>
										<div style={{
											display: "table-cell",
											flexDirection: "column",
											width: "100px",
											textAlign: "left",
											margin: "5px",
											marginTop: "2px"
										}}
										>&nbsp;{
											(item.timestamp != null ) ? new Date(item.timestamp).toLocaleString() : '<em>null</em>'
										}</div>
										<div style={{
											display: "table-cell",
											flexDirection: "column",
											width: "60px",
											textAlign: "left",
											margin: "5px",
											marginTop: "2px"
										  }}
										>&nbsp;{item.message_type}</div>
										<div style={{
											display: "table-cell",
											flexDirection: "column",
											width: "110px",
											textAlign: "left",
											margin: "3px",
											marginTop: "2px"
										  }}
										>&nbsp;{
											//(item.action_name != null )? item.action_name : '<em>null</em>'
											"aosdfjasp"
										
										}</div>
										<div style={{
											display: "table-cell",
											flexDirection: "column",
											width: "250px",
											textAlign: "left",
											margin: "3px",
											marginTop: "2px",
										  }}
										>&nbsp;{item.message}</div>
										<div style={{
											display: "table-cell",
											flexDirection: "column",
											width: "210px",
											textAlign: "left",
											margin: "3px",
											marginTop: "2px"
										  }}
										>&nbsp;{
											(item.data != null ) ? 'has related object' : 'no object'
										}</div>
									</div>
							</div>

									          
                        </ResultList.Content>
                    </ResultList>
                ))}
				{//</div>
						}
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