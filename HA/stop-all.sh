#!/bin/bash

docker-compose -f sentry/docker-compose.yml down
docker-compose -f sentry2/docker-compose.yml down
docker-compose -f redis/docker-compose.yml down
docker-compose -f memcached/docker-compose.yml down
docker-compose -f postgres/docker-compose.yml down
docker-compose -f clickhouse/docker-compose.yml down
docker-compose -f kafka/docker-compose.yml down