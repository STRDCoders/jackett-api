import { IJackettApiUrlModel } from "../model/jackett-api-url.model";
import { Constants } from "./constants";
import { IJackettUrlSetting } from "../model/jackett-settings.model";

const urlJoin = require("url-join");

export class Commons {
  static buildUrl(
    path: IJackettApiUrlModel,
    connectSetting: IJackettUrlSetting,
    data?: any
  ) {
    const url = urlJoin(
      connectSetting.baseUrl,
      path.prefix,
      `?${Constants.jackettAPI.apiParam}=${connectSetting.apiKey}`,
      path.suffix !== undefined ? `&${path.suffix}` : ""
    );
    return data ? this.buildPlaceHolders(url, data) : url;
  }

  /**
   * Replaces placeholders in input string with matching params from data object.
   *
   * @param input string to replace its placeholders with data. Each placeholder should have a prefix & suffix of "%". Ex. "%PLACEHOLDER%"
   * @param data Object that contains the source of data to fill the placeholders on the input string. Each parameter key should have a prefix & suffix of "%". Ex. "%PLACEHOLDER%"
   * @return input Parsed string of the input & data.
   */
  static buildPlaceHolders(input: string, data: any): string {
    return input.replace(/%\w+%/g, (all) => (all in data ? data[all] : all));
  }
}
