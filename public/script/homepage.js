class Homepage {
  constructor() {
    backRoot();
    new ThemeSwitch("darkmode");
    handlePageAlerts();
    this.logintabs = getElement("logintabs");
    this.tabshtml = [];
    this.tabs = [];
    this.loginlocates = [
      locate.admin.login,
      locate.teacher.login,
      locate.student.login,
    ];
    [
      {
        client: client.admin,
        name: "Admin",
        tagline: "Sign in here to access your institution.",
      },
      {
        client: client.teacher,
        name: "Teacher",
        tagline: "Sign in here to access your schedule.",
      },
      {
        client: client.student,
        name: "Student",
        tagline: "Sign in to see what's on your day today",
      },
    ].forEach((user) => {
      this.tabshtml.push(`
          <div class="fmt-col fmt-third fmt-padding-small fmt-animate-top">
          <button
            class="image-text-button"
            style="margin-bottom: 22px"
            id="${user.client}Login"
          >
            <div  style="border-radius: 8px" class="fmt-animate-right">
              <img
                src="/graphic/illustrations/${user.client}loginview.svg"
                width="100%"
                alt="${user.name} Illustration"
              />
            </div>
            <div class="fmt-padding-large fmt-col fmt-animate-left">
              <span class="group-heading fmt-row"
                >Continue as ${user.name}</span
              >
              <span class="group-text fmt-row">
              ${user.tagline}
              </span>
            </div>
          </button>
        </div>
          `);
    });
    if (localStorage.getItem(key.homelogintab)) {
      this.logintabs.innerHTML = this.tabshtml[
        Number(localStorage.getItem(key.homelogintab))
      ];
      this.tabshtml.forEach((tabcont, t) => {
        if (t != Number(localStorage.getItem(key.homelogintab))) {
          this.logintabs.innerHTML += tabcont;
        }
      });
    } else {
      this.tabshtml.forEach((tabcont) => {
        this.logintabs.innerHTML += tabcont;
      });
    }

    [client.admin, client.teacher, client.student].forEach((c) => {
      this.tabs.push(getElement(`${c}Login`));
    });

    this.tabs.forEach((tab, t) => {
      tab.onclick = (_) => {
        showLoader();
        localStorage.setItem(key.homelogintab, t);
        refer(this.loginlocates[t]);
      };
    });

    this.adminSignup = getElement("registeradmin");
    this.teacherSignup = getElement("registerteacher");
    this.studentSignup = getElement("registerstudent");

    this.getstarted = getElement("getStarted");

    this.adminSignup.onclick = (_) => {
      showadminregistration();
    };
    this.teacherSignup.onclick = (_) => {
      showTeacherRegistration();
    };
    this.studentSignup.onclick = (_) => {
      showStudentRegistration();
    };

    this.getstarted.onclick = (_) => {
      showLoader();
      refer(locate.tour);
    };
  }
}

window.onload = (_) => {
  if (window.location.protocol !== "https:") {
    refer(`https://${location.hostname}${location.pathname}`);
  }
  theme.setNav();
  window.app = new Homepage();
  registerServiceWorker();
};
