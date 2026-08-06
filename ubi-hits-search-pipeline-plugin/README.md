# ubi-hits-search-pipeline-plugin

An OpenSearch search pipeline response processor, `ubi_hits_to_docs`, that expands each
`query_response_hit_ids` array on a `ubi_queries` hit into individual search hits — one per id —
as if OpenSearch had matched that many separate documents.

Built against OpenSearch **3.7.0** to match the version in this repo's `docker-compose.yml`
(`opensearchstaging/opensearch:3.7.0`). A plugin built against any other version will be rejected
at node startup.

Deliberately depends only on the core `server` jar (`org.opensearch:opensearch`), never on
`search-pipeline-common` or any other module. OpenSearch gives every plugin its own isolated
classloader, so classes from other modules/plugins are NOT visible at runtime even though they
ship in the same distribution — depending on one crashes the node with a `NoClassDefFoundError`
the first time the processor actually runs.

## Build + install via quickstart.sh (normal path)

`./quickstart.sh` builds this plugin and bakes it into the `opensearch` image automatically —
no manual steps needed for a normal run. It does this by:

1. Running `(cd ubi-hits-search-pipeline-plugin && ./gradlew build)`, producing
   `build/distributions/ubi-hits-search-pipeline-*.zip`.
2. Copying that zip to `./opensearch/ubi-hits-search-pipeline.zip` (gitignored — it's a build
   artifact, regenerated on every quickstart run).
3. `docker compose up -d --build` then builds `opensearch/Dockerfile`, which `COPY`s that zip in
   and runs `opensearch-plugin install` on it, so the resulting `opensearchstaging/opensearch:3.7.0`
   image (tagged locally, per `docker-compose.yml`'s `build: ./opensearch/.`) has the plugin
   pre-installed.

Requires a JDK on the host (quickstart.sh checks for `java`) — Gradle itself is not required, the
committed wrapper (`./gradlew`) downloads it on first use.

## Build + install manually (iterating on the plugin without a full quickstart run)

```bash
cd ubi-hits-search-pipeline-plugin
./gradlew build
# -> build/distributions/ubi-hits-search-pipeline-1.0.0.zip

# Option A: rebuild the opensearch image (same path quickstart.sh uses)
cp build/distributions/ubi-hits-search-pipeline-*.zip ../opensearch/ubi-hits-search-pipeline.zip
cd .. && docker compose up -d --build opensearch

# Option B: hot-patch the already-running container without rebuilding the image
docker cp build/distributions/ubi-hits-search-pipeline-1.0.0.zip opensearch:/tmp/plugin.zip
docker exec opensearch bash -c \
  './bin/opensearch-plugin install --batch file:///tmp/plugin.zip'
docker compose restart opensearch
```

## Create a search pipeline and use it

```bash
curl -sk -u 'admin:MyStr0ng!P@ssw0rd2024' -X PUT "https://localhost:9200/_search/pipeline/ubi-expand" \
  -H 'Content-Type: application/json' \
  -d '{ "response_processors": [ { "ubi_hits_to_docs": {} } ] }'

curl -sk -u 'admin:MyStr0ng!P@ssw0rd2024' \
  "https://localhost:9200/ubi_queries/_search?search_pipeline=ubi-expand" \
  -H 'Content-Type: application/json' \
  -d '{ "query": { "match": { "user_query": "printer" } }, "size": 1 }'
```

By default the processor reads `query_response_hit_ids`. To point it at a different field:

```json
{ "response_processors": [ { "ubi_hits_to_docs": { "hit_ids_field": "some_other_field" } } ] }
```

## Uninstall

```bash
docker exec opensearch bash -c './bin/opensearch-plugin remove ubi-hits-search-pipeline'
docker compose restart opensearch
```
