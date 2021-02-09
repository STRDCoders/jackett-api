export enum IndexerType {
  private,
  public,
}

export class TorznabIndexerModel {
  constructor(
    private _id: string,
    private _configured: boolean,
    private _title: string,
    private _description: string,
    private _link: string,
    private _language: string,
    private _type: IndexerType
  ) {}

  get id(): string {
    return this._id;
  }

  get configured(): boolean {
    return this._configured;
  }

  get title(): string {
    return this._title;
  }

  get description(): string {
    return this._description;
  }

  get link(): string {
    return this._link;
  }

  get language(): string {
    return this._language;
  }

  get type(): IndexerType {
    return this._type;
  }

  static fromJson(data: any): TorznabIndexerModel {
    return new TorznabIndexerModel(
      data.$.id,
      JSON.parse(data.$.configured),
      data?.title[0],
      data?.description[0],
      data?.link[0],
      data?.language[0],
      IndexerType[data?.type[0] as keyof typeof IndexerType]
    );
  }
}
