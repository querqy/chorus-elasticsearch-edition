import os
import json

# This file basically helps chunking a big data file into small chunks

chunked_dir='chunked_data_files'
FILE_PATH = 'search.data.json'

# uncomment if you want to know how many records are there in the data file - with json list
#with open(FILE_PATH, encoding='utf8') as JSONFile:
#    data = json.load(JSONFile)
#print(len(data))

with open(FILE_PATH, 'r',
          encoding='utf-8') as JSONFile:
    #ll = [json.loads(line.strip()) for line in f1.readlines()]
    data = json.load(JSONFile)
    #this is the total length size of the json file
    lenDoc = len(data)
    print(lenDoc)

    #in here 1000 means we getting splits of 20000 products
    #you can define your own size of split according to your need
    size_of_the_split=1000
    total = lenDoc // size_of_the_split

    #in here you will get the Number of splits
    print(total+1)
    #to get the current working directory
    directory = os.getcwd()+ "/" + chunked_dir
    if not os.path.exists(directory):
        os.makedirs(directory)
    for i in range(total+1):
        json.dump(data[i * size_of_the_split:(i + 1) * size_of_the_split], open(
            directory + "/" + str(i+1) + ".json", 'w',
            encoding='utf8'), ensure_ascii=False, indent=True)