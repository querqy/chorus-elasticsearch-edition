FROM docker.elastic.co/elasticsearch/elasticsearch:8.5.3
COPY querqy-elasticsearch-1.8.es853.0-SNAPSHOT.zip /usr/share/elasticsearch/querqy-elasticsearch-1.8.es853.0-SNAPSHOT.zip
WORKDIR /usr/share/elasticsearch

# Use this once the plugin is released
#RUN ./bin/elasticsearch-plugin install --batch \
#   "https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.6.es852.0/querqy-elasticsearch-1.6.es852.0.zip"

RUN ./bin/elasticsearch-plugin install --batch file:///usr/share/elasticsearch/querqy-elasticsearch-1.8.es853.0-SNAPSHOT.zip
COPY --chown=elasticsearch:elasticsearch elasticsearch.yml /usr/share/elasticsearch/config/
