#Security

Basic Auth is activated and used in Elasticsearch. Any operation can only be done by using correct username and password combinations. The default user `elastic` is used by other components (e.g. the Prometheus exporter for monitoring Elasticsearch), by the `quickstart.sh` script and the manual setup steps in [Kata 0: Setting up Chorus](katas/000_setting_up_chorus.md).

This table contains the username and password combinations for each of the components. We distinguish between technical users and admin users.

| Component     | Username                    | Password     | Origin               | Usage          |
|---------------|-----------------------------|--------------|----------------------|----------------|
| Elasticsearch | elastic                     | ElasticRocks | `docker-compose.yml` | Technical User |
| Elasticsearch | chorus_admin                | password     | `quickstart.sh`      | Admin User     |
| Quepid        | admin@choruselectronics.com | password     | `quickstart.sh`      | Admin User     |
| Grafana       | admin@choruselectronics.com | password     | `quickstart.sh`      | Admin User     |
| Keycloak      | admin                       | password     | `docker-compose.yml` | Admin User     |
| MySQL         | root                        | password     | `docker-compose.yml` | Admin User     |

Keycloak can be used to log in to Quepid via OpenID.

Unauthorized access is activated for Elasticsearch, so RRE can access Elasticsearch for offline testing. Access is restricted to reading the data from the ecommerce index.

#Monitoring

Elasticsearch Exporter:
https://github.com/prometheus-community/elasticsearch_exporter

Grafana Dashboard: https://grafana.com/grafana/dashboards/4377

In the Grafana dashboard, all instances of ${DS_PROMETHEUS} or DS_PROMETHEUS were replaced by Prometheus.
