# First Kata: Lets Optimize a Query

In this first Kata, we're going to take two queries that we know are bad, and see if we can improve them using Active Search Management. How do we know that the queries `notebook` and `laptop` are bad?  Easy, just take a look at them in our `Chorus Electronics` store ;-).

Visit the web store at http://localhost:4000/ and make sure the dropdown has `Default` next to the search bar selected. Now do a search for `notebook`, and notice that while the products are all vaguely related to notebooks, none of them are actual notebook computers. We believe that our users, when they type in `notebook`, are looking for notebook computers, or possibly a paper notebook (which we don't carry as we are an electronics store), not accessories to notebooks.

Let's see if `laptop` is any better. Nope, similarly bad results.

So what can we do? Well, first off, just by looking at the search results, we have an intuitive understanding of the problem, but we don't have a good way of measuring the problem. How bad are our search results for these two queries? Ideally we would have a numerical (quantitative) value to measure the problem.

Enter Quepid. Quepid provides two capabilities. The first is an ability to easily assess the quality of search results through a web interface. This is perfect for working with a Business Owner or other non-technical stakeholders to talk about why search is bad, and gather input on the results to start defining what good search results are for our queries.

The second capability is a safe playground for playing with relevancy tuning parameters, though we won't be focusing on that in this Kata.

Open up Quepid at http://localhost:3000. Go ahead and sign up through the OpenID link.

Since you have already gone through the `Movie Demo` setup, we'll need to set up a new case!

Go ahead and start a new case by clicking `Relevancy Cases` dropdown and choosing `Create a Case`.

Let's call the case `Notebook Computers`. Then, select Elasticsearch as your search engine, and we'll go ahead and use our Chorus Electronics index using this URL:

`http://localhost:9200/ecommerce/_search`

Click the `ping it` link to confirm we can access the ecommerce index.

Hint: If pinging Elasticsearch does not work please try defining the URL with credentials: `http://elastic:ElasticRocks@localhost:9200/ecommerce/_search`  

On the `How Should We Display Your Results?` screen we can customize what information we want to show our Business Owner:

* Title Field: `title`
* ID Field: `_id`
* Additional Display Fields: `thumb:img_500x500, name, brand, product_type`

Be careful and change the default ID field to use the field `id`. Otherwise, the ratings we are importing later will not work properly.

We want to show our merchandizers enough information about our products, so they can understand the context of our search, but not so much they are overwhelmed!

On the next screen lets go ahead and add our problem queries `notebook` and `laptop`.

Complete the wizard, and now you are on the main Quepid screen.

Alert! Sometimes in Quepid when you complete the add case wizard there is an odd race condition and the `Updating Queries` message stays on the screen instead of going way. Just reload the page ;-).

Now, I like to have two browser windows side by side, the `Chorus Electronics` store open on the left, and Quepid on the right. We want to see the same products listed in both. To make that happen, we need to adjust the query that is sent by Quepid. Open the Query Sandbox by hitting `Tune Relevance`. Now enter the following query:

```
{
  "query": {
    "multi_match": {
      "query": "#$query##",
      "fields": [
        "id",
        "name",
        "title",
        "product_type",
        "short_description",
        "ean",
        "search_attributes"
      ]
    }
  }
}
```

Hit `Rerun My Searches!`

(Unfortunately, we're missing a couple of product images. But we'll not let that distract us from our important merchandizing work!)

Since we are going to pretend we have a Merchandizer rating our individual results, we want to use a sophisticated grading scale right from the start. In Quepid, click `Select Scorer` and choose the nDCG@10 one from the list.

nDCG is a commonly used scorer that attempts to measure how good your results are against an ideal set of results, and it penalizes bad search results that show up at the top of the list more than bad results that show up at the end of the list.

Our scorer is a graded scorer, from 0 to 3, from 0 being irrelevant, i.e. the result "makes the user mad to see the result", to 3, an absolutely unequivocally perfect result.

Most ratings end up in the 1 for poor or irrelevant and 3 for good or relevant rating.

Our nDCG@10 scorer is set up to only look at the first ten results on the page, so think about if you are doing mobile optimization and your users only have a small amount of screen real estate. We could do of course do @20 or @40 if we wanted to measure more deeply.

We'll go more deeply into scorers in another Kata. To save some time, we've already done some rating for you.

In Quepid, click `Import` from the toolbar, and you'll be in the import modal.

Pick the ratings file that we already created for you from `./katas/Chorus_Electronics_basic.csv`. You'll see a preview of the CSV file. Click `Import` and Quepid will load up these ratings and rerun your queries.

So here is the good news/bad news. Yes our search results are terrible, with an overall score very close to 0 (on a normalized scale of 0 to 1). However now we have a numerical value of our search results, and can now think about fixing them!

So now let's think about how we might actually improve them! There are a lot of ways we could skin this cat, however for ecommerce use cases, one really powerful option is the Querqy query rewriting library for Elasticsearch and Solr. We won't go into the technical details of how Querqy works with Elasticsearch in this Kata.

To make it easier for the Search Product Manager to do `Searchandizing`, we will use the Search Management UI, or SMUI. Open up http://localhost:9000, and you will be in the management screen for the `Chorus Webshop`.

Arrange your screens so the `Chorus Electonics` store and SMUI are both visible.

![Layout out your webstore and tuning tools side by side](images/001_screens_side_by_side.png)

Because we are working with the Querqy library, in the `Chorus Electronics` store, make sure to change from `Default` in the dropdown next to the search bar to `Querqy Live`. Do a search for `notebook`, and while the initial product images may look good to you, remember, they aren't images of notebooks, they are notebook *accessories* that we are getting back! While we are at it, let's also check `laptop` as well.

Let's switch to SMUI our search management UI at http://localhost:9000 and start working on the query `notebook` by typing it in the empty text box on the left and click `+ New`. Confirm that by selecting `Rule Management`. As a result, you get an empty rules set.

Let's start with boosting notebooks to the top when searching for `notebook`. Add a new search rule and pick `UP/DOWN Rule`. We'll pick a boost of `UP(++++)`, a pretty heavy boost. Now we are encountering one of SMUI's current limitations. It is designed and implemented to work with Solr, and we have Elasticsearch running under the hood, so not everything possible with Solr is also possible with Elasticsearch. To add a boost rule we need to use a specific syntax to let the magic work. We can use a `field:value` notation to use the domain specific knowledge we as proper searchandizers have. 

Enter the following rule text in the empty box next to `UP(++++)`:
```
product_type:notebook
```
This means that we want to boost all documents containing the *term* `notebook` in the field `product_type`. As a result, this will boost products tagged with the notebook category up in the search results.

Go ahead and click `Save search rules for input`. Let us now push our change to Elasticsearch by clicking the `Push Config to Solr` and then, after seeing a success message, click on `Publish to LIVE`.

Go ahead and do a new query in the store, notice the improvements in the quality for `notebook`? In short, the results look very good! Not a single non-notebook computer on the first page.

Now that we have a qualitative sense that we've improved our results using Querqy, let's go ahead and see if we can make this a quantifiable measure of improvement. Let's see if we can give a number to our stakeholder on improving these `notebook` related queries.

We'll flip back to Quepid to do this.

We need to tell Quepid that we've done some improvement using the *Querqy Live* algorithm under the hood. For this, we need our `Tune Relevance` pane again. Click the `Tune Relevance` link and you will be in the `Query Sandbox`. Modify the query to match the following:

```
{
  "query": {
    "querqy": {
      "matching_query": {
        "query": "#$query##"
      },
      "query_fields": [
        "id",
        "name",
        "title",
        "product_type",
        "short_description",
        "ean",
        "search_attributes"
      ],
      "rewriters": [
        "common_rules",
        "replace"
      ]
    }
  }
}
```

Then click the `Rerun My Searches!` button.

Notice that our results have now turned to a lighter shade of red for the query `notebook`? Our nDCG score has improved from our dismal measurement of 0 to an improved 0.36! If you open the query and inspect the ratings, you notice that there are a couple of results not rated. That's the reason for our nDCG score not being perfect. Go ahead and score those documents for `notebook` that don't have a rating yet.

There is a lot to unpack in here that is beyond the scope of this kata. However, bear with me.

So now we feel like these are good results for this one query. But we've just tuned this `notebook` example. Let's dive into one more query that is somehow related to the query `notebook`. You already ran a query for `laptop` at the beginning of this Kata and realized that the results need some improvement.

Quepid tells us that the results for laptop are at 0.09 - definitely looking for an improvement. Now, switch to the search management UI and select the rule for `notebook`. In our Chorus Electronics Store we have a lot of laptops, but they are all called notebook. In a case like this we can add a synonym. To do so, we extend our existing `notebook` rule and click on `Add new search rule for input`. Select `Synonym Rule` and leave it `= (undirected)`. Now enter `laptop` as the synonym term. Searching for `laptop` and `notebook` will result in the same set of hits after this.

Save this, and publish it to live to see the results in our web shop. Go to http://localhost:4000, make sure the algorithm in the dropdown menu is set to `Querqy Live` and search for `laptop`: It worked! Now go ahead and judge the results for `laptop` in Quepid and see how the metric improves. You can go ahead and rate the results in Quepid that don't have a rating yet.

That's all folks! You've successfully taken two bad queries from the store, assessed them to put a numerical value on the quality of the search, and then improved them using some rules to rewrite the query. You then remeasured them, saw the quantitative improvement, and have meaningfully improved search quality, which drives more revenue!
