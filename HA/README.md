在运行 [start-all.sh](./start-all.sh) 脚本前，请注意替换当前目录下：

`172.17.183.16` 这个IP为你自己电脑的IP，这个IP是当时我电脑的IP，上面运行了所有中间件。

而对应的中间件地址很可能不在一台机器上，所以，搜索这个IP，替换成你环境的IP或域名。

要容器内能访问的地址。


# 创建用户

```shell
docker-compose run web createuser
```
