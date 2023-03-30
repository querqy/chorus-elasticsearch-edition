### Subroutine involved with summarising content for hudx_digest_new
from transformers import pipeline

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def summarise_content(targetContent,maxContentLength,minContentLength):
    return(summarizer(targetContent, max_length=maxContentLength, min_length=minContentLength, do_sample=False))