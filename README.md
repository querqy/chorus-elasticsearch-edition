[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)


<img src="assets/chorus-logo.png" alt="Chorus Logo" title="Chorus: Towards an open stack for ecommerce search" width="200" align="right"/>

Chorus
==========================

*Towards an open source tool stack for e-commerce search*

Chorus makes deploying powerful ecommerce search easier by shifting the **buy vs build** decision in favour of **build**, so you can own your search! Chorus deals with three issues:

1. **Starting from Scratch is Time Consuming** Downloading an open source search engine isn't enough. It's like being provided with all the parts of a Lego model, but without building instructions ;-) .  We need a better baseline to quickly get started.

2. **Integration of Tooling is Hard** Search isn't just a query running on an index of data. It's also the operational monitoring, the analytics and relevance tooling, that goes into it.  Every team that starts, faces the penalties of starting from scratch, integrating an ecosystem of options.

3. ***Sharing Knowledge is a Must!*** It isn't enough to just have conference talks. We need code and data samples in order to share knowledge about improving ecommerce search. Chorus is a public environment that you can use to profit from the community and also to share your next great idea!

This is the project that enables Chorus to use Elasticsearch as the search engine. For those interested in the Solr version of this stack: You can visit the [Solr version of Chorus](https://github.com/querqy/chorus)

Want to stay up-to-date with the community? Visit https://querqy.org/ to learn more, and join the [E-Commerce Search Slack](https://ecom-search.slack.com/) group for tips, tricks, help and news on what's new in the Chorus ecosystem.

## News

* 23 February 2023: [Revolutionizing E-commere Search with Vectors](https://opensourceconnections.com/blog/2023/03/15/revolutionizing-e-commerce-search-with-vectors/) - Vector search is added to Chorus.
* 23 March 2022: [Chorus, now also for Elasticsearch!](https://opensourceconnections.com/blog/2022/03/23/chorus-now-also-for-elasticsearch/) - Chorus is now available for Elasticsearch.
* 17th June 2021: [Encores? - Going beyond matching and ranking of search results](https://www.slideshare.net/o19s/encores) - Chorus is used at BerlinBuzzwords.
* 15th November 2020: [Chorus Workshop Series Announced](https://plainschwarz.com/ps-salon/) - Learn from the creators of the components of Chorus via six workshops.
* 17th October 2020: [Chorus featured at ApacheCon @Home](https://www.youtube.com/watch?v=NGtmSbOoFjA) - René and Eric give a talk at ApacheCon on Chorus.
* 10th June 2020: [Chorus Announced at BerlinBuzzwords](https://2020.berlinbuzzwords.de/session/towards-open-source-tool-stack-e-commerce-search) - First release of Chorus shared with the world at a workshop.
* April 2020: [Paul Maria Bartusch](https://twitter.com/paulbartusch), [René Kriegler](https://twitter.com/renekrie), [Johannes Peter](https://github.com/JohannesDaniel) & [Eric Pugh](https://twitter.com/dep4b) brainstorm challenges with search teams adopting technologies like Querqy and come up with the Chorus idea.

# What Runs Where

* The UI (Reactivesearch) runs at http://localhost:4000  |  http://chorus-es-edition.dev.o19s.com:4000
* Elasticsearch runs at http://localhost:9200  |  http://chorus-es-edition.dev.o19s.com:9200
* Kibana runs at http://localhost:5601  |  http://chorus-es-edition.dev.o19s.com:5601
* SMUI runs at http://localhost:9000  |  http://chorus-es-edition.dev.o19s.com:9000
* Quepid runs at http://localhost:3000  |  http://chorus-es-edition.dev.o19s.com:3000
* The embedding service runs at http://localhost:8000 |  http://chorus-es-edition.dev.o19s.com:8000
* Keycloak runs at http://keycloak:9080 |  http://chorus-es-edition.dev.o19s.com:9080
* Prometheus runs at http://localhost:9090  |  http://chorus-es-edition.dev.o19s.com:9090
* Grafana runs at http://localhost:9091  |  http://chorus-es-edition.dev.o19s.com:9091

Working with macOS? Pop open all the tuning related web pages with one terminal command:
> open http://localhost:4000 http://localhost:9200 http://localhost:5601 http://localhost:9000 http://localhost:3000

# 5 Minutes to Run Chorus!

We are trying to strike a balance between making the setup process as easy and fool proof as possible, with the need to not _hide_ too much of the interactions between the projects that make up Chorus.

If you are impatient, we provide a quick start script, `./quickstart.sh` that sets Chorus up for you. However, I recommend you go through [Kata 0: Setting up Chorus](katas/000_setting_up_chorus.md), to get a picture of what's running in the stack.

After setting up Chorus you can check out [Kata 1: Lets Optimize a Query](katas/001_optimize_a_query.md) for an introduction to the world of active search management.

[More Katas can be found in the Solr version of Chorus](https://github.com/querqy/chorus#structured-learning-using-chorus) and many can be transferred to this Elasticsearch based stack. Some are also covered in a video series called [Meet Pete](https://opensourceconnections.com/blog/2020/07/07/meet-pete-the-e-commerce-search-product-manager/). Feel free to open PRs to add Katas you find useful or open issues if you want to see specific Katas included. Every contribution is welcome! 

# Useful Commands for Chorus

To start your environment, but still run each command to set up the integrations manually, run:

```
docker-compose up --build -d
```

The quickstart script will launch Elasticsearch, download and index the sample product data for the _ecommerce_ index:

```
./quickstart.sh
```

If you want to add in the offline lab environment based on Quepid, then tack on the `--with-offline-lab` parameter:

```
./quickstart.sh --with-offline-lab
```

Try out vector search with Chorus by using the `--with-vector-search` parameter

```
./quickstart.sh --with-vector-search
```

To include the observability features (Grafana, Prometheus, and Elasticsearch Exporter), run:

```
./quickstart.sh --with-observability
```

To see what is happening in the Chorus stack you can tail the logs for all the components via:

```
docker-compose logs -tf
```

If you want to see the logs of just one component of the Chorus stack, use:

```
docker-compose ps                       # list out the names of the components
docker-compose logs -tf elasticsearch   # tail elasticsearch only
```

To stop all containers, you can run:

```
./quickstart.sh --stop
```

To destroy your environment (including any volumes created, like the mysql DBs), just run:

```
docker-compose down -v
```

or:

```
./quickstart.sh --shutdown
```

If Docker is giving you a hard time, then some options are:

```
docker system prune                     # removes orphaned images, networks, etc.
docker system prune -a --volumes        # removes all images, clears out your Docker diskspace if you full.
```

You may also have to [increase the resources](./assets/increase_docker_resources.gif) given to Docker - up to 4 GB RAM and 2 GB Swap space.

# Chorus Data Details

The Chorus project includes some public, sample datasets. These datasets enable the community to learn, experiment and collaborate in a safe manner and are a key part of demonstrating, how to build measurable and tunable ecommerce search, with open source components.

The sample product data is generously sourced from [Icecat](https://icecat.biz/) and is licensed under their [Open Content License](https://iceclog.com/open-content-license-opl/).

The version of the Icecat product data that Chorus [provides](https://querqy.org/datasets/icecat/icecat-products-w_price-19k-20201127.tar.gz) has the following changes:
* Data converted to JSON format.
* Products that don't have a 500x500 pixel image listed are removed.
* The Prices of ~19,000 products got extracted from the https://www.upcitemdb.com/ service, using EAN codes.

# Known Issues

1. SMUI stands for \'search management UI\'. It is designed to work with Solr. We provided some scripts for basic functionality with Elasticsearch but there are still limitations. You get a feeling what's currently possible by going through [Kata 1: Optimize a Query](katas/001_optimize_a_query.md).
2. RRE: The technical integration is able to run queries and get the correct results from Elasticsearch, but apparently it computes the search metrics incorrectly.

Of course, contributions are very welcome to improve Chorus - The Elasticsearch Edition!
