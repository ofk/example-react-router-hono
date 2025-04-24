#!/bin/bash

awslocal dynamodb create-table \
	--table-name example-react-router-hono-table \
	--attribute-definitions AttributeName=title,AttributeType=S \
	--key-schema AttributeName=title,KeyType=HASH \
	--billing-mode PAY_PER_REQUEST
