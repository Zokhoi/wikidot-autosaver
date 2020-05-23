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
 Set up [config](./config-example.json) and rename as `config.json` with the following options:

 `site`: `Array` of `String` indicating what wikidot sites you are going to save to. <br/>
 e.g. `["scp-sandbox-3", "wanderers-sandbox"]` means that you are going to save to `http://scp-sandbox-3.wikidot.com` and `http://wanderers-sandbox.wikidot.com`.

 `source`: `String` indicating the folder path where all your wikidot files are located.

----
### Autosave Folder Structure
The script auto-generates folders named with sites specified in the config in the folder specified source folder path. e.g.
```JSON
{
  "site": ["scp-sandbox-3", "wanderers-sandbox"],
  "source": "D:/Wikidot/"
}
```
And for example you want to save to `scp-sandbox-3` and `wanderers-sandbox` a page each named `a` and `b:c`,
then the folder structure in `D:/Wikidot/` will be:
```
.
├──scp-sandbox-3
|   └──a
├──wanderers-sandbox
|   └──b~c
```
Note that colons are converted into tildes, as colons are forbidden symbols for file names in Windows.

----
### File Structure
The file that you save should be of the following structure:
```
title: (your title here)
tags: (tags here)
comment: (revision comment here)
(another line of comment here)
~~~~~~
(your page source here)
```
Any of title, tags and comment are optional but are suggested to be kept even if they are empty.
Title and tags only accept one line, any other lines will be treated as revision comments.
