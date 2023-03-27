#!/bin/bash

set -eo pipefail

# The directory where we locally buffer data files before uploading to Elasticsearch
DATA_DIR="./elasticsearch/data"

# The URL prefix we're downloading from
REMOTE_URL="https://o19s-public-datasets.s3.amazonaws.com/chorus/product-vectors-2023-03-23"

# The number of files (1..NUM_FILES) we retrieve
NUM_FILES=4

# The maximum records per bulk upload, i.e. the maximum number of rows per splitted NDJSON file
BULK_MAX=1000

mkdir -p "${DATA_DIR}"

for ((i=1; i<=NUM_FILES;i++));
  do
    PRODUCT_VECTORS_FILE="products-vectors-${i}.json"
    REMOTE_FILE_URL="${REMOTE_URL}/${PRODUCT_VECTORS_FILE}"
    LOCAL_JSON_FILE="${DATA_DIR}/${PRODUCT_VECTORS_FILE}"

    if [ -f "$LOCAL_JSON_FILE" ]; then
      echo -e "${MAJOR}Skipping download of existing $LOCAL_JSON_FILE.${RESET}"
    else
      echo -e "${MAJOR}Downloading $PRODUCT_VECTORS_FILE. Please be patient.${RESET}"
      HTTP_CODE=$(curl --silent --write-out "%{http_code}" -o "${LOCAL_JSON_FILE}" -k "${REMOTE_FILE_URL}")
      if [[ ${HTTP_CODE} -lt 200 || ${HTTP_CODE} -gt 299 ]] ; then
        echo -e "${MAJOR}Download failed with return code: ${HTTP_CODE}.${RESET}"
        rm ${LOCAL_JSON_FILE}
        exit 1
      fi
    fi

    echo -e "${MAJOR}Converting JSON to NDJSON${RESET}"
    LOCAL_NDJSON_FILE="${LOCAL_JSON_FILE}.nd"
    cat "$LOCAL_JSON_FILE" | jq -c '.[]' > $LOCAL_NDJSON_FILE

    echo -e "${MAJOR}Splitting ${LOCAL_NDJSON_FILE} to a maximum of ${BULK_MAX} rows.${RESET}"
    split -l${BULK_MAX} $LOCAL_NDJSON_FILE "${DATA_DIR}/${PRODUCT_VECTORS_FILE}.splitted.nd."

    for f in ${DATA_DIR}/${PRODUCT_VECTORS_FILE}.splitted.nd.*;
      do
        echo -e "${MAJOR}Converting ${f} to ES bulk format.${RESET}"
        awk '{print "{\"index\": {}}\n" $0}' ${f} > "${f}.bulk"
        echo -e "${MAJOR}Populating products from ${f}.bulk.${RESET}"
        curl -sS -o /dev/null -u 'elastic:ElasticRocks' -X POST "localhost:9200/ecommerce/_bulk?pretty" --data-binary @"${f}.bulk" -H 'Content-type:application/x-ndjson ';
      done;
  done;
