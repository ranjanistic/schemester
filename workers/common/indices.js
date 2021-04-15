const { get } = require("./../../public/script/codes"),
  dict = {
    headings: [
      "Root",
      "Homepage",
      "Tour Page",
      "Admin login",
      "Teacher login",
      "Student login",
      "Admin session",
      "Teacher session",
      "Student session",
    ],
    bodies: [
      "Starting point of domain.",
      "Main page of this site",
      "The landing page of this site",
      "Login as administrator",
      "Login as teacher",
      "Login as a student",
      "Administrator session path",
      "Teacher session path",
      "Student session path",
    ],
    links: [
      get.root,
      get.home,
      get.tour,
      get.admin.login,
      get.teacher.login,
      get.student.login,
      get.admin.session,
      get.teacher.session,
      get.student.session,
    ],
  };

class Indices {
  search(string) {
    let results = [];
    if (!string) return results;
    Object.keys(dict).forEach((key, k) => {
      if (k < 2) {
        dict[key].forEach((elem, e) => {
          if (
            String(elem).toLowerCase().includes(String(string).toLowerCase())
          ) {
            if (results.find((result) => result.ind == e) ? false : true)
              results.push({
                heading: dict.headings[e],
                body: dict.bodies[e],
                link: dict.links[e],
                ind: e,
              });
          }
        });
      }
    });
    return results;
  }
}

module.exports = new Indices();
