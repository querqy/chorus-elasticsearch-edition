#!/bin/bash

DATA_DIR="./elasticsearch/data"

if [ ! -f ./elasticsearch/data/products-vectors-1.json ]; then
  echo -e "${MAJOR}Downloading the products-vectors-1.json.${RESET}"
  curl --progress-bar -o ./elasticsearch/data/products-vectors-1.json -k https://o19s-public-datasets.s3.amazonaws.com/chorus/product-vectors-2023-03-23/products-vectors-1.json
fi
if [ ! -f ./elasticsearch/data/products-vectors-2.json ]; then
  echo -e "${MAJOR}Downloading the products-vectors-2.json.${RESET}"
  curl --progress-bar -o ./elasticsearch/data/products-vectors-2.json -k https://o19s-public-datasets.s3.amazonaws.com/chorus/product-vectors-2023-03-23/products-vectors-2.json
fi
if [ ! -f ./elasticsearch/data/products-vectors-3.json ]; then
  echo -e "${MAJOR}Downloading the products-vectors-3.json.${RESET}"
  curl --progress-bar -o ./elasticsearch/data/products-vectors-3.json -k https://o19s-public-datasets.s3.amazonaws.com/chorus/product-vectors-2023-03-23/products-vectors-3.json
fi
if [ ! -f ./elasticsearch/data/products-vectors-4.json ]; then
  echo -e "${MAJOR}Downloading the products-vectors-4.json.${RESET}"
  curl --progress-bar -o ./elasticsearch/data/products-vectors-4.json -k https://o19s-public-datasets.s3.amazonaws.com/chorus/product-vectors-2023-03-23/products-vectors-4.json
fi

cd $DATA_DIR
for f in products-vectors*.json;
  do
    echo "Converting JSON to Elasticsearch NDJSON bulk format"
    cat "$f" | jq -c '.[] | ({"index": {}}, .)' > "$f.nd"
    echo "Populating products from ${f}.nd, please give it a few minutes!"
    curl -sS -o /dev/null -u 'elastic:ElasticRocks' -X POST "localhost:9200/ecommerce/_bulk?pretty" --data-binary @"${f}.nd" -H 'Content-type:application/x-ndjson ';
    sleep 2
   done;
