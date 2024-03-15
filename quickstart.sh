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
      echo -e "Use the option --online-deployment | -online to update configuration to run on chorus.dev.o19s.com environment."
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
    --online-deployment | -online)
      local_deploy=false
      echo -e "${MAJOR}Configuring Chorus for chorus-opensearch-edition.dev.o19s.com environment\n${RESET}"
      ;;	     
	esac
	shift
done

services="opensearch opensearch-dashboards chorus-ui"

if $offline_lab; then
  services="${services} quepid"
fi

if ! $local_deploy; then
  echo -e "${MAJOR}Updating configuration files for online deploy${RESET}"
  sed -i.bu 's/localhost:9200/chorus-opensearch-edition.dev.o19s.com:9200/g'  ./chorus_ui/src/Logs.js
  sed -i.bu 's/127.0.0.1:9200/chorus-opensearch-edition.dev.o19s.com:9200/g'  ./chorus_ui/src/App.js
  sed -i.bu 's/localhost:9200/chorus-opensearch-edition.dev.o19s.com:9200/g'  ./opensearch/wait-for-os.sh
fi

if $stop; then
  docker compose stop ${services}
  exit
fi

if $shutdown; then
  docker compose down -v
  exit
fi

docker compose up -d --build ${services}

#TODO: is this needed with the depends_on config in the docker compose?
echo -e "${MAJOR}Waiting for OpenSearch to start up and be online.${RESET}"
./opensearch/wait-for-os.sh # Wait for OpenSearch to be online

echo -e "${MAJOR}Creating ecommerce index, defining its mapping & settings\n${RESET}"
curl -s -X PUT "localhost:9200/ecommerce/" -H 'Content-Type: application/json' --data-binary @./opensearch/schema.json

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
curl -s -X PUT "localhost:9200/ecommerce/_settings"  -H 'Content-Type: application/json' -d '{"index.mapping.total_fields.limit": 20000}'
curl -s -X POST "localhost:9200/ecommerce/_bulk?pretty" -H 'Content-Type: application/json' --data-binary @transformed_data.json

# Initialize the UBI store called "log"
curl -X PUT "localhost:9200/_plugins/ubi/log"

if $offline_lab; then

  echo -e "${MAJOR}Setting up Quepid${RESET}"
  docker compose run --rm quepid bundle exec bin/rake db:setup
  docker compose run quepid bundle exec thor user:create -a admin@choruselectronics.com "Chorus Admin" password

fi

echo -e "${MAJOR}Welcome to Chorus OpenSearch Edition!${RESET}"
