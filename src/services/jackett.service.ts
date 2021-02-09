import { IJackettSettings } from "../model/jackett-settings.model";
import Axios, { AxiosInstance } from "axios";
import { Constants } from "../utils/constants";
import { Commons } from "../utils/commons";
import * as https from "https";
import { TorznabIndexerModel } from "../model/torznab-indexer.model";
import { RssResultModel } from "../model/rss-result.model";
import * as Path from "path";
import * as Fs from "fs";

const parseString = require("xml2js").parseStringPromise;

export class JackettService {
  private axios: AxiosInstance;

  constructor(private settings: IJackettSettings) {
    this.axios = Axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: !settings.selfSignedSSL,
      }),
    });
  }

  /**
   * Retrieves full supported Torznab indexers list
   *
   * @return {Promise<Array<TorznabIndexerModel>>} Promise of indexers fetched from Jackett
   */
  async getTorznabIndexers(): Promise<Array<TorznabIndexerModel>> {
    const response = await this.axios.get(
      Commons.buildUrl(
        Constants.jackettAPI.getTorznabIndexers,
        this.settings.connectionSettings
      )
    );
    const parsedData = await parseString(response.data);
    return parsedData.indexers.indexer.map((indexJson) =>
      TorznabIndexerModel.fromJson(indexJson)
    );
  }

  /**
   * Retrieves a filtered list of configured indexers on Jackett
   *
   * @return {Promise<Array<TorznabIndexerModel>>} Promise of configured indexers fetched from Jackett
   */
  async getConfiguredIndexers(): Promise<Array<TorznabIndexerModel>> {
    const indexers = await this.getTorznabIndexers();
    return indexers.filter((indexer) => indexer.configured === true);
  }

  /**
   * Downloads a torrent file of given RssResultModel & saves it on given downloadFolderPath.
   *
   * @param rssResult The model of the desired torrent to download
   * @param downloadFolderPath base dir for the file to be saved in
   * @return promise of the download process
   */
  async downloadTorrent(
    rssResult: RssResultModel,
    downloadFolderPath: string
  ): Promise<void> {
    const fileName = rssResult.downloadLink.substr(
      rssResult.downloadLink.lastIndexOf(
        Constants.jackettAPI.downloadFilePrefixNamePattern
      ) + Constants.jackettAPI.downloadFilePrefixNamePattern.length
    );
    const path = Path.resolve(
      downloadFolderPath,
      `${fileName}${Constants.downloadSettings.downloadNameSuffix}`
    );
    const writer = Fs.createWriteStream(path);
    const response = await this.axios.get(rssResult.downloadLink, {
      responseType: "stream",
    });

    response.data.pipe(writer);

    return new Promise<void>((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  }

  /**
   * Fetch the latest Rss feed from a given indexer.
   *
   * @param indexerId Id of the indexer to fetch Rss feed from
   * @return Promise<Array<RssResultModel>> Rss results from the feed of the indexer
   */
  async getIndexerRss(indexerId: string): Promise<Array<RssResultModel>> {
    const response = await this.axios.get(
      Commons.buildUrl(
        Constants.jackettAPI.getIndexerRss,
        this.settings.connectionSettings,
        {
          "%indexerId%": indexerId,
        }
      )
    );
    const parsedData = await parseString(response.data);
    if (!parsedData.rss.channel[0]?.item) {
      return [];
    }
    return parsedData.rss.channel[0].item.map((rssItem) =>
      RssResultModel.fromJson(rssItem)
    );
  }

  /**
   * Search a query and filter results by given indexers ids.
   *
   * @param query The search query to submit
   * @param indexersId Array of index id's to filter the results with
   * @return {Promise<Array<RssResultModel>>} Promise of filtered rss results
   */
  async searchIndexers(
    query: string,
    indexersId: string[]
  ): Promise<Array<RssResultModel>> {
    const results = await this.searchAll(query);
    return results.filter((rssResult) =>
      indexersId.includes(rssResult.indexerId)
    );
  }

  /**
   * Search a query in all indexers
   *
   * @param query The search query to submit
   * @return {Promise<Array<RssResultModel>>} Promise of rss results from all configured indexers
   */
  async searchAll(query: string): Promise<Array<RssResultModel>> {
    const response = await this.axios.get(
      Commons.buildUrl(
        Constants.jackettAPI.searchAll,
        this.settings.connectionSettings,
        {
          "%query%": encodeURIComponent(query),
        }
      )
    );
    const parsedData = await parseString(response.data);
    if (!parsedData.rss.channel[0]?.item) {
      return [];
    }
    return parsedData.rss.channel[0].item.map((rssItem) =>
      RssResultModel.fromJson(rssItem)
    );
  }

  /**
   * Validate connection to the Jackett server.
   * Sends a request to fetch data to see how the server behaves & tries to parse it to validate the content.
   *
   * @return {Promise<boolean>} State of the server connectivity
   */
  async isValidServer(): Promise<boolean> {
    return this.searchAll(Constants.jackettAPI.dummyValidationSearchQuery)
      .then(() => {
        parseString(parseString);
        return true;
      })
      .catch(() => false);
  }
}
