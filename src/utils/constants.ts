import { IJackettApiUrlModel } from "../model/jackett-api-url.model";

export class Constants {
  static readonly jackettAPI = class {
    static readonly apiParam = "apikey";
    static readonly getTorznabIndexers: IJackettApiUrlModel = {
      prefix: "/indexers/all/results/torznab",
      suffix: "&t=indexers",
    };
  };
}
