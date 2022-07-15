#!/bin/bash

docker-compose -f kafka/docker-compose.yml up -d
docker-compose -f clickhouse/docker-compose.yml up -d
docker-compose -f postgres/docker-compose.yml up -d
docker-compose -f memcached/docker-compose.yml up -d
docker-compose -f redis/docker-compose.yml up -d
docker-compose -f sentry/docker-compose.yml up -d
docker-compose -f sentry2/docker-compose.yml up -d

# 初始化CK表
docker-compose -f sentry/docker-compose.yml run snuba-api snuba migrations migrate --force

# 初始化PG表 && 管理员用户（要交互）
docker-compose -f sentry/docker-compose.yml run web upgrade
