[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)


<img src="assets/chorus-logo.png" alt="Chorus Logo" title="Chorus: Towards a open stack for ecommerce search" width="200" align="right"/>

Chorus
==========================

*Towards an open source tool stack for e-commerce search*

Chorus makes deploying powerful ecommerce search easier by shifting the **buy vs build** decision in favour of **build**, so you can own your search! It deals with three issues:

1. **Starting from Scratch is Time Consuming** Downloading an open source search engine isn't enough, it's like getting the parts of a Lego model, only without the directions ;-) .  We need a better baseline to quickly get started.

2. **Integration of Tooling is Hard** Search isn't just the index, it's also the analytics tooling, the relevance tooling, the operational monitoring that goes into it.  Every team starts incurs the penalty of starting from scratch integrating the ecosystem of options.

3. ***Sharing Knowledge is a Must!*** It isn't enough to just have conference talks, we need sample code and sample data in order to share knowledge about improving ecommerce search. Chorus is that public environment that you can use to share your next great idea!

This is the project covering Elasticsearch as the search engine. As of now (March 2022), this project is under development. For those interested in the whole stack: You can visit the [Solr version of Chorus](https://github.com/querqy/chorus)

Want to stay up-to-date with the community? Visit https://querqy.org/ to learn more, and join the [E-Commerce Search Slack](https://ecom-search.slack.com/) group for tips, tricks and news on what's new in the Chorus ecosystem.

## News

* 17th June 2021: [Encores? - Going beyond matching and ranking of search results](https://www.slideshare.net/o19s/encores) - Chorus is used at BerlinBuzzwords.
* 15th November 2020: [Chorus Workshop Series Announced](https://plainschwarz.com/ps-salon/) - Learn from the creators of the components of Chorus via six workshops.
* 17th October 2020: [Chorus featured at ApacheCon @Home](https://www.youtube.com/watch?v=NGtmSbOoFjA) - René and Eric give a talk at ApacheCon on Chorus.
* 10th June 2020: [Chorus Announced at BerlinBuzzwords](https://2020.berlinbuzzwords.de/session/towards-open-source-tool-stack-e-commerce-search) - First release of Chorus shared with the world at a workshop.
* April 2020: [Paul Maria Bartusch](https://twitter.com/paulbartusch), [René Kriegler](https://twitter.com/renekrie), [Johannes Peter](https://github.com/JohannesDaniel) & [Eric Pugh](https://twitter.com/dep4b) brainstorm challenges with search teams adopting technologies like Querqy and come up with the Chorus idea.

# What Runs Where

* The UI (Reactivesearch) runs at http://localhost:4001 
* Elasticsearch runs at http://localhost:9200
* Kibana runs at http://localhost:5601
* SMUI runs at http://localhost:9000
* Quepid runs at http://localhost:3000
* Prometheus runs at http://localhost:9090
* Grafana runs at http://localhost:9091

Working with macOS? Pop open all the tuning related web pages with one terminal command:
> open http://localhost:4001 http://localhost:9200 http://localhost:5601 http://localhost:9000 http://localhost:3000 http://localhost:7979

# 5 Minutes to Run Chorus!

We are trying to strike a balance between making the setup process as easy and fool proof as possible with the need to not _hide_ too much of the interactions between the projects that make up Chorus.

If you are impatient, we have a quick start script, `./quickstart.sh` that sets you up, however I recommend you go through [Kata 0: Setting up Chorus](katas/000_setting_up_chorus.md).

# Useful Commands for Chorus

To start your environment, but still run each command to setup the integrations manually, run:

```
docker-compose up --build -d
```

The quickstart command will launch Elasticsearch, and index the product data for the _ecommerce_ index:

```
./quickstart.sh
```

If you want to add in the offline lab environment based on Quepid, then tack on the `--with-offline-lab` parameter:

```
./quickstart.sh --with-offline-lab
```

To include the observability features, run:

```
./quickstart.sh --with-observability
```

To see what is happening in the Chorus stack you can tail the logs for all the components via:
```
docker-compose logs -tf
```

If you want to narrow down to just one component of the Chorus stack do:
```
docker-compose ps                       # list out the names of the components
docker-compose logs -tf elasticsearch   # tail elasticsearch only
```

To stop the containers you can run

```
./quickstart.sh --stop
```

To destroy your environment (including any volumes created like the mysql db), just run:
```
docker-compose down -v
```

or

```
./quickstart.sh --shutdown
```

If Docker is giving you a hard time then some options are:
```
docker system prune                     # removes orphaned images, networks, etc.
docker system prune -a --volumes        # removes all images, clears out your Docker diskspace if you full.
```

You may also have to [increase the resources](./assets/increase_docker_resources.gif) given to Docker, up to 4 GB RAM and 2 GB Swap space.

# Chorus Data Details

The Chorus project includes some public datasets. These datasets let the community learn, experiment, and collaborate in a safe manner and are a key part of demonstrating how to build measurable and tunable ecommerce search with open source components.

The product data is gratefully sourced from [Icecat](https://icecat.biz/) and is licensed under their [Open Content License](https://iceclog.com/open-content-license-opl/).

The version of the Icecat product data that Chorus [provides](https://querqy.org/datasets/icecat/icecat-products-w_price-19k-20201127.tar.gz) has the following changes:
* Data converted to JSON format.
* Products that don't have a 500x500 pixel image listed are removed.
* Prices extracted for ~19,000 products from the https://www.upcitemdb.com/ service using EAN codes to match.

# Known Issues

1. Keycloak apparently does not run on Apple M1 chips with the pre-built images. If the Keycloak authentication for Quepid is not used this issue will not be experienced. For a workaround please follow these instructions: https://github.com/docker/for-mac/issues/5310#issuecomment-877653653They 
They have been successfully tested with Keycloak 16.1.1.
2. SMUI is a search management UI designed to work with Solr. We provided scripts for basic functionality with Elasticsearch but there are limitations. A future Kata will outline what's possible and what's not. 

Of course, contributions are welcome to improve Chorus - The Elasticsearch Edition! 