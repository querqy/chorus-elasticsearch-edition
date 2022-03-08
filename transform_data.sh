#!/bin/bash
# This script transforms the downloaded and extracted 19k products from the icecat dataset.
# Transformation idea taken from https://www.starkandwayne.com/blog/bash-for-loop-over-json-array-using-jq/
# The script iterates through the JSON file and encodes each JSON element as a base64 string.
# Afterwards, the string is decoded and prefixed with {"index" : {}} to reflect the structure
# needed by Elasticsearch.

for row in $(cat icecat-products-w_price-19k-20201127.json | jq -r '.[] | @base64'); do
    _jq() {
     echo ${row} | base64 --decode | jq -r ${1}
    }
   echo { \"index\" : {}}
   echo $(_jq '.')
done
