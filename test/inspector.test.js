const assert = require("assert");
const { ObjectId } = require("mongodb");
const {client} = require("../public/script/codes");
describe("Inspector", () => {
  const inspect = require("../workers/common/inspector");
  describe("Email validity", () => {
    it("Valid string", () => {
      assert.strictEqual(inspect.emailValid("abc@def.com"), true);
    });
    it("Invalid string", () => {
      assert.strictEqual(inspect.emailValid("invalidemail"), false);
    });
  });

  describe("Password validity", () => {
    it("Valid string", () => {
      assert.strictEqual(inspect.passValid("validpassword"), true);
    });
    it("Invalid string", () => {
      assert.strictEqual(inspect.passValid("abc"), false);
    });
  });

  describe("Tokening", () => {
    it("Signs & Verifies", () => {
      let tok = inspect.token.sign("testtoken");
      assert.strictEqual(inspect.token.verify(tok),"testtoken");
    });
  });

  describe("Session Token", () => {
    it("Valid token", () => {
      assert.strictEqual(inspect.sessionTokenValid({id:new ObjectId(),uiid:"testuiid"}), inspect.sessionTokenValid({id:new ObjectId(),uiid:"testuiid",classname:"testclass"},client.student));
    });

    it("Invalid token", () => {
      assert.strictEqual(inspect.sessionTokenValid({id:"invalidobjectid",uiid:"testuiid"}), false);
    });
  });
  


});