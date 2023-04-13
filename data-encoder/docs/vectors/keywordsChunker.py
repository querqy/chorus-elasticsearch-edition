### Subroutine involved with punctuation pruning + raking keywords for hudx_keywords_new

from rake_nltk import Rake
import string
import nltk

nltk.download('punkt')
nltk.download('stopwords')
r = Rake(include_repeated_phrases=False,min_length=4, max_length=6,punctuations=string.punctuation)

def rake_keywords(targetContent,keywordRating,numList):
    keywordsList = []
    r.extract_keywords_from_text(targetContent)
    for rating, keyword in r.get_ranked_phrases_with_scores():
        if rating > keywordRating:
            #print(keyword)
            keywordsList.append(keyword)
    return (keywordsList[:numList])