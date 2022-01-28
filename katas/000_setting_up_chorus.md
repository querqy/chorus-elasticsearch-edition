# Kata 000: Setting up Chorus

We use a Docker Compose based environment to manage firing up all the components of the Chorus stack, but then have you go through loading the data and configuring the components.

Open up a terminal window and run:
> docker-compose up --build

Wait a while, because you'll be downloading and building quite a few images!  You may think it's frozen at various points, but go for a walk and come back and it'll be up and running.

Now we need to load our product data into Chorus.  Open a second terminal window, so you can see how as you work with Chorus how the various system respond.

ToDo: Security?

Grab a sample dataset of 19k products by running from the root of your Chorus checkout:

> wget https://querqy.org/datasets/icecat/icecat-products-w_price-19k-20201127.tar.gz

First, we uncompress the data:

> tar xzf icecat-products-w_price-19k-20201127.tar.gz

Next, we need to format the data before we can index it into Elasticsearch. For that run the script `transform_data.sh`:

> ./transform_data.sh > transformed_data.json

This can take a while. The script takes the freshly extracted JSON data and transforms it in a way to be used by [Elasticsearch's Bulk API](https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html).

Let's create an index with some predefined settings and a basic mapping: 

> curl -s -X PUT "localhost:9200/ecommerce/" -H 'Content-Type: application/json' --data-binary @./elasticsearch/schema.json

With the crated index and the data in a suitable format we can go ahead and index the data:

> curl -X POST "localhost:9200/ecommerce/_bulk?pretty" -H 'Content-Type: application/json' --data-binary @transformed_data.json

The sample data will take only a couple of minutes to load.

You can confirm that the data is loaded by visiting http://localhost:9200/ecommerce/_search. You should see some of the indexed products with their attributes.

ToDo: Integrate SMUI part when SMUI is ready.

Now we want to pivot to setting up our Offline Testing Environment.  Today we have two open source projects integrated into Chorus: Quepid and Rated Ranking Evaluator (RRE).

We'll start with Quepid and then move on to RRE.

First we need to create the database for Quepid:

> docker-compose run --rm quepid bin/rake db:setup

We also need to create you an account with Administrator permissions:

> docker-compose run quepid thor user:create -a admin@choruselectronics.com "Chorus Admin" password

Visit Quepid at http://localhost:3000 and log in with the email and password you just set up.

Go through the initial case setup process.  Quepid will walk you through setting up a _Movie Cases_ case via a Wizard interface, and then show you some of the key features of Quepid's UI.  I know you want to skip the tour of Quepid interface, however there is a lot of interactivity in the UI, so it's worth going through the tutorial to get acquainted! As this is the Chorus for Elasticsearch project, you can choose Elasticsearch as your search engine instead of Solr.

ToDo: Do we want to integrate RRE?

Last but not least we want to set up what we need to monitor our end user facing applications. We use Prometheus and Grafana for this task. Prometheus is already collecting and storing data. For Grafana we need to set up a user and grant this user administrative rights in Grafana:

```
curl -u admin:password -S -X POST -H "Content-Type: application/json" -d '{"email":"admin@choruselectronics.com", "name":"Chorus Admin", "role":"admin", "login":"admin@choruselectronics.com", "password":"password", "theme":"light"}' http://localhost:9091/api/admin/users
curl -u admin:password -S -X PUT -H "Content-Type: application/json" -d '{"isGrafanaAdmin": true}' http://localhost:9091/api/admin/users/2/permissions
curl -u admin:password -S -X POST -H "Content-Type: application/json" http://localhost:9091/api/users/2/using/1
```

Check if Grafana is up and running and the freshly created user has access by logging into Grafana at http://localhost:9091 using the username `admin@choruselectronics.com` with the password `password`. We'll dive into the details of observability in a later Kata.

Congratulations! You now have Chorus successfully running with its components!
