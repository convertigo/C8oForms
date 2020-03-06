# C8o Forms Standalone #

This a is the dockerized version of Convertigo forms that able you tu run it on premises.

- [C8o Forms Standalone](#c8o-forms-standalone)
  - [Pre-requisites](#pre-requisites)
  - [Installation guide](#installation-guide)
  - [Environnement](#environnement)
    - [C8oForms](#c8oforms)
    - [Convertigo Server](#convertigo-server)
    - [Couchdb fauxton](#couchdb-fauxton)
  - [Authentication Active directory](#authentication-active-directory)

## Pre-requisites ##
You need to install docker and docker-compose
## Installation guide ##

First of all, extract tar.gz
```shell
$ tar -xzvf c8oforms_standalone.tar.gz
```
Then, start docker as a deamon
 ```shell
$ systemctl start docker
```
Then, navigate to folder, and start-up docker
```shell
$ cd c8oforms_standalone
$ docker-compose up -d
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
### C8oForms ###
  - url: https://localhost:28080/convertigo/projects/C8Oforms/DisplayObjects/mobile/index.html
### Convertigo Server ###
  - url http://localhost:28080/convertigo/ 
  - login: admin
  - password: admin
### Couchdb fauxton ###
  - url: http://localhost:28081/_utils
  - login: admin
  - password: fullsyncpassword

## Authentication Active directory ##

Before configuring symboles ensure that you have write right on workspace folder !

You have to configure project lib_UserManager project, to do so go to convertigo admin console: https://localhost:28080/convertigo/admin/login.html and type [login and password](#convertigo-server).
Then, click on project on the left hand side to access to project list view. On the left side of lib_UserManager project, you will se a red warning icon, click on it to create symbols.
Now that its done, click on symbols on the left hand side.
You will have to define 3 symbols:  
* lib_UserManager.adminUser
  * This user must be an active directory account, who has at least read only access right, and so can execute research and whole tree 
* lib_UserManager.adminPassword.secret
  * Password of our active directory user
* lib_UserManager.ldapServer
  * url of LDAP server such as ldap://localhost:389
