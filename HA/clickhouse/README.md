注意：

每次重启CK后，需要再次去snuba里运行建表( `snuba migrations migrate --force` ).
因为这个容器没有外挂volume，`docker-compose down`了就清空了。
