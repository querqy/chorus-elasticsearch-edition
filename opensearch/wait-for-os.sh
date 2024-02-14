DOT='\033[0;37m.\033[0m'
while [[ "$(curl -s localhost:9200/_cluster/health | jq '."status"')" != "\"yellow\"" ]]; do printf ${DOT}; sleep 5; done
echo ""
