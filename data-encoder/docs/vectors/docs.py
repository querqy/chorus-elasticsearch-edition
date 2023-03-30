import json
from sentence_transformers import SentenceTransformer
import keywordsChunker
import summariser

PATH_DOCS_DATASET = "data-encoder/docs/vectors/data"
NAME_DATASET = "test.json"
PATH_DOCS_MODEL = "all-MiniLM-L6-v2"

model = SentenceTransformer(PATH_DOCS_MODEL)

def load_docs_dataset():
    with open(PATH_DOCS_DATASET+"/"+NAME_DATASET, "r") as infile:
        docs_dataset = json.load(infile)
    return docs_dataset


def get_doc_sentence(doc):
    sent = ""
    try:
        sent = sent + f"dsp: {doc['_source']['hudx_dsp']} :dsp"
    except KeyError:
        sent = sent

    try:
        sent = sent + f"title: {doc['_source']['title']} :title"
    except KeyError:
        sent = sent
    return sent


def get_docs_sentences(docs_dataset):
    return [get_doc_sentence(doc) for doc in docs_dataset]


def load_docs_embedding_model():
    return SentenceTransformer(PATH_DOCS_MODEL)


def calculate_doc_vector(doc):
    doc_sentence = get_doc_sentence(doc)
    return model.encode(doc_sentence)


def calculate_docs_vectors(docs_dataset):
    docs_sentences = get_docs_sentences(docs_dataset)
    return model.encode(docs_sentences)


def get_doc_content(doc):
    content = ""
    try:
        content = content + f"{doc['_source']['content']}"
    except KeyError:
        content = content
    return content

def get_docs_contents(docs_dataset):
    return [get_doc_content(doc) for doc in docs_dataset]


def get_raked_keywords(docs_dataset):
    #return [rake_keywords(content,7) for content in get_docs_contents(docs_dataset)]
    contentList = get_docs_contents(docs_dataset)
    rakedKeywordList = []
    for content in contentList:
        #print(content)
        rakedKeywordList.append(keywordsChunker.rake_keywords(content,7))
    return rakedKeywordList


def get_summarised_content(docs_dataset):
    #return [summarise_content(content,100,30) for content in get_docs_contents(docs_dataset)]
    contentList = get_docs_contents(docs_dataset)
    summarisedContentList = []
    for content in get_docs_contents(docs_dataset):
        #print("Doc content is : "+ content)
        contentSummary = summariser.summarise_content(content,100,30)
        #print("Summarised Content is : "+ contentSummary[0]['summary_text'])
        summarisedContentList.append(contentSummary[0]['summary_text'])
    return summarisedContentList


def export_docs_json(docs_dataset):
    # Serializing json
    json_object = json.dumps(docs_dataset, indent=2)
    # Writing to dataset.json
    with open(PATH_DOCS_DATASET+"/"+"docs-vectors-"+NAME_DATASET, "w") as outfile:
        outfile.write(json_object)