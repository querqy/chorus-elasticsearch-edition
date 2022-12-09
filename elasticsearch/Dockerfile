FROM docker.elastic.co/elasticsearch/elasticsearch:8.5.2

WORKDIR /usr/share/elasticsearch
RUN ./bin/elasticsearch-plugin install --batch \
   "https://repo1.maven.org/maven2/org/querqy/querqy-elasticsearch/1.6.es852.0/querqy-elasticsearch-1.6.es852.0.zip"
COPY --chown=elasticsearch:elasticsearch elasticsearch.yml /usr/share/elasticsearch/config/
