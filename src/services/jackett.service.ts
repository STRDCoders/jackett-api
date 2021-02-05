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
    console.log(active);
    return active;
  }

  /**
   * Downloads a torrent file of given torrent result.
   */
  downloadTorrent() {}

  /**
   * Search a query in given indexers
   */
  searchIndexers() {}

  /**
   * Search a query in all indexers
   *
   * @return {Promise<Array<RssResultModel>>} Promise of rss results from all configured indexers
   */
  async searchAll(query: string): Promise<Array<RssResultModel>> {
    const response = await this.axios.get(
      Commons.buildUrl(
        Constants.jackettAPI.searchAll,
        this.settings.connectionSettings
      ) + encodeURIComponent(query)
    );
    const parsedData = await parseString(response.data);
    return parsedData.rss.channel[0].item.map((rssItem) =>
      RssResultModel.fromJson(rssItem)
    );
  }
}
