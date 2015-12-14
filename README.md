# Slack File Backup & Delete

Few times a year our team finds ourselves in need of purging slack files. This quick script will download *YOUR* files
and delete them. 

Use:
* Run `npm i`
* Copy the `.env.dist` to `.env` and fill in the configuration items. You can find your tokens [here](https://api.slack.com/tokens)
* run `node backup.js` 
* Enjoy. 