# Contribution

Following are the steps which should get you started.

## Prerequisites

- NodeJS & npm

- MongoDB community server

- Localhost CA certificate

- .env file

### Optionally

- MongoDB compass

- Commitizen ([follow instructions](https://github.com/commitizen/cz-cli))

## Fulfiling Requirements

- NodeJS can be installed from the [official website](https://nodejs.org/). Make sure that you're able to run node as well as npm command via your terminal.

- MongoDB community server can be downloaded from the [official website](https://www.mongodb.com/try/download/community). Then make sure the database server runs on [mongodb://localhost:27017/](mongodb://localhost:27017/).

- To generate localhost .pem files locally in project folder, [mkcert](https://github.com/FiloSottile/mkcert#installation) can be used. Follow the instructions provided in their repository, and generate localhost.pem & localhost-key.pem in project root.

- .env file provides environment variables for local server. This can be created manually following the pattern in [.sample.env](.sample.env) and obtaining values from repository secret, or by asking the owner to provide it to you.

## In repository

### Clone

```bash
git clone <GIT_REPOSITORY_LINK>
```

### Install Packages

```bash
npm install
npm update
```

### Test run

```bash
npm test
```

Should pass all tests.

### Server run

```bash
npm run devserver
```

Console must log

```bash
Connected to schemesterDB
listening on 3000 (https)
```

Navigate to [https://localhost:3000/](https://localhost:3000/) in your browser. The webapp should get running.

_In case the server fails to run, go through all the steps carefully, specially the steps for .pem certificate generation and .env file. Also make sure the mongodb community server is running on the required port before you start the node server._

## Making changes

### Switch branch

```bash
git checkout -b <YOUR_BRANCH_NAME>
```

Keep the branch name descriptive to the changes you're about to make.

The details of project are thouroughly discussed in DOCUMENTATION.md and can be referred.

### On changes done

_It is advisable to break server before moving on to VCS._

If you have installed commititzen (cz command is enabled on your system), then you can run the following command.

```bash
npm run commit
```

The above command executes the following commands sequentially.

```bash
npm test
git status
git add .
git status
git cz

```

If ```git cz``` throws any error, then you can always proceed with ```git commit```. However, do run ```npm test``` before commiting any changes.

### Changes on remote

```bash
git pull
```

```bash
git push -u origin <YOUR_BRANCH_NAME>
```

Create pull requests with proper description of updates and changes made.
