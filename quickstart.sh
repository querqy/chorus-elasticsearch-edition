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
if ! [ -x "$(command -v wget)" ]; then
  echo "${ERROR}Error: wget is not installed.${RESET}" >&2
  exit 1
fi

observability=false
shutdown=false
offline_lab=false
local_deploy=true
vector_search=false
stop=false

while [ ! $# -eq 0 ]
do
	case "$1" in
		--help | -h)
      echo -e "Use the option --with-offline-lab | -lab to include Quepid and RRE services in Chorus."
			echo -e "Use the option --with-observability | -obs to include Grafana, Prometheus, and Elasticsearch Exporter services in Chorus."
      echo -e "Use the option --shutdown | -s to shutdown and remove the Docker containers and data."
      echo -e "Use the option --stop to stop the Docker containers."
      echo -e "Use the option --online-deployment | -online to update configuration to run on chorus-es-edition.dev.o19s.com environment."
			exit
			;;
		--with-observability | -obs)
			observability=true
      echo -e "${MAJOR}Running Chorus with observability services enabled\n${RESET}"
			;;
    --with-offline-lab | -lab)
			offline_lab=true
      echo -e "${MAJOR}Running Chorus with offline lab environment enabled\n${RESET}"
			;;
    --online-deployment | -online)
  		local_deploy=false
      echo -e "${MAJOR}Configuring Chorus for chorus-es-edition.dev.o19s.com environment${RESET}"
  		;;
    --with-vector-search | -vector)
        vector_search=true
        echo -e "${MAJOR}Configuring Chorus with vector search services enabled${RESET}"
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

services="elasticsearch kibana chorus-ui smui"
if $observability; then
  services="${services} grafana elasticsearch-exporter"
fi

if $offline_lab; then
  services="${services} quepid rre keycloak"
fi

if ! $local_deploy; then
  echo -e "${MAJOR}Updating configuration files for online deploy${RESET}"
  sed -i.bu 's/localhost:3000/chorus-es-edition.dev.o19s.com:3000/g'  ./keycloak/realm-config/chorus-realm.json
  sed -i.bu 's/keycloak:9080/chorus-es-edition.dev.o19s.com:9080/g'  ./keycloak/wait-for-keycloak.sh
  sed -i.bu 's/keycloak:9080/chorus-es-edition.dev.o19s.com:9080/g'  ./docker-compose.yml
  sed -i.bu 's/localhost:9200/chorus-es-edition.dev.o19s.com:9200/g'  ./reactivesearch/src/App.js
fi

if $vector_search; then
  docker_memory_allocated=`docker info --format '{{json .MemTotal}}'`
  echo "Memory total is ${docker_memory_allocated}"

  if (( $docker_memory_allocated < 10737418240 )); then
    docker_memory_allocated_in_gb=$((docker_memory_allocated/1024/1024/1024))
    log_red "You have only ${docker_memory_allocated_in_gb} GB memory allocated to Docker, and you need at least 10GB for vectors demo."
  fi
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

echo -e "${MAJOR}Setting up an admin user to explore Elasticsearch and a role for anonymous access to run RRE offline tests.\n${RESET}"
curl -u 'elastic:ElasticRocks' -X POST "localhost:9200/_security/user/chorus_admin?pretty" -H 'Content-Type: application/json' -d'
{
  "password" : "password",
  "roles" : ["superuser"]
}
'

curl -u 'elastic:ElasticRocks' -X POST "localhost:9200/_security/role/anonymous_user" -H 'Content-Type: application/json' -d'
{
  "run_as": [ ],
  "cluster": [ ],
  "indices": [
    {
      "names": [ "ecommerce" ],
      "privileges": [ "read" ]
    }
  ]
}
'

echo -e "${MAJOR}Creating ecommerce index, defining its mapping & settings\n${RESET}"
curl -u 'elastic:ElasticRocks' -s -X PUT "localhost:9200/ecommerce/" -H 'Content-Type: application/json' --data-binary @./elasticsearch/schema.json

if $vector_search; then
  # Populating product data for vector search
  echo "Populating products for vector search, please give it a few minutes!"
  ./index-vectors.sh

else
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
  curl -u 'elastic:ElasticRocks' -s -X POST "localhost:9200/ecommerce/_bulk?pretty" -H 'Content-Type: application/json' --data-binary @transformed_data.json

fi

echo -e "${MAJOR}Creating default (empty) query rewriters\n${RESET}"
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

if $vector_search; then
  echo "Creating embedding rewriters."

  curl -u 'elastic:ElasticRocks' -s --request PUT 'http://localhost:9200/_querqy/rewriter/embtxt' \
  --header 'Content-Type: application/json' \
  --data-raw '{
      "class": "querqy.elasticsearch.rewriter.EmbeddingsRewriterFactory",
      "config": {
                   "model" : {
                     "class": "querqy.elasticsearch.rewriter.ChorusEmbeddingModel",
                     "url": "http://embeddings:8000/minilm/text/",
                     "normalize": false,
                     "cache" : "embeddings"
                   }
               }
  }'

  curl -u 'elastic:ElasticRocks' -s --request PUT 'http://localhost:9200/_querqy/rewriter/embimg' \
  --header 'Content-Type: application/json' \
  --data-raw '{
      "class": "querqy.elasticsearch.rewriter.EmbeddingsRewriterFactory",
      "config": {
                   "model" : {
                     "class": "querqy.elasticsearch.rewriter.ChorusEmbeddingModel",
                     "url": "http://embeddings:8000/clip/text/",
                     "normalize": false,
                     "cache" : "embeddings"
                   }
               }
  }'
fi

echo -e "${MAJOR}Setting up SMUI\n${RESET}"
while [ $(curl -s http://localhost:9000/api/v1/solr-index | wc -c) -lt 2 ]; do
    echo "Waiting 5s for SMUI to be ready..."
    sleep 5
done
curl -X PUT -H "Content-Type: application/json" -d '{"name":"ecommerce", "description":"Chorus Webshop"}' http://localhost:9000/api/v1/solr-index

if $offline_lab; then
  if $local_deploy; then
    ./keycloak/check-for-host-configuration.sh
  fi
  echo -e "${MINOR}Waiting for Keycloak to be available${RESET}"
  ./keycloak/wait-for-keycloak.sh

  echo -e "${MAJOR}Setting up Quepid${RESET}"

  docker-compose run --rm quepid bin/rake db:setup
  docker-compose run quepid thor user:create -a admin@choruselectronics.com "Chorus Admin" password

  echo -e "${MAJOR}Setting up RRE\n${RESET}"
  docker-compose run rre mvn rre:evaluate
  docker-compose run rre mvn rre-report:report
fi

if $observability; then
  echo -e "${MAJOR}Setting up Grafana\n${RESET}"
  curl -u admin:password -S -X POST -H "Content-Type: application/json" -d '{"email":"admin@choruselectronics.com", "name":"Chorus Admin", "role":"admin", "login":"admin@choruselectronics.com", "password":"password", "theme":"light"}' http://localhost:9091/api/admin/users
  curl -u admin:password -S -X PUT -H "Content-Type: application/json" -d '{"isGrafanaAdmin": true}' http://localhost:9091/api/admin/users/2/permissions
  curl -u admin:password -S -X POST -H "Content-Type: application/json" http://localhost:9091/api/users/2/using/1
fi

if $vector_search; then
  echo "Setting up Embeddings service"
  docker-compose up -d --build embeddings
  ./embeddings/wait-for-api.sh
fi

echo -e "${MAJOR}Welcome to Chorus ES Edition!${RESET}"
