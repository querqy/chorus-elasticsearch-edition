#!/usr/bin/env python3

import json
import io
import requests
from zipfile import *
from sentence_transformers import SentenceTransformer
from PIL import Image

PATH_PRODUCTS_DATASET = "data-encoder/ecommerce/vectors/data"
# Name of the zip file (without .zip extension)
NAME_DATASET = "1.json"
PATH_PRODUCTS_MODEL = "all-MiniLM-L6-v2"

def load_products_dataset():
    with ZipFile(PATH_PRODUCTS_DATASET+"/"+NAME_DATASET+".zip") as dataZip:
        with dataZip.open(NAME_DATASET,mode='r') as dataFile:
            products_dataset = json.load(dataFile)
    return products_dataset


def get_product_sentence(model, product):
    #print(f"{(product['title'])} {(product['supplier'])}")
    return f"{(product['title'])} {(product['supplier'])}"


def get_products_sentences(model, products_dataset):
    return [get_product_sentence(model, product) for product in products_dataset]


def get_product_image(product):
    product_img = f"{(product['img_high'])}"
    return product_img


def get_product_images(products_dataset):
    return [get_product_image(product) for product in products_dataset]


def load_products_embedding_model():
    return SentenceTransformer(PATH_PRODUCTS_MODEL)


def calculate_product_vector(model, product):
    product_sentence = get_product_sentence(product)
    return model.encode(product_sentence)


def calculate_products_vectors(model, products_dataset):
    products_sentences = get_products_sentences(model, products_dataset)
    return model.encode(products_sentences)

def calculate_product_image_vectors(model , product):
    try:
        image = get_product_image(product)
        r = requests.get(image, stream=True)
        pImage = Image.open(io.BytesIO(r.content))
        return model.encode(image)
    except Exception:
        return []


def calculate_products_image_vectors_clip(model, products_dataset):
    products_images = [calculate_product_image_vectors(model, product) for product in products_dataset]
    return products_images


def export_products_json(products_dataset):
    # Serializing json
    json_object = json.dumps(products_dataset, indent=2)
    # Writing to dataset.json
    with open(PATH_PRODUCTS_DATASET+"/"+"products-vectors-"+NAME_DATASET, "w") as outfile:
        outfile.write(json_object)


def truncate_sentence(sentence, tokenizer):
    """
    Truncate a sentence to fit the CLIP max token limit (77 tokens including the
    starting and ending tokens).

    Args:
        sentence(string): The sentence to truncate.
        tokenizer(CLIPTokenizer): Retrained CLIP tokenizer.
    """

    cur_sentence = sentence
    #print("new doc",cur_sentence)
    tokens = tokenizer.encode(cur_sentence)

    if len(tokens) > 77:
        # Skip the starting token, only include 75 tokens
        truncated_tokens = tokens[1:76]
        cur_sentence = tokenizer.decode(truncated_tokens)
        # Recursive call here, because the encode(decode()) can have different result
        return truncate_sentence(cur_sentence, tokenizer)

    else:
        return cur_sentence
