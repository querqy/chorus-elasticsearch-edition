DOT='\033[0;37m.\033[0m'


curl -XPOST "http://opensearch-node1:9200/_plugins/_ml/models/_upload" -H 'Content-Type: application/json' -d'
{
  "name": "huggingface/sentence-transformers/all-MiniLM-L6-v2",
  "version": "1.0.1",
  "model_format": "TORCH_SCRIPT"
}'

while [[ "$(curl -u 'admin:admin' -s localhost:9200/_plugins/_ml/tasks/$1 | jq '."state"')" != "\"COMPLETED\"" ]]; do printf ${DOT}; sleep 5; done
echo ""
