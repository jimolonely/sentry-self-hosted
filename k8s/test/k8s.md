


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

# ImagePullBackOff如何排查

```shell
$ kubectl get pods
NAME               READY   STATUS             RESTARTS       AGE
sentry-web         0/1     ImagePullBackOff   0              4m55s
```
使用 `kubectl describe pod sentry-web` 查看输出：
```shell
$ kubectl describe pod sentry-web
Name:         sentry-web
Namespace:    default
...省略
Events:
  Type     Reason     Age                    From               Message
  ----     ------     ----                   ----               -------
  Normal   Scheduled  4m50s                  default-scheduler  Successfully assigned default/sentry-web to kind-control-plane
  Normal   Pulling    3m14s (x4 over 4m51s)  kubelet            Pulling image "sentry-self-hosted-local"
  Warning  Failed     3m10s (x4 over 4m44s)  kubelet            Failed to pull image "sentry-self-hosted-local": rpc error: code = Unknown desc = failed to pull and unpack image "docker.io/library/sentry-self-hosted-local:latest": failed to resolve reference "docker.io/library/sentry-self-hosted-local:latest": pull access denied, repository does not exist or may require authorization: server message: insufficient_scope: authorization failed
  Warning  Failed     3m10s (x4 over 4m44s)  kubelet            Error: ErrImagePull
  Warning  Failed     2m44s (x6 over 4m43s)  kubelet            Error: ImagePullBackOff
  Normal   BackOff    2m29s (x7 over 4m43s)  kubelet            Back-off pulling image "sentry-self-hosted-local"
```

发现原因是 
```shell
failed to pull and unpack image "docker.io/library/sentry-self-hosted-local:latest"
```

再看我的配置文件：

```yaml
kind: Pod
apiVersion: v1
metadata:
  name: sentry-web
  labels:
    app: sentry
spec:
  hostNetwork: true
  containers:
    - name: sentry-web
      image: sentry-self-hosted-local
```

虽然我本地有，但是他还是去拉远程，原因是我没写tag，同时优先使用本地：

```yaml
spec:
  hostNetwork: true
  containers:
    - name: sentry-web
      image: sentry-self-hosted-local:latest
      imagePullPolicy: Never  # or IfNotPresent
```


# K8s Service和DNS那些事

文档：https://kubernetes.io/zh-cn/docs/concepts/services-networking/connect-applications-service/

先IP

再环境变量

最后DNS

```shell
$ kubectl run curl1 --image=radial/busyboxplus:curl -i --tty
If you don't see a command prompt, try pressing enter.
# 找到
[ root@curl1:/ ]$ nslookup sentry-web
Server:    10.96.0.10
Address 1: 10.96.0.10 kube-dns.kube-system.svc.cluster.local

Name:      sentry-web
Address 1: 10.96.231.203 sentry-web.default.svc.cluster.local

# 找不到
[ root@curl1:/ ]$ nslookup sentry-web
Server:    10.96.0.10
Address 1: 10.96.0.10 kube-dns.kube-system.svc.cluster.local

nslookup: can't resolve 'sentry-web'
```

