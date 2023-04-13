#!/usr/bin/env python3
from sentence_transformers import SentenceTransformer, util
import docs

err_msg = "Some issue occured in id:"

#### Load the original docs dataset
docs_dataset = docs.load_docs_dataset()

#### Use the embedding model to calculate vectors for all docs
docs_vectors = docs.calculate_docs_vectors(docs_dataset)

#### Prepare the list of content field for keywords and summarisation
contentList = docs.get_docs_contents(docs_dataset)

#### Generating keywords over the content for all docs
docs_keywords = docs.get_raked_keywords(contentList)

#### Summarising content for all docs
docs_summarise = docs.get_summarised_content(contentList)
#print(docs_summarise)


#### Create the new docs dataset by creating a new field with the embedding vector
for idx in range(len(docs_dataset)):
    try:
        docs_dataset[idx]['_source']["text_vector"] = docs_vectors[idx].tolist()
        docs_dataset[idx]['_source']["hudx_keywords_new"] = docs_keywords[idx]
        docs_dataset[idx]['_source']["hudx_digest_new"] = docs_summarise[idx]
    except Exception as e: print(e)
    #print(f'{err_msg}') #{docs_dataset[idx]['id']}


#### Export the new docs dataset for all formats
docs.export_docs_json(docs_dataset)