#!/bin/bash

DATA_DIR="./elasticsearch/data"

if [ ! -f ./solr/data/products-vectors-1.json ]; then
  echo -e "${MAJOR}Downloading the products-vectors-1.json.${RESET}"
  curl --progress-bar -o ./elasticsearch/data/products-vectors-1.json -k https://o19s-public-datasets.s3.amazonaws.com/chorus/product-vectors-2023-02-08/products-vectors-1.json
fi
if [ ! -f ./solr/data/products-vectors-2.json ]; then
  echo -e "${MAJOR}Downloading the products-vectors-2.json.${RESET}"
  curl --progress-bar -o ./elasticsearch/data/products-vectors-2.json -k https://o19s-public-datasets.s3.amazonaws.com/chorus/product-vectors-2023-02-08/products-vectors-2.json
fi
if [ ! -f ./solr/data/products-vectors-3.json ]; then
  echo -e "${MAJOR}Downloading the products-vectors-3.json.${RESET}"
  curl --progress-bar -o ./elasticsearch/data/products-vectors-3.json -k https://o19s-public-datasets.s3.amazonaws.com/chorus/product-vectors-2023-02-08/products-vectors-3.json
fi
if [ ! -f ./solr/data/products-vectors-4.json ]; then
  echo -e "${MAJOR}Downloading the products-vectors-4.json.${RESET}"
  curl --progress-bar -o ./elasticsearch/data/products-vectors-4.json -k https://o19s-public-datasets.s3.amazonaws.com/chorus/product-vectors-2023-02-08/products-vectors-4.json
fi

cd $DATA_DIR
for f in products-vectors*.json;
  do
    echo "Populating products from ${f}, please give it a few minutes!"
    curl -u 'elastic:ElasticRocks' -s -X POST "localhost:9200/ecommerce/_bulk?pretty" -H --data-binary @"$f" -H 'Content-type:application/json ';
    sleep 5
   done;
