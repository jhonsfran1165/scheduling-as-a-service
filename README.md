
# Why this repo exist?

The job manager is one of the most important services in the WhaleandJaguar infrastructure. The reason why is that important is because it helps to
orchrestate jobs from different systems. From sending an email to recruiting payments. It's created with nodejs and [agenda js](https://github.com/agenda/agenda).

This repository is the quickest way to get started with the [Job Manager][6] and its supporting services in a local development environment.

---

## Prerequisites

- Running [Oceana Mongo Database][11]
- [GNU Make](https://www.gnu.org/software/make/) - Version 4.2
  - MacOS and Linux users will have a suitable version bundled with the OS
  - Windows 10 users: [See this section for more info](#gnumake-in-windows-10-enviroments)
- Bourne Shell and POSIX tools (sh, grep, sed, awk, etc)
  - MacOS and Linux users will have a suitable version bundled with the OS
- [Git][5]
- [Docker][0] | [Docker for Mac][1] | [Docker for Windows][2]
- A [Bitbucket](https://bitbucket.org) account with a [configured SSH key](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

---

## Getting started

Clone this repository, and then run `make` in the root directory. If all goes well, it will take some time to download and start all the components running on your computer through Docker.

```sh
git clone git@bitbucket.org:oceana-wj/jobmanager.git
cd jobmanager
make init
```

Once make-init finished you can set the .env file with the proper variables. Then you can exec make start

```sh
make start
```

Behind the scenes `make` is

- checking that all dependencies needed are present
- downloading Docker images
- starting services

These services will be running when the initial `make` command is complete:

---

## Services description

| Service                                       | Description                                   |
| --------------------------------------------- | --------------------------------------------- |
| [Jobmanager][6] (http://localhost:9000)   | Job manager running with Docker    |

---

## Environment variables

If you want to create a custom environment variable before you start the project, you have to change the .env file present on the root directory after exec make init. That way when you start the project docker is going to read that configuration and start the containers with the variables provided.

⚠️ **BE CAREFUL** ⚠️ Don't change the .env.example -> exec make init and then change the .env file

If the `make` command fails at some point, you can run or rerun it again with:

```sh
make init
```

---

## Project Commands

These are the available `make` commands in the root directory.

| Command                     | Description                                                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `make`                      | Bootstraps all services.                                                                                               |
| `make init`                 | Bootstraps the databases service environment in Docker. Projects will use development configuration.                   |
| `make init-<service-name>`  | Example: `make init-jobmanager`. Does setup for a single project and configures it with a development configuration. |
| `make stop`                 | Stops all containers.                                                                                                  |
| `make stop-<service-name>`  | Example: `make stop-jobmanager`. Stops all containers for a single project.                                          |
| `make start`                | Starts all containers.                                                                                                 |
| `make start-<service-name>` | Example: `make start-jobmanager`. Starts all containers for a single project.                                        |
| `make list`                 | Example: `make list`. List all available commands                                                                      |
| `make clean`                | Removes all containers, networks, and volumes. Any volume data will be lost.                                           |

---

## How Configuration Works

The jobmanager uses `make` to run tasks. `make` is aware of
the task dependency tree and ensures that all required dependencies are met
when running a task. The main tasks and functionality for `make` are
configured in `Makefile`.

Configurations that may change are extracted into `config.mk`. This file is
checked in to source control and should not be modified. It is always configured
for the latest jobmanager release.

If a file named `config.local.mk` exists then it will be loaded after
`config.mk`. Settings in `config.local.mk` will override those set in
`config.mk`. `config.local.mk` is ignored by source control, so feel free to create it if you need.

---

## Networked Services

User-defined Docker networks are used to connect the whaleandjaguar services that run
as separate Docker Compose projects. With this configuration, each of the
projects can be launched independently using Docker Compose.

While the projects can be launched independently they may have network
dependencies that are required to function correctly.

---

## Customize Docker-compose configuration

You can also configure docker-compose with custom parameters without need to modify the docker-compose.yaml file. Once you run the project for the first time, Make will create a docker-compose.override.yaml file which is a file that override the configuration of docker-compose.yaml.

Why is this important? well, let's say you have a local postgres database running on port 5432. Because of docker-compose.yaml is configured to expose postgres in that port there will be an collations of ports and the container won't start. So you can set the proper port you want to use by overriding that configuration in the docker-compose.override.yaml. Changes in that file are ignored in git.

---

## Git hooks

Another important thing to know is the implementation of [git hooks][4]. Git hooks are the way we can automate repetitive tasks in order to keep easy the developer experience.
In this project we are using 3 hooks to validate each step of the git flow, you can see those files in the .husky directory.

- `commit-msg` - validate each commit message and reject those that are incomplete
- `pre-commit` - validate code style, also format files to maintain good practices
- `pre-push` - validate your code, it will suggest you some improvements, and It will give you a score of your code.

You don't have to do anything to start working with those hooks, the make file does the hard work for you ;)

---

## GNUMake in Windows 10 enviroments

Install [Docker desktop for Windows] [2]
Install [wsl2][9]

Run PowerShell as administrator. Use the following commands to enable `Bash` in Windows 10:

```sh
Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -norestart
```

```sh
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -norestart
```

```sh
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all
```

Then download and install `Ubuntu` from Windows Store.
When the installation is complete find the application and run it as a normal Windows application. Set up user and password (just the first time).

To access the directories on your disk run the following command:

```sh
cd /mnt/c/
```

You will most likely need to install `make` in bash. Run:

```sh
sudo apt-get install make
```

It is recommended that you run:

```sh
sudo apt-get update
```

```sh
sudo apt-get upgrade
```

Once you have this feature installed you must enable `wsl2` for your Ubuntu environment in the Docker settings (Docker -> Settings -> Resources -> WSL Integration).

Finally, it may happen that Docker asks you for permissions to execute the `make init` sentence. This is because Docker must be added to the user group and for this run:

```sh
sudo usermod -a -G docker {user}
newgrp docker
```

Most of the step by step is described in the article: [Guide to Install Bash on Windows][10]

[0]: https://www.docker.com/get-docker "Docker"
[1]: https://www.docker.com/docker-mac "Docker for Mac"
[2]: https://www.docker.com/docker-windows "Docker for Windows"
[3]: https://python-poetry.org/ "Poetry documentation"
[4]: https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks "Git Hooks"
[5]: https://git-scm.com/ "Git"
[6]: https://jsfranco90@bitbucket.org/oceana-wj/jobmanager.git "Whale&Jaguar Platform - Job Manager"
[7]: https://www.mongodb.com/es "Mongo DB"
[8]: https://www.postgresql.org/ "Posgresql DB"
[9]: https://docs.microsoft.com/en-us/windows/wsl/install-win10 "wsl for Windows"
[10]:https://itsfoss.com/install-bash-on-windows/ "GUIDE: Install Bash for Windows"
[11]: https://bitbucket.org/oceana-wj/oceana-databases.git "Whale&Jaguar Platform - databases service"
