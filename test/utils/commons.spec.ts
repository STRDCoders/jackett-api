import { Commons } from "../../src/utils/commons";
import { Constants } from "../../src/utils/constants";

import { IJackettUrlSetting } from "../../src/model/jackett-settings.model";
import { IJackettApiUrlModel } from "../../src/model/jackett-api-url.model";
import { expect } from "chai";

describe("Commons", () => {
  describe("buildUrl", () => {
    const settings: IJackettUrlSetting = {
      apiKey: "key",
      baseUrl: "https://baseurl.com/",
    };

    it("Should build url when has suffix", () => {
      const apiUrl: IJackettApiUrlModel = {
        suffix: "suff",
        prefix: "prefix",
      };
      const response = Commons.buildUrl(apiUrl, settings);
      expect(response).to.equal(
        settings.baseUrl +
          apiUrl.prefix +
          "?" +
          Constants.jackettAPI.apiParam +
          "=" +
          settings.apiKey +
          apiUrl.suffix
      );
    });

    it("Should build url without suffix when suffix undefined", () => {
      const apiUrl: IJackettApiUrlModel = {
        prefix: "prefix",
      };
      const response = Commons.buildUrl(apiUrl, settings);
      expect(response).to.equal(
        settings.baseUrl +
          apiUrl.prefix +
          "?" +
          Constants.jackettAPI.apiParam +
          "=" +
          settings.apiKey
      );
    });
  });
});
