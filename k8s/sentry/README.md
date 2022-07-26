
# 先看这

国外有人实践过：[https://uala.io/how-to-install-sentry-20-in-kubernetes/](https://uala.io/how-to-install-sentry-20-in-kubernetes/)

使用开源的helm：[https://github.com/sentry-kubernetes/charts](https://github.com/sentry-kubernetes/charts)

不过目前helm还没学习，难以继续。

本地用Kind搭的k8s集群问题也挺多。


# 创建Kind集群

挂载个目录

```shell
kind create cluster --config kind-cluster.yaml

$ kind get clusters
kind
```

然后我们进容器去看目录是否挂载成功：

```shell
$ docker exec -it kind-control-plane bash
root@kind-control-plane:/# ll /sentry/
total 40
drwxrwxr-x 5 1000 1000  4096 Jul 26 04:37 ./
drwxr-xr-x 1 root root  4096 Jul 26 04:36 ../
-rw-rw-r-- 1 1000 1000  3312 Jul 26 04:37 README.md
drwxrwxr-x 2 1000 1000  4096 Jul 20 09:18 geoip/
-rw-rw-r-- 1 1000 1000   277 Jul 26 04:34 kind-cluster.yaml
drwxrwxr-x 2 1000 1000  4096 Jul 22 01:33 relay/
drwxrwxrwx 2 1000 1000  4096 Jul 25 01:11 sentry/
-rw-rw-r-- 1 1000 1000 12158 Jul 22 00:56 sentry-deploy.yaml
```

# 加载镜像到kind里

```shell
$ kind load docker-image snuba-cleanup-self-hosted-local
Image: "snuba-cleanup-self-hosted-local" with ID "sha256:53dcb46d5c2f7c7c6834c1fa4e6c3fb1202aac5455adea8b7b54ffca91941b87" not yet present on node "kind-control-plane", loading...
```

```shell
kind load docker-image getsentry/snuba:22.6.0
kind load docker-image getsentry/relay:22.6.0
kind load docker-image getsentry/sentry:22.6.0
kind load docker-image getsentry/symbolicator:0.5.1
kind load docker-image snuba-cleanup-self-hosted-local
kind load docker-image sentry-self-hosted-local
kind load docker-image sentry-cleanup-self-hosted-local
kind load docker-image symbolicator-cleanup-self-hosted-local
kind load docker-image nginx:1.21.6-alpine
```

# 查看Kind加载了哪些镜像

进到容器里用 `crictl`看
```shell
root@kind-control-plane:/# crictl images
IMAGE                                      TAG                  IMAGE ID            SIZE
docker.io/kindest/kindnetd                 v20220510-4929dd75   6fb66cd78abfe       45.2MB
docker.io/kindest/local-path-helper        v20220512-507ff70b   64623e9d887d3       2.86MB
docker.io/kindest/local-path-provisioner   v0.0.22-kind.0       4c1e997385b8f       17.4MB
k8s.gcr.io/coredns/coredns                 v1.8.6               a4ca41631cc7a       13.6MB
k8s.gcr.io/etcd                            3.5.3-0              aebe758cef4cd       102MB
k8s.gcr.io/kube-apiserver                  v1.24.0              9ef4b1de3be49       77.3MB
k8s.gcr.io/kube-controller-manager         v1.24.0              efa8a439d1460       65.6MB
k8s.gcr.io/kube-proxy                      v1.24.0              6960c0e47829d       112MB
k8s.gcr.io/kube-scheduler                  v1.24.0              41f5241e3396e       52.3MB
k8s.gcr.io/pause                           3.6                  6270bb605e12e       302kB
```

可以看看 crictl是什么

```shell
crictl -h    
NAME:
   crictl - client for CRI

USAGE:
   crictl [global options] command [command options] [arguments...]

VERSION:
   v1.24.0

COMMANDS:
   attach              Attach to a running container
   create              Create a new container
   exec                Run a command in a running container
   version             Display runtime version information
   images, image, img  List images
   inspect             Display the status of one or more containers
   inspecti            Return the status of one or more images
   imagefsinfo         Return image filesystem info
   inspectp            Display the status of one or more pods
   logs                Fetch the logs of a container
   port-forward        Forward local port to a pod
   ps                  List containers
   pull                Pull an image from a registry
   run                 Run a new container inside a sandbox
   runp                Run a new pod
   rm                  Remove one or more containers
   rmi                 Remove one or more images
   rmp                 Remove one or more pods
   pods                List pods
   start               Start one or more created containers
   info                Display information of the container runtime
   stop                Stop one or more running containers
   stopp               Stop one or more running pods
   update              Update one or more running containers
   config              Get and set crictl client configuration options
   stats               List container(s) resource usage statistics
   statsp              List pod resource usage statistics
   completion          Output shell completion code
   help, h             Shows a list of commands or help for one command

GLOBAL OPTIONS:
   --config value, -c value            Location of the client config file. If not specified and the default does not exist, the program's directory is searched as well (default: "/etc/crictl.yaml") [$CRI_CONFIG_FILE]
   --debug, -D                         Enable debug mode (default: false)
   --image-endpoint value, -i value    Endpoint of CRI image manager service (default: uses 'runtime-endpoint' setting) [$IMAGE_SERVICE_ENDPOINT]
   --runtime-endpoint value, -r value  Endpoint of CRI container runtime service (default: uses in order the first successful one of [unix:///var/run/dockershim.sock unix:///run/containerd/containerd.sock unix:///run/crio/crio.sock unix:///var/run/cri-dockerd.sock]). Default is now deprecated and the endpoint should be set instead. [$CONTAINER_RUNTIME_ENDPOINT]
   --timeout value, -t value           Timeout of connecting to the server in seconds (e.g. 2s, 20s.). 0 or less is set to default (default: 2s)
   --help, -h                          show help (default: false)
   --version, -v                       print the version (default: false)
```

# 创建集群sentry pod

```shell
$ kubectl apply -f sentry-deploy.yaml 
```

# 创建PG表

可以看到sentry容器的命令：

进入 `sentry-web`
```shell
/# sentry 
Usage: sentry [OPTIONS] COMMAND [ARGS]...

  Sentry is cross-platform crash reporting built with love.

  The configuration file is looked up in the `~/.sentry` config directory but this can be
  overridden with the `SENTRY_CONF` environment variable or be explicitly provided through the
  `--config` parameter.

Options:
  --config PATH  Path to configuration files.
  --version      Show the version and exit.
  --help         Show this message and exit.

Commands:
  cleanup       Delete a portion of trailing data based on creation date.
  config        Manage runtime config options.
  createuser    Create a new user.
  devserver     Starts a lightweight web server for development.
  devservices   Manage dependent development services required for Sentry.
  django        Execute Django subcommands.
  exec          Execute a script.
  execfile      Execute a script.
  export        Exports core metadata for the Sentry installation.
  files         Manage files from filestore.
  help          Show this message and exit.
  import        Imports data from a Sentry export.
  init          Initialize new configuration directory.
  killswitches  Manage killswitches for ingestion pipeline.
  migrations    Manage migrations.
  permissions   Manage Permissions for Users.
  plugins       Manage Sentry plugins.
  queues        Manage Sentry queues.
  repair        Attempt to repair any invalid data.
  run           Run a service.
  shell         Run a Python interactive interpreter.
  start         DEPRECATED see `sentry run` instead.
  tsdb          Tools for interacting with the time series database.
  upgrade       Perform any pending database migrations and upgrades.
```

在外面初始化库表可以用 `upgrade`:

```shell
 kubectl exec sentry-web sentry upgrade
```

# 创建用户

```shell
 kubectl exec sentry-web sentry createuser
```

# 创建CK表

任意一个snuba服务起来后就可以进去执行：

```shell
snuba migrations migrate --force
```

# 创建Kafka Topic

在snuba源码 `topics.py`里定义了默认主题：

```python
class Topic(Enum):
    EVENTS = "events"
    EVENT_REPLACEMENTS = "event-replacements"
    COMMIT_LOG = "snuba-commit-log"
    CDC = "cdc"
    TRANSACTIONS = "transactions"
    TRANSACTIONS_COMMIT_LOG = "snuba-transactions-commit-log"
    METRICS = "snuba-metrics"
    OUTCOMES = "outcomes"
    SESSIONS = "ingest-sessions"
    METRICS_COMMIT_LOG = "snuba-metrics-commit-log"
    SUBSCRIPTION_SCHEDULED_EVENTS = "scheduled-subscriptions-events"
    SUBSCRIPTION_SCHEDULED_TRANSACTIONS = "scheduled-subscriptions-transactions"
    SUBSCRIPTION_SCHEDULED_METRICS = "scheduled-subscriptions-metrics"
    SUBSCRIPTION_RESULTS_EVENTS = "events-subscription-results"
    SUBSCRIPTION_RESULTS_TRANSACTIONS = "transactions-subscription-results"
    SUBSCRIPTION_RESULTS_METRICS = "metrics-subscription-results"
    QUERYLOG = "snuba-queries"
    PROFILES = "processed-profiles"
    PROFILES_FUNCTIONS = "profiles-call-tree"
    REPLAYEVENTS = "snuba-replay-events"
    GENERIC_METRICS = "snuba-generic-metrics"
    GENERIC_METRICS_SETS_COMMIT_LOG = "snuba-generic-metrics-sets-commit-log"
    GENERIC_METRICS_DISTRIBUTIONS_COMMIT_LOG = (
        "snuba-generic-metrics-distributions-commit-log"
    )

    DEAD_LETTER_QUEUE_INSERTS = "snuba-dead-letter-inserts"
    DEAD_LETTER_METRICS = "snuba-dead-letter-metrics"
    DEAD_LETTER_SESSIONS = "snuba-dead-letter-sessions"
    DEAD_LETTER_GENERIC_METRICS = "snuba-dead-letter-generic-metrics"
```

进入kafka命令行创建主题
```shell
kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic $topic 

kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic cdc
kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic event-replacements
kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic events
kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic events-subscription-results
kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic ingest-attachments
kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic ingest-events
kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic ingest-sessions
kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic ingest-transactions
kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic metrics-subscription-results
kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic outcomes
kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic processed-profiles
kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic scheduled-subscriptions-events
kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic scheduled-subscriptions-metrics
kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic scheduled-subscriptions-transactions
kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic snuba-commit-log
kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic snuba-dead-letter-inserts
kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic snuba-dead-letter-metrics
kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic snuba-dead-letter-sessions
kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic snuba-metrics
kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic snuba-metrics-commit-log
kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic snuba-queries
kafka-topics --create --bootstrap-server 172.17.183.16:9092 --topic transactions-subscription-results
```

# pog服务展示

下面没把cleanup服务展示出来，事实上我根本没起。

```shell
$ kubectl get pods -o wide
NAME                                              READY   STATUS    RESTARTS        AGE    IP             NODE                 NOMINATED NODE   READINESS GATES
cr                                                1/1     Running   3 (4m31s ago)   3h4m   10.244.0.18    kind-control-plane   <none>           <none>
sentry-cron                                       1/1     Running   0               13m    10.244.0.116   kind-control-plane   <none>           <none>
sentry-ingest-consumer                            1/1     Running   0               13m    10.244.0.108   kind-control-plane   <none>           <none>
sentry-nginx                                      1/1     Running   0               24s    10.244.0.121   kind-control-plane   <none>           <none>
sentry-post-process-forwarder                     1/1     Running   0               13m    10.244.0.110   kind-control-plane   <none>           <none>
sentry-relay                                      1/1     Running   0               13m    10.244.0.102   kind-control-plane   <none>           <none>
sentry-snuba-api                                  1/1     Running   0               13m    10.244.0.105   kind-control-plane   <none>           <none>
sentry-snuba-consumer                             1/1     Running   0               13m    10.244.0.107   kind-control-plane   <none>           <none>
sentry-snuba-outcomes-consumer                    1/1     Running   0               13m    10.244.0.103   kind-control-plane   <none>           <none>
sentry-snuba-replacer                             1/1     Running   0               13m    10.244.0.109   kind-control-plane   <none>           <none>
sentry-snuba-sessions-consumer                    1/1     Running   0               13m    10.244.0.106   kind-control-plane   <none>           <none>
sentry-snuba-subscription-consumer-events         1/1     Running   0               13m    10.244.0.115   kind-control-plane   <none>           <none>
sentry-snuba-subscription-consumer-transactions   1/1     Running   0               13m    10.244.0.113   kind-control-plane   <none>           <none>
sentry-snuba-transactions-consumer                1/1     Running   0               13m    10.244.0.104   kind-control-plane   <none>           <none>
sentry-subscription-consumer-events               1/1     Running   0               13m    10.244.0.111   kind-control-plane   <none>           <none>
sentry-subscription-consumer-transactions         1/1     Running   0               13m    10.244.0.114   kind-control-plane   <none>           <none>
sentry-web                                        1/1     Running   0               13m    10.244.0.117   kind-control-plane   <none>           <none>
sentry-worker                                     1/1     Running   0               13m    10.244.0.112   kind-control-plane   <none>           <none>

$ kubectl get svc -o wide
NAME               TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)        AGE     SELECTOR
kubernetes         ClusterIP   10.96.0.1      <none>        443/TCP        7h24m   <none>
sentry-nginx       NodePort    10.96.78.233   <none>        80:30001/TCP   5m10s   app=sentry-nginx
sentry-relay       ClusterIP   10.96.23.77    <none>        3000/TCP       18m     app=sentry-relay
sentry-snuba-api   ClusterIP   10.96.50.229   <none>        1218/TCP       18m     app=sentry-snuba-api
sentry-web         ClusterIP   10.96.57.169   <none>        9000/TCP       18m     app=sentry-web
```

# 访问sentry-web

我们设置了一个 `sentry-nginx` 服务，将其Service类型设为 `NodePort`.

通过查看集群IP，我们可以访问nginx
```shell
$ kubectl get nodes -o wide
NAME                 STATUS   ROLES           AGE     VERSION   INTERNAL-IP   EXTERNAL-IP   OS-IMAGE       KERNEL-VERSION      CONTAINER-RUNTIME
kind-control-plane   Ready    control-plane   7h20m   v1.24.0   172.18.0.2    <none>        Ubuntu 21.10   5.15.0-41-generic   containerd://1.6.4
```
浏览器访问：[http://172.18.0.2:30001](http://172.18.0.2:30001)


# 排查错误


## 日志
比如 Error了，看日志知道是因为Kafka缺少Topic。

```shell
$ kubectl logs sentry-snuba-consumer
2022-07-20 09:18:51,152 Consumer Starting
2022-07-20 09:18:51,152 librdkafka log level: 6
2022-07-20 09:18:51,161 Caught ConsumerError('KafkaError{code=UNKNOWN_TOPIC_OR_PART,val=3,str="Subscribed topic not available: events: Broker: Unknown topic or partition"}'), shutting down...
2022-07-20 09:18:51,161 Closing <snuba.utils.streams.kafka_consumer_with_commit_log.KafkaConsumerWithCommitLog object at 0x7ffaa6ce7e20>...
2022-07-20 09:18:51,161 Processor terminated
Traceback (most recent call last):
  File "/usr/local/bin/snuba", line 33, in <module>
    sys.exit(load_entry_point('snuba', 'console_scripts', 'snuba')())
  File "/usr/local/lib/python3.8/site-packages/click/core.py", line 1128, in __call__
    return self.main(*args, **kwargs)
  File "/usr/local/lib/python3.8/site-packages/click/core.py", line 1053, in main
    rv = self.invoke(ctx)
  File "/usr/local/lib/python3.8/site-packages/click/core.py", line 1659, in invoke
    return _process_result(sub_ctx.command.invoke(sub_ctx))
  File "/usr/local/lib/python3.8/site-packages/click/core.py", line 1395, in invoke
    return ctx.invoke(self.callback, **ctx.params)
  File "/usr/local/lib/python3.8/site-packages/click/core.py", line 754, in invoke
    return __callback(*args, **kwargs)
  File "/usr/src/snuba/snuba/cli/consumer.py", line 188, in consumer
    consumer.run()
  File "/usr/local/lib/python3.8/site-packages/arroyo/processing/processor.py", line 121, in run
    self._run_once()
  File "/usr/local/lib/python3.8/site-packages/arroyo/processing/processor.py", line 151, in _run_once
    self.__message = self.__consumer.poll(timeout=1.0)
  File "/usr/src/snuba/snuba/utils/streams/kafka_consumer_with_commit_log.py", line 29, in poll
    return super().poll(timeout)
  File "/usr/local/lib/python3.8/site-packages/arroyo/backends/kafka/consumer.py", line 449, in poll
    raise ConsumerError(str(error))
arroyo.errors.ConsumerError: KafkaError{code=UNKNOWN_TOPIC_OR_PART,val=3,str="Subscribed topic not available: events: Broker: Unknown topic or partition"}
```

## 环境变量

比如服务DNS找不到服务，重启pod后就有了。

```shell
$ kubectl exec sentry-relay -- printenv
 PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
HOSTNAME=sentry-relay
RELAY_UID=10001
RELAY_GID=10001
KUBERNETES_SERVICE_PORT_HTTPS=443
KUBERNETES_PORT=tcp://10.96.0.1:443
KUBERNETES_PORT_443_TCP=tcp://10.96.0.1:443
KUBERNETES_PORT_443_TCP_ADDR=10.96.0.1
SENTRY_WEB_SERVICE_HOST=10.96.231.203
SENTRY_WEB_PORT_9000_TCP=tcp://10.96.231.203:9000
KUBERNETES_SERVICE_HOST=10.96.0.1
KUBERNETES_PORT_443_TCP_PROTO=tcp
SENTRY_WEB_PORT_9000_TCP_PORT=9000
SENTRY_WEB_PORT_9000_TCP_ADDR=10.96.231.203
KUBERNETES_SERVICE_PORT=443
KUBERNETES_PORT_443_TCP_PORT=443
SENTRY_WEB_SERVICE_PORT=9000
SENTRY_WEB_PORT=tcp://10.96.231.203:9000
SENTRY_WEB_PORT_9000_TCP_PROTO=tcp
HOME=/root
```




