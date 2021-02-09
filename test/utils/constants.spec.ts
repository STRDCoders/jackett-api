import { Constants } from "../../src/utils/constants";
import { expect } from "chai";

describe("Constants", () => {
  describe("jackettAPI", () => {
    it("IJackettApiUrlModel should be immutable", () => {
      checkFreezeState(Constants.jackettAPI);
    });
  });
});

function checkFreezeState(object: any): void {
  for (const key in object) {
    if (object.hasOwnProperty(key) && typeof object[key] === "object") {
      expect(Object.isFrozen(object[key])).to.be.true;
      checkFreezeState(object[key]);
    }
  }
}
