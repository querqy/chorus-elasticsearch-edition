#!/bin/bash
set -euo pipefail

# This script starts up Chorus and runs through the basic setup tasks.

# Ansi color code variables
ERROR='\033[0;31m[QUICKSTART] '
MAJOR='\033[0;34m[QUICKSTART] '
MINOR='\033[0;37m[QUICKSTART]    '
RESET='\033[0m' # No Color

export DOCKER_SCAN_SUGGEST=false

observability=false
shutdown=false
offline_lab=false
local_deploy=true
stop=false
log_to_file=false

hostname_or_ip=false

# OpenSearch connection settings
OS_URL="https://localhost:9200"
os_curl() { curl -k -u 'admin:MyStr0ng!P@ssw0rd2024' "$@"; }

# Check for --log flag early so we can set up logging before other output
for arg in "$@"; do
  if [[ "$arg" == "--log" ]] || [[ "$arg" == "-l" ]]; then
    log_to_file=true
    break
  fi
done

# Set up logging to file if requested (before dependency checks so errors are logged)
if $log_to_file; then
  mkdir -p logs
  LOG_FILE="logs/quickstart-$(date +%Y%m%d-%H%M%S).log"
  exec > >(tee -a "$LOG_FILE")
  exec 2>&1
fi

if ! [ -x "$(command -v curl)" ]; then
  echo "${ERROR}Error: curl is not installed.${RESET}" >&2
  exit 1
fi
if ! [ -x "$(command -v docker)" ]; then
  echo "${ERROR}Error: docker is not installed.${RESET}" >&2
  exit 1
fi
if ! [ -x "$(command -v wget)" ]; then
  echo "${ERROR}Error: wget is not installed.${RESET}" >&2
  exit 1
fi
if ! [ -x "$(command -v java)" ]; then
  echo "${ERROR}Error: java is not installed (needed to build the ubi-hits-search-pipeline-plugin).${RESET}" >&2
  exit 1
fi

while [ ! $# -eq 0 ]
do
	case "$1" in
		--help | -h)
	    echo -e "Use the option --with-offline-lab | -lab to include Quepid service in Chorus."
	    echo -e "Use the option --shutdown | -s to shutdown and remove the Docker containers and data."
	    echo -e "Use the option --stop to stop the Docker containers."
	    echo -e "Use the option --online-deployment | -online to update configuration to run on chorus-opensearch-edition.dev.o19s.com environment."
	    echo -e "Use the option --log | -l to enable logging to a file in the logs directory."


		
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
		--log | -l)
	    log_to_file=true
	    echo -e "${MAJOR}Logging to file enabled\n${RESET}"
	    ;;


        --hostname_or_ip | -host)
	    if [ -n "$2" ] && [[ "$2" != -* ]]; then
          hostname_or_ip=true
	        HOST=$2
	        echo -e "${MAJOR}Using hostname/IP: $HOST\n${RESET}"
	        shift
	    else
	        echo -e "${ERROR}Error: --hostname | -host option requires an argument.${RESET}"
	        exit 1
	    fi
	    ;;
	esac
	shift
done

# Check if .env file exists, if not copy from .env.example and prompt user
if [ ! -f .env ]; then
  echo -e "${MAJOR}No .env file found. Copying .env.example to .env${RESET}"
  cp .env.example .env
  echo -e "${ERROR}Please configure the .env file with your settings before running quickstart.sh again.${RESET}"
  echo -e "${MAJOR}Exiting....${RESET}"
  exit 1  
else
  # Validate all keys from .env.example exist in .env
  missing_keys=()
  while IFS='=' read -r key value || [ -n "$key" ]; do
    # Skip comments and empty lines
    [[ "$key" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$key" ]] && continue
    # Remove leading/trailing whitespace from key
    key=$(echo "$key" | xargs)
    # Check if key exists in .env
    if ! grep -q "^${key}=" .env; then
      missing_keys+=("$key")
    fi
  done < .env.example
  
  if [ ${#missing_keys[@]} -gt 0 ]; then
    echo -e "${ERROR}Missing required keys in .env file:${RESET}"
    for key in "${missing_keys[@]}"; do
      echo -e "${ERROR}  - $key${RESET}"
    done
    echo -e "${MAJOR}Please add these keys to your .env file (see .env.example for reference).${RESET}"
    echo -e "${MAJOR}Exiting....${RESET}"
    exit 1
  fi
fi

services="opensearch-dashboards opensearch-mcp-server-py opensearch-agent-server opensearch middleware reactivesearch"

if $offline_lab; then
  services="${services} quepid"
fi

mkdir -p build

if ! $local_deploy; then
  echo -e "${MAJOR}Updating configuration files for online deploy${RESET}"
  sed -i.bu 's/localhost/chorus-opensearch-edition.dev.o19s.com/g'  ./reactivesearch/src/App.js
  sed -i.bu 's/localhost/chorus-opensearch-edition.dev.o19s.com/g'  ./opensearch/wait-for-os.sh
fi

if $hostname_or_ip; then
  echo -e "${MAJOR}Updating configuration files for deployment with specific hostname or IP${RESET}"
  sed -i.bu "s/localhost/$HOST/g" ./reactivesearch/src/App.js
fi

if $stop; then
  docker compose stop ${services}
  exit
fi

if $shutdown; then
  docker compose down -t 30 -v
  exit
fi
docker compose down -t 30

# Using pre-prepared sample data instead of downloading and transforming
echo -e "${MAJOR}Using pre-prepared sample data for quicker startup\n${RESET}"

echo -e "${MAJOR}Compiling the ubi-hits-search-pipeline OpenSearch plugin...${RESET}"
(cd ubi-hits-search-pipeline-plugin && ./gradlew build --console=plain)
cp ubi-hits-search-pipeline-plugin/build/distributions/ubi-hits-search-pipeline-*.zip ./opensearch/ubi-hits-search-pipeline.zip

docker compose up -d --build ${services}

echo -e "${MAJOR}Waiting for OpenSearch to start up and be online.${RESET}"
./opensearch/wait-for-os.sh # Wait for OpenSearch to be online


echo -e "${MAJOR}Configuring the ML Commons plugin.${RESET}"
os_curl -s -X PUT "$OS_URL/_cluster/settings" -H 'Content-Type: application/json' --data-binary '{
  "persistent": {
        "plugins": {
            "ml_commons": {
                "only_run_on_ml_node": "false",
                "model_access_control_enabled": "true",
                "native_memory_threshold": "99"
            }
        }
    }
}'

echo -e "${MAJOR}Registering a model group.${RESET}"
response=$(os_curl -s -X POST "$OS_URL/_plugins/_ml/model_groups/_register" \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "name": "neural_search_model_group",
    "description": "A model group for neural search models"
  }')

# Try to extract the model_group_id from the response
model_group_id=$(echo "$response" | jq -r '.model_group_id // empty' 2>/dev/null)

# If creation succeeded, use it; otherwise search for existing one
if [ -n "$model_group_id" ] && [ "$model_group_id" != "null" ]; then
  echo "Created Model Group with id: $model_group_id"
else
  response=$(os_curl -s -X POST "$OS_URL/_plugins/_ml/model_groups/_search" \
    -H 'Content-Type: application/json' \
    --data-binary '{
      "query": {
        "bool": {
          "must": [
            {
              "terms": {
                "name": [
                  "neural_search_model_group"
                ]
              }
            }
          ]
        }
      }
    }')
  model_group_id=$(echo "$response" | jq -r '.hits.hits[0]._id // empty' 2>/dev/null)
  echo "Using existing Model Group with id: $model_group_id"
fi

echo -e "${MAJOR}Registering a model in the model group.${RESET}"
response=$(os_curl -s -X POST "$OS_URL/_plugins/_ml/models/_register" \
  -H 'Content-Type: application/json' \
  --data-binary "{
     \"name\": \"huggingface/sentence-transformers/all-MiniLM-L6-v2\",
     \"version\": \"1.0.1\",
     \"model_group_id\": \"$model_group_id\",
     \"model_format\": \"TORCH_SCRIPT\"
  }")

# Extract the task_id from the JSON response
task_id=$(echo "$response" | jq -r '.task_id')

# Use the extracted task_id
echo "Created Model, get status with task id: $task_id"


echo -e "${MAJOR}Waiting for the model to be registered.${RESET}"
max_attempts=20
attempts=0

# Wait for task to be COMPLETED
while [[ "$(os_curl -s "$OS_URL/_plugins/_ml/tasks/$task_id" | jq -r '.state')" != "COMPLETED" && $attempts -lt $max_attempts ]]; do
    echo "Waiting for task to complete... attempt $((attempts + 1))/$max_attempts"
    sleep 5
    attempts=$((attempts + 1))
done

if [[ $attempts -ge $max_attempts ]]; then
    echo "Limit of attempts reached. Something went wrong with registering the model. Check OpenSearch logs."
    exit 1
else
    response=$(os_curl -s "$OS_URL/_plugins/_ml/tasks/$task_id")
    model_id=$(echo "$response" | jq -r '.model_id')
    echo "Task completed successfully! Model registered with id: $model_id"
fi

echo -e "${MAJOR}Deploying the model.${RESET}"
response=$(os_curl -s -X POST "$OS_URL/_plugins/_ml/models/$model_id/_deploy")

# Extract the task_id from the JSON response
deploy_task_id=$(echo "$response" | jq -r '.task_id')

echo "Model deployment started, get status with task id: $deploy_task_id"

echo -e "${MAJOR}Waiting for the model to be deployed.${RESET}"
# Reset attempts
attempts=0

while [[ "$(os_curl -s "$OS_URL/_plugins/_ml/tasks/$deploy_task_id" | jq -r '.state')" != "COMPLETED" && $attempts -lt $max_attempts ]]; do
    echo "Waiting for task to complete... attempt $((attempts + 1))/$max_attempts"
    sleep 5
    attempts=$((attempts + 1))
done

if [[ $attempts -ge $max_attempts ]]; then
    echo "Limit of attempts reached. Something went wrong with deploying the model. Check OpenSearch logs."
else
    response=$(os_curl -s "$OS_URL/_plugins/_ml/tasks/$deploy_task_id")
    model_id=$(echo "$response" | jq -r '.model_id')
    echo "Task completed successfully! Model deployed with id: $model_id"
fi

echo -e "${MAJOR}Creating an ingest pipeline for embedding generation during index time.${RESET}"
os_curl -s -X PUT "$OS_URL/_ingest/pipeline/embeddings-pipeline" \
  -H 'Content-Type: application/json' \
  --data-binary "{
     \"description\": \"A text embedding pipeline\",
       \"processors\": [
         {
          \"text_embedding\": {
          \"model_id\": \"$model_id\",
          \"field_map\": {
            \"title\": \"title_embedding\"
          }
        }
      }
    ]
  }"

echo -e "${MAJOR}Setting up User Behavior Insights indexes...\n${RESET}"
os_curl -s -X POST "$OS_URL/_plugins/ubi/initialize"

echo -e "${MAJOR}Creating capture-replay-index search pipeline...\n${RESET}"
os_curl -s -X PUT "$OS_URL/_search/pipeline/capture-replay-index" \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "description": "Expands ubi_queries query_response_hit_ids into individual search hits",
    "response_processors": [
      { "ubi_hits_to_docs": {} }
    ]
  }'
echo -e "\n"

echo -e "${MAJOR}Creating ecommerce index, defining its mapping & settings\n${RESET}"
os_curl -s -X PUT "$OS_URL/ecommerce" -H 'Content-Type: application/json' --data-binary @./opensearch/schema.json
echo -e "\n"

echo -e "${MAJOR}Indexing the product data, please wait...\n${RESET}"
# Define the OpenSearch endpoint and content header
OPENSEARCH_URL="$OS_URL/ecommerce/_bulk?pretty=false&filter_path=-items"
CONTENT_TYPE="Content-Type: application/json"

# Using pre-prepared shrunk sample data for faster indexing
echo "Processing ./sample-data/esci_us_ecommerce_shrunk.ndjson"

# Send the file to OpenSearch using curl
os_curl -X POST "$OPENSEARCH_URL" -H "$CONTENT_TYPE" --data-binary @./sample-data/esci_us_ecommerce_shrunk.ndjson

# Check the response code to see if the request was successful
if [[ $? -ne 0 ]]; then
    echo "Failed to send sample data file"
else
    echo "Sample data file successfully sent to OpenSearch"
fi

echo -e "${MAJOR}Creating pipelines for neural search and hybrid search\n${RESET}"
os_curl -s -X PUT "$OS_URL/_search/pipeline/neural-search-pipeline" \
  -H 'Content-Type: application/json' \
  --data-binary "{
     \"description\": \"Neural Only Search\",
     \"request_processors\": [
      {
      \"neural_query_enricher\" : {
        \"description\": \"Sets the default model ID at index and field levels\",
        \"default_model_id\": \"$model_id\",
        \"neural_field_default_id\": {
           \"title_embeddings\": \"$model_id\"
        }
      }
    }
  ]
  }"

os_curl -s -X PUT "$OS_URL/_search/pipeline/hybrid-search-pipeline" \
  -H 'Content-Type: application/json' \
  --data-binary "{
     \"request_processors\": [
    {
      \"neural_query_enricher\" : {
        \"description\": \"Sets the default model ID at index and field levels\",
        \"default_model_id\": \"$model_id\",
        \"neural_field_default_id\": {
           \"title_embeddings\": \"$model_id\"
        }
      }
    }
  ],
  \"phase_results_processors\": [
    {
      \"normalization-processor\": {
        \"normalization\": {
          \"technique\": \"min_max\"
        },
        \"combination\": {
          \"technique\": \"arithmetic_mean\",
          \"parameters\": {
            \"weights\": [
              0.3,
              0.7
            ]
          }
        }
      }
    }
  ]
  }"

if $offline_lab; then
  echo -e "${MAJOR}Setting up Quepid${RESET}"
  #docker compose run --rm quepid bundle exec bin/rake db:setup
  docker compose run quepid bundle exec thor user:create -a admin@choruselectronics.com "Chorus Admin" password
fi

echo -e "${MAJOR}Updating the indexed data with embeddings...\n${RESET}"
update_docs_task_id=$(os_curl -s -X POST "$OS_URL/ecommerce/_update_by_query?pipeline=embeddings-pipeline&wait_for_completion=false" | jq -r '.task')

echo -e "${MAJOR}This process runs in the background. Plese give it a couple of minutes. You can check the progress with the following curl command:

curl -k -u 'admin:MyStr0ng!P@ssw0rd2024' -s GET https://localhost:9200/_tasks/$update_docs_task_id\n${RESET}"

echo -e "${MAJOR}Waiting for OpenSearch Dashboards to start up and be online.${RESET}"
./opensearch-dashboards/wait-for-dashboards.sh

# Create (or look up) the "Chorus Production" workspace BEFORE importing dashboards
# so each import can use the workspace-scoped URL and the dashboards show up in the
# workspace UI rather than only in the global namespace.
echo -e "${MAJOR}Looking up / creating Chorus Production workspace...${RESET}"
WORKSPACE_ID=$(./setup_chorus_workspace.sh)
WS_IMPORT_URL="http://localhost:5601/w/${WORKSPACE_ID}/api/saved_objects/_import?overwrite=true"

echo -e "${MAJOR}Installing User Behavior Insights Dashboards into workspace...\n${RESET}"
curl -u 'admin:MyStr0ng!P@ssw0rd2024' -X POST "$WS_IMPORT_URL" -H "osd-xsrf: true" --form file=@opensearch-dashboards/ubi_dashboard.ndjson > /dev/null

echo -e "${MAJOR}Installing Team Draft Interleaving Dashboards into workspace...\n${RESET}"
curl -u 'admin:MyStr0ng!P@ssw0rd2024' -X POST "$WS_IMPORT_URL" -H "osd-xsrf: true" --form file=@opensearch-dashboards/tdi_dashboard.ndjson > /dev/null

echo -e "${MAJOR}Fetching latest Search Result Quality Evaluation Dashboard, sample data and install script...\n${RESET}"

# Dashboards
curl -s -o build/search_dashboard.ndjson https://raw.githubusercontent.com/o19s/opensearch-search-quality-evaluation/refs/heads/main/opensearch-dashboard-prototyping/search_dashboard.ndjson
# Install script
curl -s -o build/install_dashboards.sh https://raw.githubusercontent.com/o19s/opensearch-search-quality-evaluation/refs/heads/main/opensearch-dashboard-prototyping/install_dashboards.sh
# Patch downloaded script: prepend auth (and -k for HTTPS) to every curl invocation.
# Matches `curl ` at the start of a line so it catches both `curl -s …` (OS calls)
# and `curl -X POST …` (the OSD saved_objects/_import call) regardless of flags.
sed -i.bu "s|^curl |curl -k -u 'admin:MyStr0ng!P@ssw0rd2024' |g" build/install_dashboards.sh
# sample data
curl -s -o build/sample_data.ndjson https://raw.githubusercontent.com/o19s/opensearch-search-quality-evaluation/refs/heads/main/opensearch-dashboard-prototyping/sample_data.ndjson
# mappings for search quality metrics sample data index
curl -s -o build/srw_metrics_mappings.json https://raw.githubusercontent.com/o19s/opensearch-search-quality-evaluation/refs/heads/main/opensearch-dashboard-prototyping/srw_metrics_mappings.json

echo -e "${MAJOR}Installing Search Result Quality Evaluation Dashboard into workspace...\n${RESET}"
chmod +x build/install_dashboards.sh
# Pass the workspace-scoped OSD URL so install_dashboards.sh's POST to
# "$opensearch_dashboard/api/saved_objects/_import" lands in the workspace.
./build/install_dashboards.sh https://localhost:9200 "http://localhost:5601/w/${WORKSPACE_ID}"

## configure the SRW search configurations
echo -e "${MAJOR}Creating Search Relevance entities...\n${RESET}"
./search_relevance.sh

echo -e "${MAJOR}Creating Chorus Team roles and users...\n${RESET}"
./setup_chorus_team.sh

# we start dataprepper as the last service to prevent it from creating the ubi_queries index using the wrong mappings.
echo -e "${MAJOR}Starting Dataprepper...\n${RESET}"
docker compose up -d --build dataprepper --remove-orphans



echo -e "${MAJOR}Welcome to Chorus OpenSearch Edition!${RESET}"
