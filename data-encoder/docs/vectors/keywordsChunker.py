### Subroutine involved with punctuation pruning + raking keywords for hudx_keywords_new

from rake_nltk import Rake
import string
import nltk;

nltk.download('punkt')
nltk.download('stopwords')
r = Rake()

def remove_punctuation(targetStr):
    print("The original string is : " + targetStr)
    # Removing punctuations using replace() method
    for punctuation in string.punctuation:
        # printing result
        #print("The string after punctuation filter : " + targetStr.replace(punctuation, ''))
        return(targetStr.replace(punctuation, ''))

def remove_punctuation2(targetStr):
    return (targetStr.translate
            (str.maketrans('', '', string.punctuation)))


def dedupe(mylist):
    return list(dict.fromkeys(mylist))

def rake_keywords(targetContent,keywordRating):
    keywordsList = []
    r.extract_keywords_from_text(remove_punctuation2(targetContent))
    for rating, keyword in r.get_ranked_phrases_with_scores():
        if rating > keywordRating:
            #print(keyword)
            keywordsList.append(keyword)
    return dedupe(keywordsList)