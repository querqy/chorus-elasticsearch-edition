DOT='\033[0;37m.\033[0m'
# Wait until ES is up and the security API is ready (authenticated request returns 200)
until curl -u 'elastic:ElasticRocks' -s -o /dev/null -w "%{http_code}" localhost:9200/ | grep -q "200"; do
  printf ${DOT}
  sleep 5
done
echo ""
