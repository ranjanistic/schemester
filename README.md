# Schemester

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

This repo hosts the source code for [schemester](https://schemester.herokuapp.com).
Jump to [documentation](DOCUMENTATION.md).

Following are the steps to begin local development.

## Cloning

```bash
git clone https://github.com/ranjanistic/schemester-web.git
```

```bash
gh repo clone ranjanistic/schemester-web
```

## Stands upon

- [npm](http://npmjs.com/)
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Vanilla JS](http://vanilla-js.com/)
- [HTML](https://www.w3schools.com/html/), [CSS](https://www.w3schools.com/css/)

## APIs used

- [Pusher.js](https://github.com/pusher/pusher-js)
- [LocalStorage](https://developer.mozilla.org/en/docs/Web/API/Window/localStorage)
- [SessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
- [IndexedDB](https://developer.mozilla.org/en/docs/Web/API/IndexedDB_API)

## Local run

### Install dependencies

  ```bash
  npm install
  ```

### Generate localhost certificate

The session is only created on https (secured) protocol, therefore, before you proceed to steps to run server (for first time setup only), go through the following steps.

#### Setting localhost on https

First, refer to & follow the [mkcert installation steps](https://github.com/FiloSottile/mkcert#installation) to enable ```mkcert``` command on your system.

After that, in the project root path,

```bash
mkcert -install
```

This will create local CA certificate on your system trust store. Then,

```bash
mkcert localhost
```

This will create ```localhost.pem``` &amp; ```localhost-key.pem``` files locally in project root. Now the local server will use these files to run over https.

### Run server

  ```bash
  npm run devserver
  ```

Alternatively,

  ```bash
  nodemon server
  ```

Otherwise conventionally,```npm start``` or ```node server``` would also start the server, but changes won't reload automatically.

Above commands must log -

```bash
Connected to schemesterDB
listening on 3000 (https)
```

Or if you're seeing -

```bash
Connected to schemesterDB
listening on 3000
```

instead of the previous log (with https), then you must haven't followed [these crucial steps](#setting-localhost-on-https).

After ensuring that ```listening on 3000 (https)``` is being logged on node console, you can proceed towards contribution.

## Contributing

See detailed contribution guide [here](CONTRIBUTING.md).

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

They replace the conventional ```git commit``` command, for better commit messages.

### Push to branch-name

```bash
git push -u origin branch-name
```

## Footnotes

- _See [contribution guidelines](CONTRIBUTING.md) for detailed explanation including local DB, link, and server environment setup._

- _See [application documentation](DOCUMENTATION.md) for step by step developement guide, definitions & explanations with snippets of use cases._

- _Apart from documentation, in-code documentation is also provided wherever possible or required._
