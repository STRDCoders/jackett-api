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

The API returns promises and it is the implementors responsibility to catch any exception thrown in the process. A list of possible exceptions can be found for each method on the “Usage Overview” section.


## Jackett Version

The code has been tested on Jackett versions: v0.17.xx
