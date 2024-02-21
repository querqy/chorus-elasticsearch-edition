FROM querqy/smui:4.0.10

COPY conf/smui2es.sh /smui/conf/smui2es.sh
COPY conf/*.py /smui/conf/
COPY conf/predefined_tags.json /smui/conf/predefined_tags.json

USER root
RUN apt-get update -y
RUN apt-get install -y python3
RUN apt-get install -y python3-pip
RUN chown -R smui:smui /smui/conf
USER smui
RUN python3 -m pip install requests
