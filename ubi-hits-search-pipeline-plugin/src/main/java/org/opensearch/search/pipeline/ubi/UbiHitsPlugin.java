package org.opensearch.search.pipeline.ubi;

import org.opensearch.plugins.Plugin;
import org.opensearch.plugins.SearchPipelinePlugin;
import org.opensearch.search.pipeline.Processor;
import org.opensearch.search.pipeline.SearchResponseProcessor;

import java.util.Map;

public class UbiHitsPlugin extends Plugin implements SearchPipelinePlugin {

    @Override
    public Map<String, Processor.Factory<SearchResponseProcessor>> getResponseProcessors(Parameters parameters) {
        return Map.of(UbiHitsToDocsFormatter.TYPE, new UbiHitsToDocsFormatter.Factory());
    }
}
