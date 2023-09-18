FROM opensearchproject/opensearch:2.3.0
COPY opensearch-querqy-1.0.os2.3.0-SNAPSHOT.zip /usr/share/opensearch/opensearch-querqy-1.0.os2.3.0-SNAPSHOT.zip
WORKDIR /usr/share/opensearch

# Use this once the plugin is released
#RUN ./bin/opensearch-plugin install --batch \
#   "https://repo1.maven.org/maven2/org/querqy/opensearch-querqy/1.0.os2.3.0/opensearch-querqy-1.0.os2.3.0.zip"

RUN ./bin/opensearch-plugin install --batch file:///usr/share/opensearch/opensearch-querqy-1.0.os2.3.0-SNAPSHOT.zip
COPY --chown=opensearch:opensearch opensearch.yml /usr/share/opensearch/config/
