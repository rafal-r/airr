# airr
small JavaScript MVC library for building mobile hybrid apps based on Cordova and HTML5. Supports Android 4+ and iOS 7+ webviews runtimes.

Example app that was built upon this library:

iOS: https://itunes.apple.com/us/app/way-the-app/id1234098502

Android: https://play.google.com/store/apps/details?id=pl.airr.way

# prerequisites
installed node.js and cordova

# example installation
with your command shell go to downloaded or cloned repo directory and run in this order:

1. `npm install`
2. `node airr.js [-d --debug]` - this commands builds our final app structure placed inside `www` directory
3. `cordova platform add (android | ios)`
4. `cordova prepare (android | ios)`
5. `cordova run (android | ios)`

# editting app
all app resources that are latter merged by `node airr.js` command are stored inside `source` directory


