const assert = require("assert");

describe("Sharedata",()=>{
    const shared = require("../workers/common/sharedata");
    it("Admin",()=>{
        assert.strictEqual(shared.getAdminShareData().isAdmin,true);
    })
    it("Teacher",()=>{
        assert.strictEqual(shared.getTeacherShareData().isTeacher,true);
    })
    it("Student",()=>{
        assert.strictEqual(shared.getStudentShareData().isStudent,true);
    })
    describe("Pseudo",()=>{
        it("Teacher",()=>{
            assert.strictEqual(shared.getPseudoTeacherShareData().isTeacher,shared.getPseudoTeacherShareData().pseudo);
        })
        it("Student",()=>{
            assert.strictEqual(shared.getPseudoStudentShareData().isStudent,shared.getPseudoStudentShareData().pseudo);
        })
    })

})