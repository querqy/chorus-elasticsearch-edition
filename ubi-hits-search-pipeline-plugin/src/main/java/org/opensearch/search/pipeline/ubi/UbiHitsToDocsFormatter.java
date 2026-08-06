package org.opensearch.search.pipeline.ubi;

import org.apache.lucene.search.TotalHits;
import org.opensearch.action.search.SearchRequest;
import org.opensearch.action.search.SearchResponse;
import org.opensearch.action.search.SearchResponseSections;
import org.opensearch.common.xcontent.XContentFactory;
import org.opensearch.core.common.bytes.BytesReference;
import org.opensearch.ingest.ConfigurationUtils;
import org.opensearch.search.SearchHit;
import org.opensearch.search.SearchHits;
import org.opensearch.search.pipeline.AbstractProcessor;
import org.opensearch.search.pipeline.Processor;
import org.opensearch.search.pipeline.Processor.PipelineContext;
import org.opensearch.search.pipeline.SearchResponseProcessor;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * A search response processor that reads the {@code query_response_hit_ids} array off of each
 * hit in a ubi_queries search response and expands it into one synthetic {@link SearchHit} per
 * id, as if OpenSearch had matched that many separate documents.
 */
public class UbiHitsToDocsFormatter extends AbstractProcessor implements SearchResponseProcessor {

    public static final String TYPE = "ubi_hits_to_docs";

    static final String HIT_IDS_FIELD = "hit_ids_field";
    static final String DEFAULT_HIT_IDS_FIELD = "query_response_hit_ids";

    private final String hitIdsField;

    UbiHitsToDocsFormatter(String tag, String description, boolean ignoreFailure, String hitIdsField) {
        super(tag, description, ignoreFailure);
        this.hitIdsField = hitIdsField;
    }

    @Override
    public String getType() {
        return TYPE;
    }

    @Override
    public SearchResponse processResponse(SearchRequest request, SearchResponse response) throws IOException {
        List<SearchHit> expandedHits = new ArrayList<>();

        for (SearchHit hit : response.getHits().getHits()) {
            Map<String, Object> source = hit.getSourceAsMap();
            if (source == null) {
                continue;
            }

            Object rawHitIds = source.get(hitIdsField);
            if (!(rawHitIds instanceof List)) {
                continue;
            }

            @SuppressWarnings("unchecked")
            List<Object> hitIds = (List<Object>) rawHitIds;

            for (int rank = 0; rank < hitIds.size(); rank++) {
                Object hitId = hitIds.get(rank);
                if (hitId == null) {
                    continue;
                }

                SearchHit expandedHit = new SearchHit(-1, hitId.toString(), new HashMap<>(), new HashMap<>());
                expandedHit.score(1.0f - (rank * 0.001f));

                Map<String, Object> expandedSource = new HashMap<>();
                expandedSource.put("query_id", hit.getId());
                expandedSource.put("user_query", source.get("user_query"));
                expandedSource.put("rank", rank);

                expandedHit.sourceRef(BytesReference.bytes(
                    XContentFactory.jsonBuilder().map(expandedSource)));

                expandedHits.add(expandedHit);
            }
        }

        SearchHits newHits = new SearchHits(
            expandedHits.toArray(new SearchHit[0]),
            new TotalHits(expandedHits.size(), TotalHits.Relation.EQUAL_TO),
            expandedHits.isEmpty() ? Float.NaN : expandedHits.get(0).getScore()
        );

        SearchResponseSections original = response.getInternalResponse();
        SearchResponseSections newSections = new SearchResponseSections(
            newHits,
            original.aggregations(),
            original.suggest(),
            original.timedOut(),
            original.terminatedEarly(),
            null, // profile results are not exposed via a public getter; dropped on expansion
            original.getNumReducePhases(),
            original.getSearchExtBuilders()
        );

        return new SearchResponse(
            newSections,
            response.getScrollId(),
            response.getTotalShards(),
            response.getSuccessfulShards(),
            response.getSkippedShards(),
            response.getTook().millis(),
            response.getShardFailures(),
            response.getClusters(),
            response.pointInTimeId()
        );
    }

    static class Factory implements Processor.Factory<SearchResponseProcessor> {
        @Override
        public UbiHitsToDocsFormatter create(
            Map<String, Processor.Factory<SearchResponseProcessor>> processorFactories,
            String tag,
            String description,
            boolean ignoreFailure,
            Map<String, Object> config,
            PipelineContext pipelineContext
        ) {
            String hitIdsField = ConfigurationUtils.readStringProperty(
                TYPE, tag, config, HIT_IDS_FIELD, DEFAULT_HIT_IDS_FIELD);
            return new UbiHitsToDocsFormatter(tag, description, ignoreFailure, hitIdsField);
        }
    }
}
