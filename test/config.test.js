const assert =require("assert");
const config = require("../config/config.json");
const {token} = require("../workers/common/inspector");
describe("Config keys",()=>{
    it("keys valid",()=>{
        assert.strictEqual(Object.keys(config).length,7);
    })
})