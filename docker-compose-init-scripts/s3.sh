#!/bin/bash

awslocal s3 mb s3://example-react-router-hono-bucket
awslocal s3api put-bucket-cors \
	--bucket example-react-router-hono-bucket \
	--cors-configuration '{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": [],
            "MaxAgeSeconds": 3000
        }
    ]
}'
