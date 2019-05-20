install redis on linux
$ wget http://download.redis.io/releases/redis-5.0.5.tar.gz
$ tar xzf redis-5.0.5.tar.gz
$ cd redis-5.0.5
$ make

to run redis server
$ src/redis-server

to run redis cli
$ src/redis-cli
redis> set foo bar
OK
redis> get foo
"bar"