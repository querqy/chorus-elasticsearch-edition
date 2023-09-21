FROM opensearchproject/opensearch:2.9.0
#COPY opensearch-querqy-1.0.os2.3.0-SNAPSHOT.zip /usr/share/opensearch/opensearch-querqy-1.0.os2.3.0-SNAPSHOT.zip
WORKDIR /usr/share/opensearch

# Use this once the plugin is released
#RUN ./bin/opensearch-plugin install --batch \
#   "https://repo1.maven.org/maven2/org/querqy/opensearch-querqy/1.0.os2.3.0/opensearch-querqy-1.0.os2.3.0.zip"

#RUN ./bin/opensearch-plugin install --batch file:///usr/share/opensearch/opensearch-querqy-1.0.os2.3.0-SNAPSHOT.zip

COPY --chown=opensearch:opensearch opensearch.yml /usr/share/opensearch/config/
# COPY --chown=opensearch:opensearch internal_users.yml /usr/share/opensearch/config/opensearch-security/internal_users.yml

# The following plugins are installed by default on 2.9, and default conf requires > 1 shard
# An alternative would be to override their configuration during image creation
RUN ./bin/opensearch-plugin remove opensearch-ml
RUN ./bin/opensearch-plugin remove opensearch-security-analytics
