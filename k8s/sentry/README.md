
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
kind load docker-image sentry-self-hosted-local
kind load docker-image sentry-cleanup-self-hosted-local
kind load docker-image symbolicator-cleanup-self-hosted-local
```


# 排查错误

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



