import chai = require("chai");
import chaiAsPromised = require("chai-as-promised");
import { SinonSandbox, SinonStub } from "sinon";
import * as Sinon from "sinon";
import Axios from "axios";
const fs = require("fs");

import * as https from "https";
import {
  JackettService,
  IndexerType,
  RssResultModel,
  IJackettSettings,
} from "../../src";
import * as Path from "path";
import { Constants } from "../../src/utils/constants";

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
    it("should set 'rejectUnauthorized' of agent to false when 'IJackettSettings.selfSignedSSL' true", () => {});
    it("should set 'rejectUnauthorized' of agent to true when 'IJackettSettings.selfSignedSSL' false", () => {});
  });

  describe("getTorznabIndexers", () => {
    it("Should return list of indexers when server responses valid data", async () => {
      buildResponse("indexers.xml");
      const response = await jackettService.getTorznabIndexers();
      expect(response.length).to.equal(3);
      expect(response).to.deep.include({
        _id: "indexerId1",
        _configured: false,
        _title: "Title1",
        _description: "Description of Title1",
        _link: "https://indexer.com",
        _language: "fr-fr",
        _type: IndexerType.private,
      });
      expect(response).to.deep.include({
        _id: "indexerId2",
        _configured: true,
        _title: "Title2",
        _description: "Description of Title2",
        _link: "https://indexer.com",
        _language: "en-us",
        _type: IndexerType.private,
      });
      expect(response).to.deep.include({
        _id: "indexerId3",
        _configured: true,
        _title: "Title3",
        _description: "Description of Title3",
        _link: "https://indexer.com",
        _language: "en-us",
        _type: IndexerType.public,
      });
    });
  });

  describe("getConfiguredIndexers", () => {
    it("Should return list of configured indexers when server responses valid data", async () => {
      buildResponse("indexers.xml");
      const response = await jackettService.getConfiguredIndexers();
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
      const response = await jackettService.searchAll("query");
      expect(response.length).to.equal(2);
      expect(response).to.deep.include({
        _indexerId: "indexer1",
        _indexerName: "indexerName1",
        _title: "The title",
        _publishDate: new Date("2016-09-02T08:22:06.000Z"),
        _category: ["4050", "100009"],
        _downloadLink: "https://downloadlink.com",
        _size: "35560322750",
        _fileCount: 11,
        _grabs: 87175,
        _seeders: "518",
        _peers: "522",
      });
      expect(response).to.deep.include({
        _indexerId: "indexer2",
        _indexerName: "indexerName2",
        _title: "The title 2",
        _publishDate: new Date("2020-01-02T01:13:44.000Z"),
        _category: ["5000", "100065"],
        _downloadLink: "https://downloadlink.com",
        _size: "146028888064",
        _fileCount: 0,
        _grabs: 0,
        _seeders: "67",
        _peers: "70",
      });
    });
  });

  describe("searchIndexers", () => {
    it("Should return filtered rssResults by given indexerIds", async () => {
      buildResponse("search_all.xml");
      const response = await jackettService.searchIndexers("query", [
        "indexer1",
      ]);
      expect(response.length).to.equal(1);
    });
  });

  describe("getRssIndexer", () => {
    it("should fetch indexer's Rss when valid index id is provided", async () => {
      buildResponse("indexer_rss.xml");
      const result = await jackettService.getIndexerRss("indexer1");
      console.log(result);
      expect(result.length).to.equal(2);
      expect(result).to.deep.include({
        _indexerId: "indexer1",
        _indexerName: "indexerName1",
        _title: "The title",
        _publishDate: new Date("2016-09-02T08:22:06.000Z"),
        _category: ["4050", "100009"],
        _downloadLink: "https://downloadlink.com",
        _size: "35560322750",
        _fileCount: 11,
        _grabs: 87175,
        _seeders: "518",
        _peers: "522",
      });
      expect(result).to.deep.include({
        _indexerId: "indexer1",
        _indexerName: "indexerName1",
        _title: "The title 2",
        _publishDate: new Date("2020-01-02T01:13:44.000Z"),
        _category: ["5000", "100065"],
        _downloadLink: "https://downloadlink.com",
        _size: "146028888064",
        _fileCount: 0,
        _grabs: 0,
        _seeders: "67",
        _peers: "70",
      });
    });
    it("when indexer was not found should throw error", () => {});
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
});
