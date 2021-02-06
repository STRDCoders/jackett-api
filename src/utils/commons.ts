import { IJackettApiUrlModel } from "../model/jackett-api-url.model";
import { Constants } from "./constants";
import { IJackettUrlSetting } from "../model/jackett-settings.model";

export class Commons {
  static buildUrl(
    path: IJackettApiUrlModel,
    connectSetting: IJackettUrlSetting,
    data?: any
  ) {
    let url =
      connectSetting.baseUrl +
      path.prefix +
      "?" +
      Constants.jackettAPI.apiParam +
      "=" +
      connectSetting.apiKey;
    url += path.suffix !== undefined ? "&" + path.suffix : "";
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
    input = input.replace(/%\w+%/g, (all) => (all in data ? data[all] : all));
    console.log(input);

    return input;
  }
}
