import { Commons } from "../../src/utils/commons";
import { Constants } from "../../src/utils/constants";

import { IJackettUrlSetting } from "../../src/model/jackett-settings.model";
import { IJackettApiUrlModel } from "../../src/model/jackett-api-url.model";
import { expect } from "chai";
import * as Sinon from "sinon";

describe("Commons", () => {
  describe("buildUrl", () => {
    const settings: IJackettUrlSetting = Object.freeze({
      apiKey: "key",
      baseUrl: "https://baseurl.com/",
    });

    it("Should build url with suffix when provided", () => {
      const apiUrl: IJackettApiUrlModel = {
        suffix: "suff",
        prefix: "prefix",
      };
      const response = Commons.buildUrl(apiUrl, settings);
      expect(response).to.equal(
        `https://baseurl.com/prefix?${Constants.jackettAPI.apiParam}=${settings.apiKey}&${apiUrl.suffix}`
      );
    });

    it("Should build url without suffix when not provided", () => {
      const apiUrl: IJackettApiUrlModel = {
        prefix: "prefix",
      };
      const response = Commons.buildUrl(apiUrl, settings);
      expect(response).to.equal(
        `https://baseurl.com/prefix?${Constants.jackettAPI.apiParam}=${settings.apiKey}`
      );
    });

    it("should build url with params when 'data' is provided", () => {
      const apiUrl: IJackettApiUrlModel = {
        prefix: "search/prefix",
        suffix: "suff=1&%index%&q=%query%",
      };
      const data = {
        "%index%": "bob",
        "%query%": "alice",
      };
      const response = Commons.buildUrl(apiUrl, settings, data);
      expect(response).to.equal(
        `https://baseurl.com/search/prefix?${Constants.jackettAPI.apiParam}=${settings.apiKey}&suff=1&bob&q=alice`
      );
    });

    it("should not call 'buildPlaceHolders' when no data was provided", () => {
      const buildPlaceHolderSpy = Sinon.spy(Commons, "buildPlaceHolders");
      const apiUrl: IJackettApiUrlModel = {
        prefix: "search/prefix",
        suffix: "suff=1&%index%&q=%query%",
      };
      const response = Commons.buildUrl(apiUrl, settings);
      expect(response).to.equal(
        `https://baseurl.com/search/prefix?${Constants.jackettAPI.apiParam}=${settings.apiKey}&suff=1&%index%&q=%query%`
      );
      expect(buildPlaceHolderSpy.called).to.be.false;
    });
  });

  describe("buildPlaceHolders", () => {
    let input;

    beforeEach(() => {
      input = "Hello %name%! My name is %myName%.";
    });

    it("Should replace all placeholders with data provided", () => {
      const data = {
        "%name%": "bob",
        "%myName%": "alice",
      };
      const response = Commons.buildPlaceHolders(input, data);
      expect(response).to.equal("Hello bob! My name is alice.");
    });

    it("Should not fail when not all data was provided", () => {
      const data = {
        "%name%": "bob",
      };
      const response = Commons.buildPlaceHolders(input, data);
      expect(response).to.equal("Hello bob! My name is %myName%.");
    });
  });
});
