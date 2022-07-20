
# 暴露端口

## NodePort方式

使用 [app-deploy-service.yaml](./app-deploy-service.yaml),  本机还是无法访问，需要进到容器里去。

```shell
$ kubectl get service
NAME          TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
bar-service   NodePort    10.96.253.175   <none>        5678:30002/TCP   54m
foo-service   NodePort    10.96.236.251   <none>        5678:30001/TCP   54m
kubernetes    ClusterIP   10.96.0.1       <none>        443/TCP          17h

$ docker exec -it kind-control-plane bash
root@kind-control-plane:/# curl localhost:30001/
foo
```

## hostNetwork

使用[app-deploy-host.yaml](./app-deploy-host.yaml)

看到Pod的IP是 `docker0`网络的，并不是我真实网卡的IP。

```shell
$ kubectl get pod -o wide
NAME      READY   STATUS    RESTARTS   AGE     IP           NODE                 NOMINATED NODE   READINESS GATES
bar-app   1/1     Running   0          2m48s   10.244.0.8   kind-control-plane   <none>           <none>
foo-app   1/1     Running   0          2m48s   172.18.0.2   kind-control-plane   <none>           <none>
```
直接访问是可以的
```shell
$ curl 172.18.0.2:5678
foo
```

## Ingress

没成功。

先安装一个[Ingress Controller](https://kubernetes.github.io/ingress-nginx/deploy/).

查看

```shell
$ kubectl get pods --namespace=ingress-nginx
NAME                                        READY   STATUS              RESTARTS   AGE
ingress-nginx-admission-create-fz9t2        0/1     ImagePullBackOff    0          3h51m
ingress-nginx-admission-patch-bc5pz         0/1     ImagePullBackOff    0          3h51m
ingress-nginx-controller-6bf7bc7f94-7p7mr   0/1     ContainerCreating   0          2m18s
ingress-nginx-controller-86b6d5756c-mwcjz   0/1     ContainerCreating   0          3h51m
```

但是官方的镜像拉不下来，可以参考[博客](https://blog.csdn.net/weixin_43988498/article/details/122792536).

### 修改Ingress端口
默认80冲突了，改为88.

```shell
$ kubectl edit deploy ingress-nginx-controller -n ingress-nginx
deployment.apps/ingress-nginx-controller edited
```
修改
```shell
    spec:
      containers:
      - args:
        - /nginx-ingress-controller
        - --publish-service=$(POD_NAMESPACE)/ingress-nginx-controller
        - --election-id=ingress-controller-leader
        - --controller-class=k8s.io/ingress-nginx
        - --configmap=$(POD_NAMESPACE)/ingress-nginx-controller
        - --validating-webhook=:8443
        - --validating-webhook-certificate=/usr/local/certificates/cert
        - --validating-webhook-key=/usr/local/certificates/key
        - --http-port=88
        - --https-port=8443
```


