# C8o Forms Standalone #

This a is the dockerized version of Convertigo forms that able you tu run it on premises.

- [C8o Forms Standalone](#c8o-forms-standalone)
  - [Pre-requisites](#pre-requisites)
  - [Installation guide](#installation-guide)
  - [Environment](#environment)
    - [Convertigo Form Builder](#convertigo-form-builder)
    - [Convertigo Server](#convertigo-server)
    - [Couchdb fauxton](#couchdb-fauxton)
    - [Workspace](#workspace)
  - [Create a new  Convertigo Form Builder account](#create-a-new-convertigo-form-builder-account)
  - [Authentication Active directory](#authentication-active-directory)
  - [Add your certificates store](#add-your-certificates-store)
  - [Backup](#backup)

## Pre-requisites
Linux platform is recommended.

* You need to have access to internet
* You need to install:
  * Docker Engine<br>[Install Docker Engine on CentOS](https://docs.docker.com/engine/install/centos/)<br> [Install Docker Engine on Debian](https://docs.docker.com/engine/install/debian/)<br>[Install Docker Engine on Fedora](https://docs.docker.com/engine/install/fedora/)<br>[Install Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)<br>
  * Docker Compose<br>[Install Docker Compose on Linux systems](https://docs.docker.com/compose/install/#install-compose-on-linux-systems)
 * You need at least 2 GB of disk space. 20 GB is recommended.

 
## Installation guide 

You can access the Form Builder Repository [here :](https://c8oforms.s3-eu-west-3.amazonaws.com/index.html).

First of all, extract tar.gz (this file is given by a download link in a message) :
```shell
$ tar -xzvf c8oforms_standalone.tar.gz
```
{{site.data.alerts.note}}
A <em>c8oforms_standalone</em> sub-folder is created after the <em>tar</em> command.
{{site.data.alerts.end}}


Then, start docker as a deamon :
 ```shell
$ systemctl start docker
```
Then, make sure you have correct permissions on folder _c8oforms_standalone_ (read/write/execute)

 ```shell
$ sudo chmod -R 777 ./c8oforms_standalone
```
Then, navigate to folder, and start-up docker :
```shell
$ cd c8oforms_standalone
$ docker-compose up -d
```
When its done, on first launch you must configure **couchdb**. You can either use _init_couchdb.sh_ that configure for you automatically **couchdb** in single-node mode :
```shell
$ ./init_couchdb.sh
```
You can also configure it by using [fauxton](#couchdb-fauxton).

You have to wait about 5 minutes for the environment to finish setting up to start.

Go to [Convertigo administration](../using-convertigo-administration-console/#projects-page), into projects to check that all projects has been loaded.
After 5 minutes you must see following projects:

{% include image.html file="guide_img/projectsPageForms.png" caption="Figure: Projects Form Builder" %}

Convertigo projects used by **Convertigo Form Builder** are:

- C8Oforms
- lib_ExtendedComponents
- lib_FullSyncGrp
- lib_UserManager
- lib_OAuth

To shutdown docker,and stop **Convertigo Form Builder**, run:
```shell
$ docker-compose down
```


## Environment
### Convertigo Form Builder
  - Connect to url: [http://**your_server**:28080/convertigo/projects/C8Oforms/DisplayObjects/mobile/index.html](http://localhost:28080/convertigo/projects/C8Oforms/DisplayObjects/mobile/index.html) or [https://**your_server**/convertigo/projects/C8Oforms/DisplayObjects/mobile/index.html](https://localhost/convertigo/projects/C8Oforms/DisplayObjects/mobile/index.html)
  - To login into **Convertigo Form Builder** you can either [create a new account](#create-a-new-c8oforms-account) or [setup authentication with active directory](#authentication-active-directory)

  {{site.data.alerts.note}}
The installation uses with https connection a self-signed certificate. There will be security alerts when a connection will be done with https. You can add your own certificate. See section <a href="./#add-your-certificates-store">Add your certificates store</a>.
{{site.data.alerts.end}}

### Convertigo Server

  - Root url: [http://**your_server**:28080/convertigo/](http://localhost:28080/convertigo/) or [https://**your_server**/convertigo/](https://localhost/convertigo/)
  - Administration url: [http://**your_server**:28080/convertigo/admin/main.html](http://localhost:28080/convertigo/admin/main.html) or [https://**your_server**/convertigo/admin/main.html](http://localhost/convertigo/admin/main.html) <br>login: _admin_  password: _admin_

### Couchdb fauxton

  - Connect to url: <a href="http://localhost:28081/_utils">http://your_server:28081/_utils</a><br>login: _admin_  password: _fullsyncpassword_
  - The Couchdb directory which includes databases is in folder _c8oforms_standalone/couchdb_.

### Workspace

  - You can find your _workspace_ into folder _c8oforms_standalone/workspace_.
  - This workspace contains all Convertigo user data: the projects, the configuration files, the logs, etc.

## Create a new  Convertigo Form Builder account 
Go to [convertigo administration](../using-convertigo-administration-console/#accessing-the-administration-console) and login,
then navigate to test platform, and click on _lib_UserManager_, execute sequence **AddUser** with user email and password.

{% include image.html file="guide_img/projectsPageCreateAccountForms.png" caption="Figure: CreateAccount Form Builder" %}



Be careful to use an email like "myemail@mail.com". If you don't, you won't be able to login. 

## Authentication Active directory

{{site.data.alerts.note}}
Before configuring symbols ensure that you have write rights on workspace folder.
{{site.data.alerts.end}}

You have to configure project _lib_UserManager_ .
To do so go to convertigo admin console: http://**your_server**:28080/convertigo/admin/login.html and type [login and password](../using-convertigo-administration-console/#accessing-the-administration-console).
Then, click on project on the left hand side to access to project list view. On the left side of _lib_UserManager_ project, you will se a red warning icon, click on it to create symbols.

{% include image.html file="guide_img/UserManagerForms.png" caption="Figure: Symbols UserManager 1" %}

Now that its done, click on symbols on the left hand side.

{% include image.html file="guide_img/UserManagerSymbols.png" caption="Figure: Symbols UserManager 2" %}


You will have to define 3 symbols:  
* lib_UserManager.adminUser
  * This user must be an active directory account, who has at least read only access right, and so can execute research on whole tree (expected synthax is DOMAIN_NAME\USER)
* lib_UserManager.adminPassword.secret
  * Password of our active directory user
* lib_UserManager.ldapServer
  * Url of LDAP server such as ldap://**LDAP_SERVER**:389


## Add your certificates store

With default installation, a self-signed certificate is embedded. This configuration enables **https** connections but induces a security alert in your browser.

You can add your certificates store in _c8oforms_standalone/tomcat/conf_.
If you don't have a certificates store but the site certificate, you can insert it in **certificates.jks** by using specifics [openssl](https://wiki.openssl.org/index.php/Command_Line_Utilities)  and  [keytool](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/keytool.html).commands.

You have to modify the file _c8oforms_standalone/tomcat/conf/server.xml_.

In this file, find the following section:

```xml
<Connector port="8443" protocol="HTTP/1.1" SSLEnabled="true"
               maxThreads="150" scheme="https" secure="true"
               clientAuth="false" sslProtocol="TLS"
               keystoreFile="conf/certificates.jks" keystorePass="password" />
```
Change the ***keystoreFile*** with the name of your jks store and the ***keystorePass*** too.

The modification will be validated after a restart of the container :

```shell
$ docker-compose down
Stopping c8oforms_standalone_convertigo_1 ... done
Stopping c8oforms_standalone_couchdb_1    ... done
Removing c8oforms_standalone_convertigo_1 ... done
Removing c8oforms_standalone_couchdb_1    ... done
Removing network c8oforms_standalone_default
$ docker-compose up -d
Creating network "c8oforms_standalone_default" with the default driver
Creating c8oforms_standalone_couchdb_1 ... done
Creating c8oforms_standalone_convertigo_1 ... done
```

To see if your certificate store is correctly validated, look at the log files in  _c8oforms_standalone/tomcat/logs/catalina.date.log_

Info log file, you have to find :
```log
org.apache.coyote.AbstractProtocol.init Initializing ProtocolHandler ["https-jsse-nio-8443"]
```
with no exception after.


## Backup

Directories to save in the event of a machine crash :

- All the _workspace_ directory except logs folder. This contains all the specifics parameters as well as the symbols set.
- All the _couchdb_ directory. This directory contains all the databases used for Convertigo Form Builder. In particular the definitions of forms, users, rights, ... 
- The _tomcat/conf_ directory, only if you have changed the configuration like add a certificate store.

Restoration is easy. It consists of replacing the installed directories with those saved.
