# Wikidot Autosaver
 A simple script that auto-saves to wikidot.
 This script requires login to wikidot via CLI to work.

 ------
 ### Dependencies and starting the script
 This script requires Node v8 or above to work as it uses async/await. Install other dependencies with
 ```sh
 npm i
 ```
 Start the script with
 ```sh
 node index.js
 ```
 in command line.

 ----
 ### Config
 Set up [config.yml](./config-example.yml) or [config.json](./config-example.json) and rename as `config.yml` or `config.json` with the following options:

 * `source`: `String` indicating the folder path where all your wikidot files are located.
 * `pages`: key: `String`, value: `String` or `String[]`:
  * key indicates the directory to look in, and is the default site to save to for all files under that directory:
    * `"scp-sandbox-3"` means to look under that directory, and that you are going to save to `http://scp-sandbox-3.wikidot.com` by default, if not otherwise specified in the files
  * value indicates the files you want to save to the wikidot site:
    * `*` indicates you want to save all existing files in the under the site folder to wikidot;
    * `"file-name"` indicates you want to save only the specified _file-name_ file to wikidot;
    * `["file-name-1", "file-name-2"]` indicates you want to save only _file-name-1_ and _file-name-2_ files to wikidot.


----
### Autosave Folder Structure
The script auto-generates folders named with sites specified in the config in the specified source folder path. <br />
e.g. if you want to save to `scp-sandbox-3` page `a`, and to `wanderers-sandbox` pages `b:c` and `e`, <br />
`config.yml`:
```yaml
source: "D:/Wikidot/"
pages:
  scp-sandbox-3: "*"
  wanderers-sandbox:
    - "b~c"
    - "e"
```
or equivalently `config.json`:
```json
{
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
Then the folder structure in `D:/Wikidot/` will be:
```
.
├──scp-sandbox-3
|   └──a.txt
├──wanderers-sandbox
|   ├──b~c.txt
|   └──e.txt
```
Any other files in the specified site directory will be ignored. <br />
Note that colons are converted into tildes, as colons are forbidden symbols for file names in Windows.

----
### File Content Structure
The file that you save should be of the following content structure:
``` yaml
---
title: (your title here)
tags: (tags here)
parent: (full parent page name here)
comments: (revision comment here)
site: (the wikidot site the page belongs to here)
page: (the page unix name here)
---
(your page source here)
```
If `site` and `page` is supplied, it will override the site and page settings according to directory and file name. <br />
If not supplied, the default is to use the directory name for `site` and file name (without file extension) for `page`.

The old content structure is deprecated and are automatically converted to yaml frontmatter if detected:
```
title: (your title here)
tags: (tags here)
parent: (full parent page name here)
comments: (revision comment here)
~~~~~~
(your page source here)
```
Any of `site`, `page`, `title`, `tags`, `parent` and `comment` are optional.
