# jackett-api

## Overview
The package provides a simple API to communicate with a Jackett server.

## Usage overview
| Function      | Returns       |Description|Exceptions|
| ------------- | ------------- |-----------|----------|
| isValidServer  | Promise \<boolean\>  | Sends an HTTP request to test the connection to the server & tries to parse the result(Tests XML type) ||
| getTorznabIndexers  | Promise\<Array\<TorznabIndexerModel\>\>  | Fetches a list of all **supported** trackers on Jackett | - HTTP Error <br/> - parsing error |
| getConfiguredIndexers  | Promise\<Array\<TorznabIndexerModel\>\>  | Fetches a list of all **configured** trackers on Jackett | - HTTP Error <br/> - parsing error | 
| searchAll | Promise\<Array\<RssResultModel\>\> | Fetches a list of torrent results, by a given search query, from all configured trackers combined | - HTTP Error <br/> - parsing error |
| searchIndexers | Promise\<Array\<RssResultModel\>\> | Fetches a list of torrent results, by a given search query, from the specific indexers | - HTTP Error <br/> - parsing error |
| getIndexerRss | Promise\<Array\<RssResultModel\>\> | Fetches a list of torrent results from an Rss feed of a given indexer | - HTTP Error <br/> - parsing error |
| downloadTorrent | Promise\<void\> | Downloads a torrent frile of a given RssResult | - HTTP Error <br/> - parsing error <br/> - FileSystem errors(Ex. Permissions) |

## Error handling

The API returns promises and it is the implementor׳s responsibility to catch any exception thrown in the process. A list of possible exceptions can be found for each method on the “Usage Overview” section.

## DTO Structure

### RssResultModel
Represnting a single Rss result item.

```typescript
class RssResultModel {
    private _indexerId: string,
    private _indexerName: string,
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
}
```

### TorznabIndexerModel
Representing a Jackett Indexer.

``` typescript
class TorznabIndexerModel {
    private _id: string,
    private _configured: boolean,
    private _title: string,
    private _description: string,
    private _link: string,
    private _language: string,
    private _type: IndexerType
}
```
#### IndexerType
The type of an indexer

```typescript 
enum IndexerType {
  private,
  public,
}
```
## Jackett Version

The code has been tested on Jackett versions: v0.17.xx
