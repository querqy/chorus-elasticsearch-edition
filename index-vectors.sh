#!/bin/bash

set -eo pipefail

# The directory where we locally buffer data files before uploading to Elasticsearch
DATA_DIR="./elasticsearch/data"

#if [ ! -f ./elasticsearch/data/products-vectors-1.json ]; then
#  echo -e "${MAJOR}Downloading the products-vectors-1.json.${RESET}"
#  curl --progress-bar -o ./elasticsearch/data/products-vectors-1.json -k https://o19s-public-datasets.s3.amazonaws.com/chorus/product-vectors-2023-03-23/products-vectors-1.json
#fi
#if [ ! -f ./elasticsearch/data/products-vectors-2.json ]; then
#  echo -e "${MAJOR}Downloading the products-vectors-2.json.${RESET}"
#  curl --progress-bar -o ./elasticsearch/data/products-vectors-2.json -k https://o19s-public-datasets.s3.amazonaws.com/chorus/product-vectors-2023-03-23/products-vectors-2.json
#fi
#if [ ! -f ./elasticsearch/data/products-vectors-3.json ]; then
#  echo -e "${MAJOR}Downloading the products-vectors-3.json.${RESET}"
#  curl --progress-bar -o ./elasticsearch/data/products-vectors-3.json -k https://o19s-public-datasets.s3.amazonaws.com/chorus/product-vectors-2023-03-23/products-vectors-3.json
#fi
#if [ ! -f ./elasticsearch/data/products-vectors-4.json ]; then
#  echo -e "${MAJOR}Downloading the products-vectors-4.json.${RESET}"
#  curl --progress-bar -o ./elasticsearch/data/products-vectors-4.json -k https://o19s-public-datasets.s3.amazonaws.com/chorus/product-vectors-2023-03-23/products-vectors-4.json
#fi

cd $DATA_DIR
for f in docs-vectors*.json;
  do
    f_bulk="${f}.bulk"
    for row in $(cat $f | jq -r '.[] | @base64'); do
        my_line=$(echo ${row} | base64 --decode)
        _extract_id() {
          echo ${my_line} | jq -r ._id
        }
        _extract_product() {
          echo ${my_line} | jq -r ${1}
        }
       echo { \"index\" : {\"_id\" : \"$(_extract_id)\"}} >> ${f_bulk}
       echo $(_extract_product '.') >> ${f_bulk}
    done

    echo "Populating products from ${f}, please give it a few minutes!"
    curl -u 'elastic:ElasticRocks' -s -X POST "localhost:9200/ecommerce/_bulk?pretty" --data-binary @"$f_bulk" -H 'Content-type:application/json';
    sleep 5
   done;
