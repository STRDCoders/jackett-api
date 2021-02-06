import { IJackettApiUrlModel } from "../model/jackett-api-url.model";

export class Constants {
  static readonly jackettAPI = class {
    static readonly apiParam = "apikey";
    static readonly getTorznabIndexers: IJackettApiUrlModel = Object.freeze({
      prefix: "/indexers/all/results/torznab",
      suffix: "t=indexers",
    });
    static readonly searchAll: IJackettApiUrlModel = Object.freeze({
      prefix: "/indexers/all/results/torznab",
      suffix: "t=search&q=%query%",
    });
    static readonly getIndexerRss: IJackettApiUrlModel = Object.freeze({
      prefix: "/indexers/%indexerId%/results/torznab",
      suffix: "t=search",
    });
  };
}
