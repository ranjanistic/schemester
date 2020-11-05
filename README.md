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

- ### Install dependencies

  ```bash
  npm install
  ```

- ### Run server

  ```bash
  node server
  ```

  ```bash
  nodemon server
  ```

## [Contributing](CONTRIBUTING.md)

### Switch branches

- For [administrator](../../tree/admin-feature) sector

    ```bash
    git checkout admin-feature
    ```

- For [teacher](../../tree/teacher-feature) sector

    ```bash
    git checkout teacher-feature
    ```

- For [student](../../tree/student-feature) sector

    ```bash
    git checkout admin-feature
    ```

### On changes done

```bash
git status
git add .
```

### Before pushing

Use ```git cz``` instead of commit for better assist, or simply ```git commit``` for generic commit.

### Push to branch-name

```bash
git push -u origin/branch-name
```

## Footnotes

- _See [contribution guidelines](CONTRIBUTING.md) for detailed explanation including local DB, link, and server environment setup._

- _See [application documentation](DOCUMENTATION.md) for step by step developement guide, definitions & explanations with snippets of use cases._

- _Apart from documentation, in-code documentation is also provided wherever possible or required._
