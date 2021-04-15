const jwt = require("jsonwebtoken"),
  express = require("express"),
  oauth = express.Router(),
  { code, client, view, action, get, post } = require("../public/script/codes"),
  session = require("../workers/common/session"),
  worker = require("../workers/oauthworker"),
  { render } = require("../workers/common/inspector");

session.use(oauth, client.admin);

oauth.get("/:domid", async (req, res, next) => {
  const token = req.signedCookies[session.sessionKey];
  let domdata = await worker.getDomainDetails(req.params.domid);
  if (!domdata) {
    return next();
  }
  let decoded = jwt.decode(token);
  if (!decoded) {
    return render(res, view.oauth, {
      session: false,
      authorized: null,
    });
  }
  const response = session.verify(req, decoded.user.client);
  if (!session.valid(response, decoded.user.client)) {
    return render(res, view.oauth, {
      session: false,
      authorized: null,
    });
  }
  const user = await worker.getUserData(response.user);
  if (!user) {
    return next();
  }
  const allowed = await worker.hasUserAllowedDomain(
    response.user,
    domdata.domain
  );
  return render(res, view.oauth, {
    session: true,
    authorized: allowed,
    client: response.user.client,
    domdata,
    user,
  });
});

module.exports = oauth;
