import { IJackettSettings } from "../model/jackett-settings.model";
import Axios, { AxiosInstance } from "axios";
import { Constants } from "../utils/constants";
import { Commons } from "../utils/commons";
import * as https from "https";
import { TorznabIndexerModel } from "../model/torznab-indexer.model";
import { RssResultModel } from "../model/rss-result.model";

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
    const active = indexers.filter((indexer) => indexer.configured === true);
    return active;
  }

  /**
   * Downloads a torrent file of given torrent result.
   */
  downloadTorrent() {}

  getRssIndexer(indexerId: string) {}

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
    return parsedData.rss.channel[0].item.map((rssItem) =>
      RssResultModel.fromJson(rssItem)
    );
  }
}
