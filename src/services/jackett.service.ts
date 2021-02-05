import { IJackettSettings } from "../model/jackett-settings.model";
import Axios, { AxiosInstance } from "axios";
import { Constants } from "../utils/constants";
import { Commons } from "../utils/commons";
import * as https from "https";

export class JackettService {
  private axios: AxiosInstance;
  constructor(private settings: IJackettSettings) {
    this.axios = Axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
  }

  /**
   * Retrieves full supported Torznab indexers list
   */
  async getTorznabIndexers(): Promise<void> {
    const response = await this.axios.get(
      Commons.buildUrl(
        Constants.jackettAPI.getTorznabIndexers,
        this.settings.connectionSettings
      )
    );
  }

  /**
   * Retrieves a list of all configured indexers.
   */
  getConfiguredIndexers() {}

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
   */
  searchAll() {}
}
