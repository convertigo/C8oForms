# No Code Studio

This a is the docker compose version of Convertigo **No Code Studio** (C8oForms) that able you to run it on premises.

- [Pre-requisites](#pre-requisites)
- [Installation guide](#installation-guide)
- [Environment](#environment)
  - [Convertigo No Code Studio](#convertigo-no-code-studio)
  - [Convertigo Server](#convertigo-server)
  - [Workspace](#workspace)
- [Create a new No Code Studio account](#create-a-new-no-code-studio-account)
- [Authentication Active directory](#authentication-active-directory)
- [Backup](#backup)

## Pre-requisites
Linux platform is recommended.

* You need to have access to Internet
* You need to install:
  * Docker Engine<br>[Install Docker Engine on CentOS](https://docs.docker.com/engine/install/centos/)<br> [Install Docker Engine on Debian](https://docs.docker.com/engine/install/debian/)<br>[Install Docker Engine on Fedora](https://docs.docker.com/engine/install/fedora/)<br>[Install Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)<br>
  * Docker Compose<br>[Install Docker Compose on Linux systems](https://docs.docker.com/compose/install/#install-compose-on-linux-systems)
 * You need at least 2 GB of disk space. 20 GB is recommended.

 
## Installation guide 

You can access the **No Code Studio** bundle package [on the release page:](https://github.com/convertigo/C8oForms/releases).

First of all, extract tar.gz (this file is given by a download link in a message):
```shell
tar -xzvf c8oforms_standalone.tar.gz
```

A <em>c8oforms_standalone</em> sub-folder is created after the <em>tar</em> command. You can `cd` inside.

Or you can also download / uncompress in the current directory:
```shell
curl -sL https://github.com/convertigo/C8oForms/releases/download/2.1.0/c8oforms_standalone.tar.gz | tar xvz --strip-components=1
```

Before the first run, edit the hidden file `.env` to set a correct `PUBLIC_HOSTNAME`, the host you will use to access the No Code Studio from a web browser.

Then start-up docker:
```shell
docker-compose up -d
```

You have to wait about 2-3 minutes for the environment to finish setting up to start.

The **Node Code Studio** is up at `http://<PUBLIC_HOSTNAME>/`.

To shutdown docker,and stop the **No Code Studio**, run:
```shell
docker-compose down
```

## Environment
### Convertigo No Code Studio
  - To login into **Convertigo No Code Studio** you can either [create a new account](#create-a-new-no-code-studio-account) or [setup authentication with active directory](#authentication-active-directory)

### Convertigo Server

  - Root url: `http://<PUBLIC_HOSTNAME>/convertigo/`
  - Administration url: `http://<PUBLIC_HOSTNAME>/convertigo/admin/` <br>login: _admin_  password: _admin_

### Workspace

  - You can find your _workspace_ into folder `data/workspace`.
  - This workspace contains all Convertigo user data: the projects, the configuration files, the logs, etc.

## Create a new No Code Studio account
Go to the Convertigo Administration and login,
then navigate to Test Platform, and click on _C8Oforms_, execute sequence **AddUser** with user email and password.

Be careful to use an email like `myemail@mail.com`. If you don't, you won't be able to login. 

## Authentication Active directory

You have to configure project _lib_UserManager_ .
To do so go to the Convertigo Administration.
Then, click on project on the left hand side to access to project list view. On the left side of _lib_UserManager_ project, you will see a red warning icon, click on it to create symbols.

Now that its done, click on symbols on the left hand side.

You will have to define 3 symbols:  
* lib_UserManager.adminUser
  * This user must be an active directory account, who has at least read only access right, and so can execute research on whole tree (expected syntax is DOMAIN_NAME\USER)
* lib_UserManager.adminPassword.secret
  * Password of our active directory user
* lib_UserManager.ldapServer
  * Url of LDAP server such as ldap://**LDAP_SERVER**:389


## Backup

Directories to save in the event of a machine crash :

- All the _data_ directory. This contains all the specifics parameters as well as the symbols set, databases used for **No Code Studio**. In particular the definitions of forms, users, rights, ... 

Restoration is easy. It consists of replacing the installed directories with those saved.
