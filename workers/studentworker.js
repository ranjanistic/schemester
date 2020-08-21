const Institute = require("../collections/Institutions"),
  view = require("../hardcodes/views"),
  code = require("../public/script/codes");

class StudentWorker {
  constructor() {
    this.self = new Self();
  }
  toSession = (u, query = { target: view.student.target.dash }) => {
    let path = `/student/session?u=${u}`;
    for (var key in query) {
      if (query.hasOwnProperty(key)) {
        path = `${path}&${key}=${query[key]}`;
      }
    }
    return path;
  };
  toLogin = (query = { target: view.student.target.dash }) => {
    let i = 0;
    let path = "/student/auth/login";
    for (var key in query) {
      if (query.hasOwnProperty(key)) {
        path =
          i > 0
            ? `${path}&${key}=${query[key]}`
            : `${path}?${key}=${query[key]}`;
        i++;
      }
    }
    return path;
  };
}

class Self {
  constructor() {}
}

module.exports = new StudentWorker();