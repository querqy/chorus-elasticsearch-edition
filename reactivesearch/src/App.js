import React, {Component} from "react";
import {
  ReactiveBase,
  DataSearch,
  MultiList,
  ReactiveList,
  SingleRange,
  ResultCard,
  SingleList
} from "@appbaseio/reactivesearch";
import AlgoPicker from './custom/AlgoPicker';

class App extends Component {

  render(){
  return (
    <ReactiveBase
      url="http://localhost:9200"
      app="ecommerce"
      credentials="elastic:ElasticRocks"
      enableAppbase={false}
    >
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
            componentId="algopicker" />
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
            style={{
              marginTop: "35px"
            }}
            componentId="searchbox"
            placeholder="Search for products, brands or EAN"
            autosuggest={false}
            dataField={["id", "name", "title", "product_type" , "short_description", "ean", "search_attributes"]}
            customQuery={
              function(value) {
                var elem = document.getElementById('algopicker');
                var algo = "";
                if (elem) {
                  algo = elem.value
                } else {console.log("Unable to determine selected algorithm!");}
                if (algo === "default") {
                  return {
                    query: {
                      multi_match: {
                        query: value,
                        fields: [ "id", "name", "title", "product_type" , "short_description", "ean", "search_attributes"]
                      }
                    }
                  }
                } else if (algo === "querqy_preview") {
                  return {
                    query: {
                      querqy: {
                        matching_query: {
                          query: value
                        },
                        query_fields: [ "id", "name", "title", "product_type" , "short_description", "ean", "search_attributes"],
                        rewriters: ["common_rules_prelive", "replace_prelive"]
                      }
                    }
                  }
                } else if (algo === "querqy_live") {
                  return {
                    query: {
                      querqy: {
                        matching_query: {
                          query: value
                        },
                        query_fields: [ "id", "name", "title", "product_type" , "short_description", "ean", "search_attributes"],
                        rewriters: ["common_rules", "replace"]
                      }
                    }
                  }
                } else { console.log("Could not determine algorithm"); }
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
