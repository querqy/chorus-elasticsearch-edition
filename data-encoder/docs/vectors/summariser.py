### Subroutine involved with summarising content for hudx_digest_new
from transformers import pipeline

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def summarize_content(text: str, max_len: int) -> str:
    try:
        summary = summarizer(text, max_length=max_len, min_length=10, do_sample=False)
        return summary[0]["summary_text"]
    except IndexError as ex:
        #print("Sequence length too large")
        return summarize_content(text[:1000],max_len)