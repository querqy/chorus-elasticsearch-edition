DOT='\033[0;37m.\033[0m'
start_time=$(date +%s)
timeout=60   # Some setups return a "yellow" and so this allows us to continue on...

while [[ "$(curl -s localhost:9200/_cluster/health | jq '."status"')" != "\"green\"" ]]; do
    printf "${DOT}"
    sleep 5

    current_time=$(date +%s)
    elapsed_time=$((current_time - start_time))

    if [[ $elapsed_time -ge $timeout ]]; then
        echo "Timeout waiting for 'green' OpenSearch status reached. Proceeding on."
    fi
done

echo ""
