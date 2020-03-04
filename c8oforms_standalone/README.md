# C8o Forms Standalone #

This a is the dockerized version of Convertigo forms that able you tu run it on premises.

- [C8o Forms Standalone](#c8o-forms-standalone)
  - [Installation guide](#installation-guide)
  - [Environnement](#environnement)

## Installation guide ##

First of all, extract tar.gz
```shell
$ tar -xzvf c8oforms_standalone.tar.gz
```
Then, navigate to folder, and startup docker
```shell
$ cd c8oforms_standalone
$ docker-compose up --build -d
```
When its done, on first launch you must to configure couchdb you can either use init_couchdb.sh that configure for you automatically couchdb in single node mode.
```shell
$ ./init_couchdb.sh
```
or configure it manually by using fauxton.

To shutdown docker exit process and run:
```shell
$ docker-compose down
```

## Environnement ##

When previous step is done you can access to:
- C8oForms
  - url: https://localhost:28080/convertigo/projects/C8Oforms/DisplayObjects/mobile/index.html
- Convertigo Server: http://localhost:28080/convertigo/
  - login: admin
  - password: admin
- Couchdb fauxton at: http://localhost:28081/_utils
  - login: admin
  - password: fullsyncpassword
