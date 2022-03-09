#!/bin/bash

# This script starts up Chorus and runs through the basic setup tasks.

set -e

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
if ! [ -x "$(command -v docker-compose)" ]; then
  echo "${ERROR}Error: docker-compose is not installed.${RESET}" >&2
  exit 1
fi
if ! [ -x "$(command -v jq)" ]; then
  echo "${ERROR}Error: jq is not installed.${RESET}" >&2
  exit 1
fi

observability=false
shutdown=false
offline_lab=false
stop=false

while [ ! $# -eq 0 ]
do
	case "$1" in
		--help | -h)
      echo -e "Use the option --with-offline-lab | -lab to include Quepid and RRE services in Chorus."
			echo -e "Use the option --with-observability | -obs to include Grafana, Prometheus, and Elasticsearch Exporter services in Chorus."
      echo -e "Use the option --shutdown | -s to shutdown and remove the Docker containers and data."
      echo -e "Use the option --stop to stop the Docker containers."
			exit
			;;
		--with-observability | -obs)
			observability=true
      echo -e "${MAJOR}Running Chorus with observability services enabled${RESET}"
			;;
    --with-offline-lab | -lab)
			offline_lab=true
      echo -e "${MAJOR}Running Chorus with offline lab environment enabled${RESET}"
			;;
    --shutdown | -s)
			shutdown=true
      echo -e "${MAJOR}Shutting down Chorus${RESET}"
			;;
	  --stop)
    	stop=true
      echo -e "${MAJOR}Stopping Chorus${RESET}"
    	;;
	esac
	shift
done

services="elasticsearch kibana chorus-ui"
if $observability; then
  services="${services} grafana elasticsearch-exporter"
fi

if $offline_lab; then
  services="${services} quepid rre keycloak"
fi

if $stop; then
  services="${services} grafana elasticsearch-exporter quepid rre keycloak"
  docker-compose stop ${services}
  exit
fi

if $shutdown; then
  docker-compose down -v
  exit
fi

docker-compose up -d --build ${services}

echo -e "${MAJOR}Waiting for Elasticsearch to start up and be online.${RESET}"
./elasticsearch/wait-for-es.sh # Wait for Elasticsearch to be online

#ToDo: This failed, no idea why.
#echo -e "${MINOR}waiting for Keycloak to be available${RESET}"
#./keycloak/wait-for-keycloak.sh

echo -e "${MAJOR}Creating ecommerce index and defining its mapping.\n${RESET}"
curl -u 'elastic:ElasticRocks' -s -X PUT "localhost:9200/ecommerce/" -H 'Content-Type: application/json' --data-binary @./elasticsearch/schema.json

if [ ! -f ./icecat-products-w_price-19k-20201127.tar.gz ]; then
    echo -e "${MAJOR}Downloading the sample product data.\n${RESET}"
    wget https://querqy.org/datasets/icecat/icecat-products-w_price-19k-20201127.tar.gz
fi

if [ ! -f ./icecat-products-w_price-19k-20201127.json ]; then
    echo -e "${MAJOR}Populating products, please give it a few minutes!\n${RESET}"
    tar xzf icecat-products-w_price-19k-20201127.tar.gz
fi

if [ ! -f ./transformed_data.json ]; then
  output=transformed_data.json

  for row in $(cat icecat-products-w_price-19k-20201127.json | jq -r '.[] | @base64'); do
      _jq() {
       echo ${row} | base64 --decode | jq -r ${1}
      }
     echo { \"index\" : {}} >> ${output}
     echo $(_jq '.') >> ${output}
  done
fi

echo -e "${MAJOR}Indexing data, please wait...${RESET}"
curl -u 'elastic:ElasticRocks' -s -X POST "localhost:9200/ecommerce/_bulk?pretty" -H 'Content-Type: application/json' --data-binary @transformed_data.json

echo -e "${MAJOR}Adding query rewriters.\n${RESET}"
# Query rewriters are configured empty, without any rules. This ensures that no errors occur when the different
# relevance algorithms are used in the frontend before any rules are set.
# For configuring the rules SMUI will be set up and used.
curl -u 'elastic:ElasticRocks' -s --request PUT 'http://localhost:9200/_querqy/rewriter/common_rules' \
--header 'Content-Type: application/json' \
--data-raw '{
    "class": "querqy.elasticsearch.rewriter.SimpleCommonRulesRewriterFactory",
    "config": {
        "rules": ""
    }
}'

curl -u 'elastic:ElasticRocks' -s --request PUT 'http://localhost:9200/_querqy/rewriter/common_rules_prelive' \
--header 'Content-Type: application/json' \
--data-raw '{
    "class": "querqy.elasticsearch.rewriter.SimpleCommonRulesRewriterFactory",
    "config": {
        "rules": ""
    }
}'

curl -u 'elastic:ElasticRocks' -s --request PUT 'http://localhost:9200/_querqy/rewriter/replace' \
--header 'Content-Type: application/json' \
--data-raw '{
    "class": "querqy.elasticsearch.rewriter.ReplaceRewriterFactory",
    "config": {
        "rules": ""
    }
}'

curl -u 'elastic:ElasticRocks' -s --request PUT 'http://localhost:9200/_querqy/rewriter/replace_prelive' \
--header 'Content-Type: application/json' \
--data-raw '{
    "class": "querqy.elasticsearch.rewriter.ReplaceRewriterFactory",
    "config": {
        "rules": ""
    }
}'

echo -e "${MAJOR}Setting up SMUI${RESET}"
#TODO: Integrate SMUI

if $offline_lab; then
  echo -e "${MAJOR}Setting up Quepid${RESET}"
  docker-compose run --rm quepid bin/rake db:setup
  docker-compose run quepid thor user:create -a admin@choruselectronics.com "Chorus Admin" password

  echo -e "${MAJOR}Setting up RRE${RESET}"
  docker-compose run rre mvn rre:evaluate
  docker-compose run rre mvn rre-report:report
fi

if $observability; then
  echo -e "${MAJOR}Setting up Grafana${RESET}"
  curl -u admin:password -S -X POST -H "Content-Type: application/json" -d '{"email":"admin@choruselectronics.com", "name":"Chorus Admin", "role":"admin", "login":"admin@choruselectronics.com", "password":"password", "theme":"light"}' http://localhost:9091/api/admin/users
  curl -u admin:password -S -X PUT -H "Content-Type: application/json" -d '{"isGrafanaAdmin": true}' http://localhost:9091/api/admin/users/2/permissions
  curl -u admin:password -S -X POST -H "Content-Type: application/json" http://localhost:9091/api/users/2/using/1
fi

echo -e "${MAJOR}Welcome to Chorus!${RESET}"