const assert = require("assert");
describe("Timer", () => {
  const timer = require("../workers/common/timer");
  describe("Days in month", () => {
    it("All months", () => {
      let k = 0;
      while (k < 12) {
        assert.strictEqual(
          [28, 29].includes(timer.daysInMonth(k)) || timer.daysInMonth(k),
          k == 1 ||
            timer.daysInMonth(
              [5, 10, 11].includes(k) ? k - 2 : k == 6 ? k + 1 : k + 2
            ),
          String(k)
        );
        k++;
      }
    });
  });

  describe("SGT", () => {
    it("Increments moment", () => {
      assert.strictEqual(
        0-(timer.getMoment({ minute: 60 * 48 })-timer.getMoment({ day: 2 }))<3
        ,true
      );
    });
    it("Current moment", () => {
      assert.strictEqual(0-(timer.getTheMoment()-timer.getTheMomentMinute())<3,true);
    });
    it("Length check", () => {
      assert.strictEqual(timer.getMoment(null, true).length, 17);
    });
  });
});
