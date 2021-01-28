# Schemester

![Node.js CI](https://github.com/ranjanistic/schemester-web/workflows/Node.js%20CI/badge.svg?branch=master)
![CodeQL](https://github.com/ranjanistic/schemester-web/workflows/CodeQL/badge.svg)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
![Labeler](https://github.com/ranjanistic/schemester-web/workflows/Labeler/badge.svg)
 
This repo hosts the source code for [schemester](https://schemester.herokuapp.com).
Jump to

- [Contribution guide](CONTRIBUTING.md).

- [Documentation](DOCUMENTATION.md).

Following are the steps to begin local development.

## Cloning

```bash
git clone https://github.com/ranjanistic/schemester-web.git
```

Or, recently

```bash
gh repo clone ranjanistic/schemester-web
```

## Stands upon

- [npm](http://npmjs.com/)
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [ejs](https://ejs.co/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Vanilla JS](http://vanilla-js.com/)
- [HTML](https://www.w3schools.com/html/), [CSS](https://www.w3schools.com/css/)

## APIs used

- [Pusher.js](https://github.com/pusher/pusher-js)
- [LocalStorage](https://developer.mozilla.org/en/docs/Web/API/Window/localStorage)
- [SessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
- [IndexedDB](https://developer.mozilla.org/en/docs/Web/API/IndexedDB_API)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## Local run

### Install dependencies

  ```bash
  npm install
  ```

### Generate localhost certificate*

The session is only created on https (secured) protocol, therefore, before you proceed to steps to run server (for first time setup only), go through the following steps.

#### Setting localhost on https*

First, refer to & follow the [mkcert installation steps](https://github.com/FiloSottile/mkcert#installation) to enable ```mkcert``` command on your system.

After that,

```bash
mkcert -install
```

This will create local CA certificate on your system trust store. Then in the project root path,

```bash
mkcert localhost
```

This will create ```localhost.pem``` &amp; ```localhost-key.pem``` files locally in project root. Now the local server will automatically use these files to run over https.

### Environment Variables*

Create a .env file at root of the project. Use [.sample.env](/.sample.env) for environment variable keys.

### Setup configuration keys*

A config.json with keys is required for the application to run, and the following command will help you set that up automatically.

```bash
npm run newconfig
```

The CLI interface will ask you for your raw keys (unmasked), and will mask them in config/config.json using the SSH key provided by you in .env file as an environment variable ([set that up](#environment-variables) in previous step first before doing this).

You can run this command anytime to update any of your configuration keys.

**IMPORTANT: After config.json is generated, follow [.sample.env](.sample.env) to create environment variables by copying them from the config.json, for the project, for production environment, or wherever you'll need them. Then, use ```npm run config``` to autogenerate config.json from your environment variables, effectively in production environment. This command won't work in other environments.**

### Local MongoDB database

Make sure you've MongoDB server running at localhost:27017.

See [contribution guidelines](/CONTRIBUTING.md#fulfiling-requirements).

### Run server

  ```bash
  npm run devserver
  ```

Alternatively,

  ```bash
  nodemon server
  ```

Otherwise conventionally, ```node server``` would also start the server, but changes won't reload automatically.

Above commands must log -

```bash
Connected to <YOUR_DATABASE_NAME>
listening on 3000 (https)
```

here <YOUR_DATABASE_NAME> should be the database name you've set in configuration setup.

If you're seeing -

```bash
Connected to <YOUR_DATABASE_NAME>
listening on 3000
Warning:Server hosted via non-https protocol.
 Session will fail.
```

(without https), then you must haven't followed [these steps](#setting-localhost-on-https).

If some other error has occurred, follow the checklist to make sure every prerequisite is set up.

- Create .env at root of project, with SSH = <YOUR_PROJECT_SUPER_SECRET> in it.

- Run ```npm run newconfig``` to enable CLI to generate a config file at [config/config.json](config/config.json).

- Copy keys from [config.json](config/config.json) to your [.env](.env) file, and set them according to [.sample.env](.sample.env).

- Start MongoDB community server at localhost:27107.

If error still persists even after following the above steps, create an issue in the repository with error logs and details.

After ensuring that ```listening on 3000 (https)``` is being logged on node console, you can proceed towards contribution.

**See detailed contribution guide [here](CONTRIBUTING.md).**

### Switch branches

  The master branch is the production branch linked to the cloud hosting server, therefore it shouldn't be used to push non-crucial-to-the-moment commits, as cloud server re-builds the application on each commit, which can potentially disrupt the live webapplication for users. See CONTRIBUTING.md for details.

### On changes done

```bash
npm run commit
```

Alternatively,

```bash
git add .
git cz
```

They replace the conventional ```git commit``` command for better commit messages.

### Push to branch-name

```bash
git push -u origin branch-name
```

## Footnotes

- (*) _Steps with asterisk are the steps to be followed only for first time development setup._

- _See [contribution guidelines](CONTRIBUTING.md) for detailed explanation including local DB, link, and server environment setup._

- _See [application documentation](DOCUMENTATION.md) for step by step developement guide, definitions & explanations with snippets of use cases._

- _Apart from documentation, in-code documentation is also provided wherever possible or required._
