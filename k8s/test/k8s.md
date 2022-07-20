


# 如何挂载本地目录

docker-compose里的写法：

```yaml
service:
  relay:
    image: getsentry/relay:22.6.0
    volumes:
      - type: bind
        read_only: true
        source: ./relay
        target: /work/.relay
      - type: bind
        read_only: true
        source: ./geoip
        target: /geoip
```

k8s通过volume名称对应

```yaml
spec:
  containers:
    - name: sentry-relay
      image: getsentry/relay:22.6.0
      volumeMounts:
        - mountPath: /work/.relay
          name: v-relay-config
        - mountPath: /geoip
          name: v-relay-geoip
  volumes:
    - name: v-relay-config
      hostPath:
        path: ./relay
        type: Directory
    - name: v-relay-geoip
      hostPath:
        path: ./geoip
        type: Directory
```

# 如何声明环境变量

docker-compose的写法

```yaml
snuba:
  image: "$SNUBA_IMAGE"
  environment:
    SNUBA_SETTINGS: distributed
    CLICKHOUSE_HOST: 172.17.183.16
```

Pod

```yaml
spec:
  containers:
    - name: sentry-snuba-api
      image: getsentry/snuba:22.6.0
      env:
        - name: SNUBA_SETTINGS
          value: "distributed"
        - name: CLICKHOUSE_HOST
          value: "172.17.183.16"
```

# 如何执行入口命令

[https://kubernetes.io/zh-cn/docs/tasks/inject-data-application/define-command-argument-container/](https://kubernetes.io/zh-cn/docs/tasks/inject-data-application/define-command-argument-container/)

docker-compose的写法

```yaml
  snuba-consumer:
    <<: *snuba_defaults
    command: consumer --storage errors --auto-offset-reset=latest --max-batch-time-ms 750
```

k8s
```yaml
spec:
  containers:
    - name: sentry-snuba-consumer
      image: getsentry/snuba:22.6.0
      command: ["consumer", "--storage", "errors", "--auto-offset-reset=latest", "--max-batch-time-ms", "750"]
```

