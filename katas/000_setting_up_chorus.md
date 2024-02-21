# Kata 000: Setting up Chorus

We use a Docker Compose based environment to manage and firing up all the components of the Chorus stack. Then you will have to load the data and configure the components.

Open up a terminal window and run:
> docker compose up --build

It will take a while to download the data and build all the Docker images!  You may think it's frozen at various points, but be patient - it'll be up and running eventually.

Now we need to load our sample product data into Chorus.  Open a second terminal window, so you can see how the various system respond, as you work with Chorus.

Grab the sample dataset of ~19k products by running this command from the root directory of the Chorus checkout:

> wget https://querqy.org/datasets/icecat/icecat-products-w_price-19k-20201127.tar.gz

First, we have to uncompress the data:

> tar xzf icecat-products-w_price-19k-20201127.tar.gz

Next, we need to format the data before we can index it into Elasticsearch. For that run the script `transform_data.sh`:

> ./transform_data.sh > transformed_data.json

This can take a while. The script takes the freshly extracted JSON data and transforms it in a way, so it can be used by the [OpenSearch's Bulk API](https://opensearch.org/docs/latest/api-reference/document-apis/bulk/).

Before we can index the data, we have to create an index with some predefined settings and a basic mapping:

> curl -s -X PUT "localhost:9200/ecommerce/" -H 'Content-Type: application/json' --data-binary @./opensearch/schema.json

With the index created and the data in a suitable format, we can go ahead and index the data into OpenSearch:

> curl -X POST "localhost:9200/ecommerce/_bulk?pretty" -H 'Content-Type: application/json' --data-binary @transformed_data.json

The sample data will take only a couple of minutes to be indexed.

You can confirm that the data is indexed by visiting http://localhost:9200/ecommerce/_search. You should see some of the indexed documents with their product attributes.

For a more convenient way to see the indexed products, visit our mock e-commerce store, Chorus Electronics, available at http://localhost:4000/. Try out the facets, and search for something, like `coffee`.

Now we want to pivot to setting up our Offline Testing Environment. Today we have Quepid integrated into this edition of Chorus.

First we need to create the database for Quepid:

> docker-compose run --rm quepid bin/rake db:setup

We also need to create an account with Administrator permissions:

> docker-compose run quepid thor user:create -a admin@choruselectronics.com "Chorus Admin" password

Visit Quepid at http://localhost:3000 and log in with the email and password you just set up.

Go through the initial case setup process. Quepid will walk you through setting up a _Movie Cases_ case via a Wizard interface, and then shows you some of the key features of Quepid's UI.  I know you want to skip the tour of the Quepid interface, however there is a lot of interactivity in the UI, so it's recommended to go through the tutorial to get acquainted! As this is the Chorus for OpenSearch project, you can choose OpenSearch as your search engine instead of Solr.

Congratulations! You now have Chorus - The OpenSearch Edition successfully running with its components!
