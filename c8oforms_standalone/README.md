# C8o Forms Standalone #

This a is the dockerized version of Convertigo forms that able you tu run it on premises.

- [C8o Forms Standalone](#c8o-forms-standalone)
  - [Pre-requisites](#pre-requisites)
  - [Installation guide](#installation-guide)
  - [Environnement](#environnement)
    - [C8oForms](#c8oforms)
    - [Convertigo Server](#convertigo-server)
    - [Couchdb fauxton](#couchdb-fauxton)
    - [Workspace](#workspace)
  - [Create a new c8oforms account](#create-a-new-c8oforms-account)
  - [Authentication Active directory](#authentication-active-directory)

## Pre-requisites ##
Linux platform is recommended.

* You need to have acces to internet
* You need to install:
  * Docker Engine
     * [Install Docker Engine on CentOS](https://docs.docker.com/engine/install/centos/)
     * [Install Docker Engine on Debian](https://docs.docker.com/engine/install/debian/)
     * [Install Docker Engine on Fedora](https://docs.docker.com/engine/install/fedora/)
     * [Install Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
  * Docker Compose
     * [Install Docker Compose on Linux systems](https://docs.docker.com/compose/install/#install-compose-on-linux-systems)

 
## Installation guide ##

First of all, extract tar.gz
```shell
$ tar -xzvf c8oforms_standalone.tar.gz
```
Then, start docker as a deamon
 ```shell
$ systemctl start docker
```
Then, make sur you have correct permissions on folder c8oforms_standalone (Read/Write/Execute)
 ```shell
$ sudo chmod -R 777 ./c8oforms_standalone
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

You maight wait about 5 minutes before whole environement fished setup after starting...

Go to [convertigo Administration](#convertigo-server), into projects to check that all projects has been loaded.
After 5 minutes you must see following projects:
* C8Oforms
* lib_ExtendedComponents
* lib_FullSyncGrp
* lib_UserManager
* lib_OAuth

To shutdown docker exit process and run:
```shell
$ docker-compose down
```



## Environnement ##
You maight wait about 5 minutes before whole environement fished setup after starting..

When previous step is done you can access to:
### C8oForms ###
  - url: [http://localhost:28080/convertigo/projects/C8Oforms/DisplayObjects/mobile/index.html](http://localhost:28080/convertigo/projects/C8Oforms/DisplayObjects/mobile/index.html)
  - To login into forms you can either [create a new account]() or [setup authentication with active directory](#authentication-active-directory)
### Convertigo Server ###
  - root url: [http://localhost:28080/convertigo/](http://localhost:28080/convertigo/)
  - administration url: [http://localhost:28080/convertigo/admin/main.html](http://localhost:28080/convertigo/admin/main.html)
  - login: admin
  - password: admin
### Couchdb fauxton ###
  - url: [http://localhost:28081/_utils](http://localhost:28081/_utils)
  - login: admin
  - password: fullsyncpassword
### Workspace ###
you can find your workspace into folder c8oforms_standalone

## Create a new c8oforms account ##
Go to [convertigo administration](#convertigo-server) and login,
then navigate to test platform, and click on lib_UserManager, execute sequence AddUser with user email and password

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
