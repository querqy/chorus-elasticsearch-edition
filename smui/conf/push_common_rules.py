import sys,json,requests

if __name__ == "__main__":

    if len(sys.argv) != 3:
        print('Usage: push_common_rules.py <rules.txt> <http://<elasticsearch_host:port>/_querqy/rewriter/<rewriter_name>')
        sys.exit(1)

    rules_file = sys.argv[1]
    rewriter_url = sys.argv[2]

    f = open(rules_file, "r")

    req = {
        "class": "querqy.elasticsearch.rewriter.SimpleCommonRulesRewriterFactory",
        "config": {
            "querqyParser": "querqy.rewrite.commonrules.FieldAwareWhiteSpaceQuerqyParserFactory",
            "rules" : f.read()
        }
    }

    resp = requests.put(rewriter_url, auth = ('elastic', 'ElasticRocks'), json=req)
    if resp.status_code != 200:
        sys.exit(2)