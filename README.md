# Wikidot Autosaver
 A simple script that auto-saves to wikidot.
 This script requires login to wikidot via CLI to work.

 ------
 ### Dependencies and starting the script
 This script requires Node v8 or above to work as it uses async/await. Install other dependencies with
 ```
 npm i
 ```
 Start the script with
 ```
 node index.js
 ```
 in command line.

 ----
 ### Config
 Set up [config.yml](./config-example.yml) or [config.json](./config-example.json) and rename as `config.yml` or `config.json` with the following options:

 * `site`: `Array` of `String` indicating what wikidot sites you are going to save to. <br/>
 e.g. `["scp-sandbox-3", "wanderers-sandbox"]` means that you are going to save to `http://scp-sandbox-3.wikidot.com` and `http://wanderers-sandbox.wikidot.com`.
 * `source`: `String` indicating the folder path where all your wikidot files are located.
 * `pages`: `String` or `Array` of `String` indicating the pages you want to save to wikidot:
  * `*` indicates you want to save all existing files in the under the site folder to wikidot;
  * `"page-name"` indicates you want to save only the specified _page-name_ to wikidot;
  * `["page-name-1", "page-name-2"]` indicates you want to save only _page-name-1_ and _page-name-2_ to wikidot.


----
### Autosave Folder Structure
The script auto-generates folders named with sites specified in the config in the folder specified source folder path. <br />
e.g. if you want to save to `scp-sandbox-3` page `a`, and to `wanderers-sandbox` pages `b:c` and `e`, <br />
`config.yml`:
```YAML
site:
  - "scp-sandbox-3"
  - "wanderers-sandbox"
source: "D:/Wikidot/"
pages:
  scp-sandbox-3: "*"
  wanderers-sandbox:
    - "b~c"
    - "e"
```
or equivalently `config.json`:
```JSON
{
  "site": ["scp-sandbox-3", "wanderers-sandbox"],
  "source": "D:/Wikidot/",
  "pages": {
    "scp-sandbox-3": "*",
    "wanderers-sandbox": [
      "b~c",
      "e"
    ]
  }
}
```
Then the folder structure in `D:/Wikidot/` can be:
```
.
├──scp-sandbox-3
|   └──a.txt
├──wanderers-sandbox
|   ├──b~c.txt
|   ├──d.txt
|   └──e.txt
```
And `d.txt` will not be saved to wikidot. <br />
Note that colons are converted into tildes, as colons are forbidden symbols for file names in Windows.

----
### File Content Structure
The file that you save should be of the following content structure:
```
title: (your title here)
tags: (tags here)
parent: (full parent page name here)
comments: (revision comment here)
(another line of comment here)
~~~~~~
(your page source here)
```
Any of title, tags, parent and comment are optional but are suggested to be kept even if they are empty, for your own ease.
Title, tags and parent only accept one line, any other lines will be treated as revision comments.
