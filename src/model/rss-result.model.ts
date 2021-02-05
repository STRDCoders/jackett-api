export class RssResultModel {
  constructor(
    private _trackerId: string,
    private _trackerName: string,
    private _title: string,
    private _publishDate: Date,
    private _category: string[],
    private _downloadLink: string,
    /** _size Size of the torrent content **/
    private _size: number,
    private _fileCount: number,
    private _grabs: number,
    private _seeders: number,
    private _peers: number
  ) {}

  get trackerId(): string {
    return this._trackerId;
  }

  get trackerName(): string {
    return this._trackerName;
  }

  get title(): string {
    return this._title;
  }

  get publishDate(): Date {
    return this._publishDate;
  }

  get category(): string[] {
    return this._category;
  }

  get downloadLink(): string {
    return this._downloadLink;
  }

  get size(): number {
    return this._size;
  }

  get fileCount(): number {
    return this._fileCount;
  }

  get grabs(): number {
    return this._grabs;
  }

  get seeders(): number {
    return this._seeders;
  }

  get peers(): number {
    return this._peers;
  }

  static fromJson(data: any): RssResultModel {
    const torznabData = {};
    data["torznab:attr"].forEach((torznabDataItem) =>
      Object.assign(torznabData, {
        [torznabDataItem.$.name]: torznabDataItem.$.value,
      })
    );
    return new RssResultModel(
      data.jackettindexer[0]._,
      data.jackettindexer[0].$.id,
      data.title[0],
      new Date(data.pubDate[0]),
      data.category,
      data.enclosure[0].$.url,
      data.enclosure[0].$.length,
      data.files ? Number(data.files[0]) : 0,
      data.files ? Number(data.grabs[0]) : 0,
      torznabData["seeders"],
      torznabData["peers"]
    );
  }
}
