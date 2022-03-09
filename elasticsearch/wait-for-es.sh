DOT='\033[0;37m.\033[0m'
while [[ "$(curl -u 'elastic:ElasticRocks' -s localhost:9200/_cluster/health | jq '."status"')" != "\"green\"" ]]; do printf ${DOT}; sleep 5; done
echo ""