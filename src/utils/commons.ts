import { IJackettApiUrlModel } from "../model/jackett-api-url.model";
import { Constants } from "./constants";
import { IJackettUrlSetting } from "../model/jackett-settings.model";

export class Commons {
  static buildUrl(
    path: IJackettApiUrlModel,
    connectSetting: IJackettUrlSetting
  ) {
    let url =
      connectSetting.baseUrl +
      path.prefix +
      "?" +
      Constants.jackettAPI.apiParam +
      "=" +
      connectSetting.apiKey;
    url += path.suffix !== undefined ? path.suffix : "";
    return url;
  }
}
