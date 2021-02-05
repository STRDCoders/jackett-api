import { JackettService } from "../../src";
import { IJackettSettings } from "../../src/model/jackett-settings.model";

describe("Jackett Service", () => {
  // const sandbox: SinonSandbox = sinon.createSandbox();
  let jackettService: JackettService;
  const settings: IJackettSettings = {
    connectionSettings: {
      baseUrl: "https://baseurl.com",
      apiKey: "apiKey",
    },
    selfSignedSSL: true,
  };

  beforeEach(() => {
    jackettService = new JackettService(settings);
  });

  describe("axios init", () => {
    it("should set 'rejectUnauthorized' of agent to false when 'IJackettSettings.selfSignedSSL' true", () => {});
    it("should set 'rejectUnauthorized' of agent to true when 'IJackettSettings.selfSignedSSL' false", () => {});
  });

  describe("getTorznabIndexers", () => {
    it("Should return list of indexers when server responses valid data", async () => {
      await jackettService.getTorznabIndexers();
    });
  });
});
