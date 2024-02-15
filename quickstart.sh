#!/bin/bash -e

# This script starts up Chorus and runs through the basic setup tasks.

# Ansi color code variables
ERROR='\033[0;31m[QUICKSTART] '
MAJOR='\033[0;34m[QUICKSTART] '
MINOR='\033[0;37m[QUICKSTART]    '
RESET='\033[0m' # No Color

export DOCKER_SCAN_SUGGEST=false

if ! [ -x "$(command -v curl)" ]; then
  echo "${ERROR}Error: curl is not installed.${RESET}" >&2
  exit 1
fi
if ! [ -x "$(command -v docker)" ]; then
  echo "${ERROR}Error: docker is not installed.${RESET}" >&2
  exit 1
fi
if ! [ -x "$(command -v jq)" ]; then
  echo "${ERROR}Error: jq is not installed.${RESET}" >&2
  exit 1
fi
if ! [ -x "$(command -v wget)" ]; then
  echo "${ERROR}Error: wget is not installed.${RESET}" >&2
  exit 1
fi

observability=false
shutdown=false
offline_lab=false
local_deploy=true
stop=false

while [ ! $# -eq 0 ]
do
	case "$1" in
		--help | -h)
      echo -e "Use the option --with-offline-lab | -lab to include Quepid and RRE services in Chorus."
      echo -e "Use the option --shutdown | -s to shutdown and remove the Docker containers and data."
      echo -e "Use the option --stop to stop the Docker containers."
			exit
			;;
    --with-offline-lab | -lab)
			offline_lab=true
      echo -e "${MAJOR}Running Chorus with offline lab environment enabled\n${RESET}"
			;;
    --shutdown | -s)
			shutdown=true
      echo -e "${MAJOR}Shutting down Chorus\n${RESET}"
			;;
	  --stop)
    	stop=true
      echo -e "${MAJOR}Stopping Chorus\n${RESET}"
    	;;
	esac
	shift
done

services="opensearch opensearch-dashboards chorus-ui smui"

if $offline_lab; then
  services="${services} quepid rre"
fi

if $stop; then
  services="${services} quepid rre"
  docker compose stop ${services}
  exit
fi

if $shutdown; then
  docker compose down -v
  exit
fi

docker compose up -d --build ${services}

echo -e "${MAJOR}Waiting for OpenSearch to start up and be online.${RESET}"
./opensearch/wait-for-os.sh # Wait for OpenSearch to be online

echo -e "${MAJOR}Creating ecommerce index, defining its mapping & settings\n${RESET}"
curl -s -X PUT "localhost:9200/ecommerce/" -H 'Content-Type: application/json' --data-binary @./opensearch/schema.json
curl -s -X PUT "localhost:9200/ecommerce/_settings"  -H 'Content-Type: application/json' -d '{"index.mapping.total_fields.limit": 10000}'

# Populating product data for non-vector search
if [ ! -f ./icecat-products-w_price-19k-20201127.tar.gz ]; then
  echo -e "${MAJOR}Downloading the sample product data\n${RESET}"
  wget https://querqy.org/datasets/icecat/icecat-products-w_price-19k-20201127.tar.gz
fi

if [ ! -f ./icecat-products-w_price-19k-20201127.json ]; then
  echo -e "${MAJOR}Unpacking the sample product data, please give it a few minutes!\n${RESET}"
  tar xzf icecat-products-w_price-19k-20201127.tar.gz
fi

if [ ! -f ./transformed_data.json ]; then
  output=transformed_data.json

  for row in $(cat icecat-products-w_price-19k-20201127.json | jq -r '.[] | @base64'); do
      my_line=$(echo ${row} | base64 --decode)
      _id() {
       echo ${my_line} | jq -r .id
      }
      _jq() {
       echo ${my_line} | jq -r ${1}
      }
     echo { \"index\" : {\"_id\" : \"$(_id)\"}} >> ${output}
     echo $(_jq '.') >> ${output}
  done
fi
echo -e "${MAJOR}Indexing the sample product data, please wait...\n${RESET}"
curl -s -X POST "localhost:9200/ecommerce/_bulk?pretty" -H 'Content-Type: application/json' --data-binary @transformed_data.json


# echo -e "${MAJOR}Creating default (empty) query rewriters\n${RESET}"
# # Query rewriters are configured empty, without any rules. This ensures that no errors occur when the different
# # relevance algorithms are used in the frontend before any rules are set.
# # For configuring the rules SMUI will be set up and used.
# curl -s --request PUT 'http://localhost:9200/_querqy/rewriter/common_rules' \
# --header 'Content-Type: application/json' \
# --data-raw '{
#     "class": "querqy.elasticsearch.rewriter.SimpleCommonRulesRewriterFactory",
#     "config": {
#         "rules": ""
#     }
# }'

# curl -s --request PUT 'http://localhost:9200/_querqy/rewriter/common_rules_prelive' \
# --header 'Content-Type: application/json' \
# --data-raw '{
#     "class": "querqy.elasticsearch.rewriter.SimpleCommonRulesRewriterFactory",
#     "config": {
#         "rules": ""
#     }
# }'

# curl -s --request PUT 'http://localhost:9200/_querqy/rewriter/replace' \
# --header 'Content-Type: application/json' \
# --data-raw '{
#     "class": "querqy.elasticsearch.rewriter.ReplaceRewriterFactory",
#     "config": {
#         "rules": ""
#     }
# }'

# curl -s --request PUT 'http://localhost:9200/_querqy/rewriter/replace_prelive' \
# --header 'Content-Type: application/json' \
# --data-raw '{
#     "class": "querqy.elasticsearch.rewriter.ReplaceRewriterFactory",
#     "config": {
#         "rules": ""
#     }
# }'

# echo -e "${MAJOR}Setting up SMUI\n${RESET}"
# while [ $(curl -s http://localhost:9000/api/v1/solr-index | wc -c) -lt 2 ]; do
#     echo "Waiting 5s for SMUI to be ready..."
#     sleep 5
# done
# curl -X PUT -H "Content-Type: application/json" -d '{"name":"ecommerce", "description":"Chorus Webshop"}' http://localhost:9000/api/v1/solr-index

if $offline_lab; then

  echo -e "${MAJOR}Setting up Quepid${RESET}"
  docker compose run --rm quepid bin/rake db:setup
  docker compose run quepid thor user:create -a admin@choruselectronics.com "Chorus Admin" password

fi

echo -e "${MAJOR}Welcome to Chorus OpenSearch Edition!${RESET}"
