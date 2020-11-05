# Schemester

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

This repo hosts the source code for [schemester](https://schemester.herokuapp.com). Following are the steps to begin local development.

> Cloning
```
git clone https://github.com/ranjanistic/schemester-web.git
```
```
gh repo clone ranjanistic/schemester-web
```
## Web
### The project stands upon
- [npm](http://npmjs.com/)
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Vanilla JS](http://vanilla-js.com/)
- [HTML](https://www.w3schools.com/html/), [CSS](https://www.w3schools.com/css/)

### APIs used
- [Pusher.js](https://github.com/pusher/pusher-js)
- [LocalStorage](https://developer.mozilla.org/en/docs/Web/API/Window/localStorage)
- [SessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
- [IndexedDB](https://developer.mozilla.org/en/docs/Web/API/IndexedDB_API)

> Local run
>> Install dependencies
  ```
  npm install
  ```
>> Run server
  ```
  node server
  ```
  ```
  nodemon server
  ```
> [Contributing](CONTRIBUTING.md)
>> Switch branches
- For [administrator](../../tree/admin-feature) sector
```
git checkout admin-feature
```
- For [teacher](../../tree/teacher-feature) sector
```
git checkout teacher-feature
```
- For [student](../../tree/student-feature) sector
```
git checkout admin-feature
```
>> On changes done
```
git status
git add .
```
>> Before pushing

Use ```git cz``` instead of commit for better assist, or simply ```git commit``` for generic commit.

>> Push to branch-name
```
git push -u origin/branch-name
```
>> See [contribution guidelines](CONTRIBUTING.md) for detailed explanation including local DB, link, and server environment setup.

