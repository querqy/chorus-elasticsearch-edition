#dev shortcut file to reindex data.

echo -e "${MAJOR}Creating ecommerce index, defining its mapping & settings\n${RESET}"
curl -s -X PUT "localhost:9200/ecommerce/" -H 'Content-Type: application/json' --data-binary @./opensearch/schema.json
curl -s -X PUT "localhost:9200/ecommerce/_settings"  -H 'Content-Type: application/json' -d '{"index.mapping.total_fields.limit": 20000}'
curl -s -X POST "localhost:9200/ecommerce/_bulk?pretty" -H 'Content-Type: application/json' --data-binary @transformed_data.json


