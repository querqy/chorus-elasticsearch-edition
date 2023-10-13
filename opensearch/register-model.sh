#!/bin/bash

# Define the API endpoint for uploading the model
UPLOAD_API_URL="http://localhost:9200/_plugins/_ml/models/_upload"

# Define the JSON data for uploading the model
UPLOAD_JSON_DATA='
{
  "name": "huggingface/sentence-transformers/all-MiniLM-L6-v2",
  "version": "1.0.1",
  "model_format": "TORCH_SCRIPT"
}
'

# Define authentication credentials
USERNAME="admin"
PASSWORD="admin"

# Send the POST request to upload the model and capture the response
UPLOAD_RESPONSE=$(curl -s -u "$USERNAME:$PASSWORD" -X POST "$UPLOAD_API_URL" -H 'Content-Type: application/json' -d "$UPLOAD_JSON_DATA")

# Check if the upload request was successful
if [ $? -ne 0 ]; then
  echo "Error: Model upload request failed."
  exit 1
fi

# Extract task_id from the upload response
UPLOAD_TASK_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.task_id')

# Check if the upload task_id is "null" or empty
if [ -z "$UPLOAD_TASK_ID" ] || [ "$UPLOAD_TASK_ID" = "null" ]; then
  echo "Error: Upload task_id not found or is null in the response. $UPLOAD_RESPONSE"
  exit 1
fi

echo "Model upload request successful. Uploaded task_id: $UPLOAD_TASK_ID"

# Define the API endpoint for checking the status of the upload task
UPLOAD_STATUS_API_URL="http://localhost:9200/_plugins/_ml/tasks/$UPLOAD_TASK_ID"

# Use a while loop to wait for the upload task "state" to become "COMPLETED"
while true; do
  # Send the GET request to check the upload task status using curl in silent mode
  UPLOAD_STATUS_RESPONSE=$(curl -s -u "$USERNAME:$PASSWORD" -X GET "$UPLOAD_STATUS_API_URL")

  # Check if the request for upload task status was successful
  if [ $? -ne 0 ]; then
    echo "Error in checking upload task status. Response:"
    echo "$UPLOAD_STATUS_RESPONSE"
    exit 1
  fi

  # Extract the upload task "state" from the response
  UPLOAD_STATE=$(echo "$UPLOAD_STATUS_RESPONSE" | jq -r '.state')

  # Check if the upload task "state" is "COMPLETED"
  if [ "$UPLOAD_STATE" = "COMPLETED" ]; then
    MODEL_ID=$(echo "$UPLOAD_STATUS_RESPONSE" | jq -r '.model_id')
    echo "Model upload completed successfully. Model ID: $MODEL_ID"
    break
  fi
  if [ "$UPLOAD_STATE" = "FAILED" ]; then
    REASON=$(echo "$UPLOAD_STATUS_RESPONSE" | jq -r '.error')
    echo "Model upload failed: $REASON"
    exit 1
  fi

  # Sleep for a while before checking the status again
  sleep 1
done

# Define the API endpoint for deploying the model
DEPLOY_API_URL="http://localhost:9200/_plugins/_ml/models/$MODEL_ID/_deploy"

# Send the POST request to deploy the model using curl in silent mode and capture the response
DEPLOY_RESPONSE=$(curl -s -u "$USERNAME:$PASSWORD" -X POST "$DEPLOY_API_URL")

# Check if the deploy request was successful
if [ $? -ne 0 ]; then
  echo "Error: Model deployment request failed."
  exit 1
fi

# Extract task_id from the deploy response and store it in a variable
DEPLOY_TASK_ID=$(echo "$DEPLOY_RESPONSE" | jq -r '.task_id')

# Check if the deploy task_id is "null" or empty
if [ -z "$DEPLOY_TASK_ID" ] || [ "$DEPLOY_TASK_ID" = "null" ]; then
  echo "Error: Deploy task_id not found or is null in the response."
  exit 1
fi

echo "Model deployment request successful. Deployed task_id: $DEPLOY_TASK_ID"

# Define the API endpoint for checking the status of the deploy task
DEPLOY_STATUS_API_URL="http://localhost:9200/_plugins/_ml/tasks/$DEPLOY_TASK_ID"

# Use a while loop to wait for the deploy task "state" to become "COMPLETED"
while true; do
  # Send the GET request to check the deploy task status using curl in silent mode
  DEPLOY_STATUS_RESPONSE=$(curl -s -u "$USERNAME:$PASSWORD" -X GET "$DEPLOY_STATUS_API_URL")

  # Check if the request for deploy task status was successful
  if [ $? -ne 0 ]; then
    echo "Error in checking deploy task status. Response:"
    echo "$DEPLOY_STATUS_RESPONSE"
    exit 1
  fi

  # Extract the deploy task "state" from the response
  DEPLOY_STATE=$(echo "$DEPLOY_STATUS_RESPONSE" | jq -r '.state')

  # Check if the deploy task "state" is "COMPLETED"
  if [ "$DEPLOY_STATE" = "COMPLETED" ]; then
    echo "Model deployment completed successfully."
    break
  fi

  # Sleep for a while before checking the status again
  sleep 1
done

DEPLOY_MODEL_ID=$(echo "$DEPLOY_STATUS_RESPONSE" | jq -r '.model_id')
echo "Deployed model ID: $DEPLOY_MODEL_ID"

QUERY_TEMPLATE='
POST _scripts/ecom_neural_search
{
  "script": {
    "lang": "mustache",
    "source": {
      "query": {
        "bool": {
          "must": [
            {
              "neural": {
                "product_vector": {
                  "query_text": "{{query_text}}",
                  "model_id": "'$MODEL_ID'",
                  "k": 10
                }
              }
            }
          ]
        }
      }
    },
    "params": {
      "query_text": "notebook"
    }
  }
}'

SCRIPT_URL="http://localhost:9200/_scripts/ecom_neural_search"

UPLOAD_RESPONSE=$(curl -s -u "$USERNAME:$PASSWORD" -X POST "$SCRIPT_URL" -H 'Content-Type: application/json' -d "$QUERY_TEMPLATE")

# Check if the upload request was successful
if [ $? -ne 0 ]; then
  echo "Error: Query template request failed."
  exit 1
fi

echo "Query template ecom_neural_search created."
