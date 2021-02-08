import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import * as Sinon from "sinon";
import { SinonSandbox, SinonStub } from "sinon";
import Axios, { AxiosError } from "axios";
import * as https from "https";
import {
  IJackettSettings,
  IndexerType,
  JackettService,
  RssResultModel,
  TorznabIndexerModel,
} from "../../src";
import * as Path from "path";
import { Constants } from "../../src/utils/constants";
import { Commons } from "../../src/utils/commons";

const fs = require("fs");

chai.use(chaiAsPromised);
chai.use(require("sinon-chai"));

const expect = chai.expect;

describe("Jackett Service", () => {
  const responseResourcePath = "test/resources/responses/";
  let sandbox: SinonSandbox;
  let mockHttpClient;
  let mockHttpClientGet: SinonStub;
  let jackettService: JackettService;
  let settings: IJackettSettings;

  beforeEach(() => {
    sandbox = Sinon.createSandbox();
    //  Create Axios instance to be injected to the service, this way we could stub its methods(since the service is using instance calls)
    mockHttpClient = Axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
    sandbox.stub(Axios, "create").returns(mockHttpClient);
    mockHttpClientGet = sandbox.stub(mockHttpClient, "get");
    settings = {
      connectionSettings: {
        baseUrl: "https://baseUrl.com",
        apiKey: "apiKey",
      },
      selfSignedSSL: true,
    };
    jackettService = new JackettService(settings);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("axios init", () => {
    it("should set 'rejectUnauthorized' of agent to false when 'IJackettSettings.selfSignedSSL' true", () => {
      sandbox.restore(); // Ignore all stubbing, let the service build the axios instance
      const axiosSpy = sandbox.spy(Axios, "create");
      new JackettService({
        connectionSettings: {
          apiKey: "",
          baseUrl: "",
        },
        selfSignedSSL: true,
      });
      expect(
        (axiosSpy.firstCall.firstArg.httpsAgent as https.Agent).options
          .rejectUnauthorized
      ).to.be.false;
    });
    it("should set 'rejectUnauthorized' of agent to true when 'IJackettSettings.selfSignedSSL' false", () => {
      sandbox.restore(); // Ignore all stubbing, let the service build the axios instance
      const axiosSpy = sandbox.spy(Axios, "create");
      new JackettService({
        connectionSettings: {
          apiKey: "",
          baseUrl: "",
        },
        selfSignedSSL: false,
      });
      expect(
        (axiosSpy.firstCall.firstArg.httpsAgent as https.Agent).options
          .rejectUnauthorized
      ).to.be.true;
    });
  });

  describe("getTorznabIndexers", () => {
    it("Should return list of indexers when server responses valid data", async () => {
      buildResponse("indexers.xml");
      const response = await jackettService.getTorznabIndexers();
      const expected = [
        new TorznabIndexerModel(
          "indexerId1",
          false,
          "Title1",
          "Description of Title1",
          "https://indexer.com",
          "fr-fr",
          IndexerType.private
        ),
        new TorznabIndexerModel(
          "indexerId2",
          true,
          "Title2",
          "Description of Title2",
          "https://indexer.com",
          "en-us",
          IndexerType.private
        ),
        new TorznabIndexerModel(
          "indexerId3",
          true,
          "Title3",
          "Description of Title3",
          "https://indexer.com",
          "en-us",
          IndexerType.public
        ),
      ];
      expect(response.length).to.equal(3);
      expect(response).to.deep.include.members(expected);
      /** To get 100% coverage, we run this test 1 time **/
      assertGettersTorznabIndexerModel(response[0], expected[0]);
    });
  });

  describe("getConfiguredIndexers", () => {
    it("Should return list of configured indexers when server responses valid data", async () => {
      buildResponse("indexers.xml");
      const getTorznabIndexersSpy = sandbox.spy(
        jackettService,
        "getTorznabIndexers"
      );
      const response = await jackettService.getConfiguredIndexers();
      expect(getTorznabIndexersSpy).to.have.been.calledOnce;
      expect(mockHttpClientGet).to.have.been.calledOnceWithExactly(
        Commons.buildUrl(
          Constants.jackettAPI.getTorznabIndexers,
          settings.connectionSettings
        )
      );
      expect(response.length).to.equal(2);
      expect(response.map((indexer) => indexer.id)).to.have.members([
        "indexerId2",
        "indexerId3",
      ]);
    });
  });

  describe("searchAll", () => {
    it("Should return list of RssResult by search query", async () => {
      buildResponse("search_all.xml");
      const searchQuery = "query";
      const response = await jackettService.searchAll(searchQuery);
      const expected = [
        new RssResultModel(
          "indexer1",
          "indexerName1",
          "The title",
          new Date("2016-09-02T08:22:06.000Z"),
          ["4050", "100009"],
          "https://downloadlink.com",
          35560322750,
          11,
          87175,
          518,
          522
        ),
        new RssResultModel(
          "indexer2",
          "indexerName2",
          "The title 2",
          new Date("2020-01-02T01:13:44.000Z"),
          ["5000", "100065"],
          "https://downloadlink.com",
          146028888064,
          0,
          0,
          67,
          70
        ),
      ];
      expect(mockHttpClientGet).to.have.been.calledOnceWithExactly(
        Commons.buildUrl(
          Constants.jackettAPI.searchAll,
          settings.connectionSettings,
          {
            "%query%": encodeURIComponent(searchQuery),
          }
        )
      );
      expect(response.length).to.equal(2);
      expect(response).to.deep.include.members(expected);
      /** To get 100% coverage, we run this test 1 time **/
      assertGettersRssResult(response[0], expected[0]);
    });
  });

  describe("searchIndexers", () => {
    it("Should return filtered rssResults by given indexerIds", async () => {
      buildResponse("search_all.xml");
      const searchQuery = "query";
      const searchAllSpy = sandbox.spy(jackettService, "searchAll");
      const response = await jackettService.searchIndexers(searchQuery, [
        "indexer1",
      ]);
      expect(searchAllSpy).to.have.been.calledOnceWithExactly(searchQuery);
      expect(mockHttpClientGet).to.have.been.calledOnce;
      expect(response.length).to.equal(1);
    });
  });

  describe("getRssIndexer", () => {
    it("should fetch indexer's Rss when valid index id is provided", async () => {
      buildResponse("indexer_rss.xml");
      const result = await jackettService.getIndexerRss("indexer1");
      const expected = [
        new RssResultModel(
          "indexer1",
          "indexerName1",
          "The title",
          new Date("2016-09-02T08:22:06.000Z"),
          ["4050", "100009"],
          "https://downloadlink.com",
          35560322750,
          11,
          87175,
          518,
          522
        ),
        new RssResultModel(
          "indexer1",
          "indexerName1",
          "The title 2",
          new Date("2020-01-02T01:13:44.000Z"),
          ["5000", "100065"],
          "https://downloadlink.com",
          146028888064,
          0,
          0,
          67,
          70
        ),
      ];
      expect(result.length).to.equal(2);
      expect(mockHttpClientGet).to.have.been.calledOnceWithExactly(
        Commons.buildUrl(
          Constants.jackettAPI.getIndexerRss,
          settings.connectionSettings,
          {
            "%indexerId%": expected[0].indexerId,
          }
        )
      );
      expect(result).to.deep.include.members(expected);
    });
    it("when indexer was not found should throw error", async () => {
      await jackettService.getIndexerRss("fakeIndexer");
    });
    it("when indexer has not rss feeds should return empty array", () => {});
  });

  describe("downloadTorrent", () => {
    it("Should download torrent file when given valid RssResultModel", async () => {
      const writer = {
        on: (s, event) => {
          event();
        },
      };
      const writerStub = sandbox.stub(fs, "createWriteStream").returns(writer);
      const rssResult = new RssResultModel(
        "indexerId",
        "IndexerName",
        "File.to.Download.2021",
        new Date("2021-02-05T23:41:34.000Z"),
        ["6000", "100007"],
        "http://urlLink.com?file=this.is.file",
        39446096074,
        86,
        385,
        271,
        530
      );
      const responseStub = { pipe: sandbox.stub() };
      mockHttpClientGet.returns(
        new Promise((resolve, _) => resolve({ data: responseStub }))
      );
      await jackettService.downloadTorrent(rssResult, "/tmp");

      expect(mockHttpClientGet).to.have.been.calledOnceWithExactly(
        rssResult.downloadLink,
        {
          responseType: "stream",
        }
      );
      expect(writerStub).to.have.been.calledOnceWithExactly(
        Path.resolve(
          `/tmp/this.is.file${Constants.downloadSettings.downloadNameSuffix}`
        )
      );
      expect(responseStub.pipe).to.have.been.calledOnceWithExactly(writer);
    });
  });

  describe("isValidServer", () => {
    let searchAllSpy;
    beforeEach(() => {
      searchAllSpy = sandbox.spy(jackettService, "searchAll");
    });
    afterEach(() => {
      expect(searchAllSpy).to.be.calledOnceWithExactly(
        Constants.jackettAPI.dummyValidationSearchQuery
      );
    });
    it("Should return true if the server responded with valid data and status", () => {});
    it("Should return false if the server responded with an error", async () => {
      const httpResponse: AxiosError = {
        name: "error",
        code: "404",
        message: "error",
        isAxiosError: true,
        config: null,
        request: null,
        toJSON: null,
      };
      mockHttpClientGet.rejects(httpResponse);
      const returnedValue = await jackettService.isValidServer();
      expect(returnedValue).to.be.false;
    });
    it("Should return false if the server responded with non xml data", () => {});
  });

  /**
   * Read xml file and pass the content to the httpClient stub to mimic server response.
   * Content is parsed in UTF-8 encode.
   *
   * @param path relative path to xml file inside resources.responses package.
   */
  const buildResponse = (path: string) => {
    const mockResponse = fs
      .readFileSync(`${responseResourcePath}/${path}`)
      .toString("utf-8");
    mockHttpClientGet.returns(
      new Promise((resolve, _) => resolve({ data: mockResponse }))
    );
  };

  const assertGettersTorznabIndexerModel = (
    actual: TorznabIndexerModel,
    expected: TorznabIndexerModel
  ) => {
    expect(actual.id).to.equal(expected.id);
    expect(actual.configured).to.equal(expected.configured);
    expect(actual.description).to.equal(expected.description);
    expect(actual.language).to.equal(expected.language);
    expect(actual.link).to.equal(expected.link);
    expect(actual.title).to.equal(expected.title);
    expect(actual.type).to.equal(expected.type);
  };

  const assertGettersRssResult = (
    actual: RssResultModel,
    expected: RssResultModel
  ) => {
    expect(actual.downloadLink).to.equal(expected.downloadLink);
    expect(actual.category).to.include.members(expected.category);
    expect(actual.fileCount).to.equal(expected.fileCount);
    expect(actual.grabs).to.equal(expected.grabs);
    expect(actual.indexerId).to.equal(expected.indexerId);
    expect(actual.indexerName).to.equal(expected.indexerName);
    expect(actual.peers).to.equal(expected.peers);
    expect(actual.publishDate).to.eql(expected.publishDate);
    expect(actual.seeders).to.equal(expected.seeders);
    expect(actual.size).to.equal(expected.size);
    expect(actual.title).to.equal(expected.title);
  };
});
