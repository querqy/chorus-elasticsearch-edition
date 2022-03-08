### Frontend for Chorus based on Reactivesearch

The frontend was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

Step-by-step guide available at [ReactiveSearch Quickstart Doc](https://docs.appbase.io/docs/reactivesearch/v3/overview/quickstart/).

### Configure

The ReactiveSearch components code resides in `src/App.js` file.   
1. The following standard components from ReactiveSearch are used:
 - **ReactiveBase** - ReactiveBase is the provider component that connects the UI with the backend app (Elasticsearch). 
 - **DataSearch** - DataSearch component provides a search box UI.
 - **ResultCard** - ResultCard component is used for displaying the **hits** as a card layout.
 - **MultiList** - MultiList component is used to display facets and filter on these.

2. In `src/custom` a custom component was developed to choose the relevance algorithm in the frontend: AlgoPicker
 - Basically, it only is a dropdown with three fixed entries.
 - Styles for this component are located in `src/styles`.


