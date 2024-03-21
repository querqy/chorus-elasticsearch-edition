#!/bin/bash
# This script transforms the downloaded and extracted 19k products from the icecat dataset.
# Transformation idea taken from https://www.starkandwayne.com/blog/bash-for-loop-over-json-array-using-jq/
# The script iterates through the JSON file and encodes each JSON element as a base64 string.
# Afterwards, the string is decoded and prefixed with {"index" : {}} to reflect the structure
# needed by OpenSearch.

for row in $(cat icecat-products-w_price-19k-20201127.json | jq -r '.[] | @base64'); do
    my_line=$(echo ${row} | base64 --decode)
    _id() {
     echo ${my_line} | jq -r .id
    }
    _jq() {
     echo ${my_line} | jq -r ${1}
    }
   echo { \"index\" : {\"_id\" : \"$(_id)\"}}
   echo $(_jq '.')
done
