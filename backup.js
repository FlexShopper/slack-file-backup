require('dotenv').load();

if ((process.env.API_TOKEN === undefined || process.env.API_TOKEN == '')
    || (process.env.DOWNLOAD_DIR === undefined || process.env.DOWNLOAD_DIR == '')) {
    console.error("Must set API_TOKEN in .env");
    process.exit(1);
}

const Slack       = require('slack-node');
const http        = require('https');
const fs          = require('fs');
const slackClient = new Slack(process.env.API_TOKEN);

const download = function(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close(cb);
        });
    }) ;
};

const apiCheck = function(response) {
    if (response.ok !== true) {
        console.error("API call for failed failed");
        process.exit(1);
    }
};

slackClient.api('auth.test', function(err, response) {
    apiCheck(response);

    slackClient.api('files.list?count=1000000&user=' + response.user_id, function(err, response) {
        apiCheck(response);

        response.files.forEach(function(file) {
            console.log("Downloading " + file.name);
            if (file.url_download == undefined || file.url_download.match(/gist/)) {
                return;
            }

            download(
                file.url_download,
                process.env.DOWNLOAD_DIR + "/" + file.id + '_' + file.name,
                function() {
                    slackClient.api('files.delete?file=' + file.id, function(err, response) {
                        if (response.ok === true) {
                            console.log('Deleted ' + file.name);
                        } else {
                            console.error("Could not delete " + file.name);
                            console.log(response);
                        }
                    });
                }
            );
        });
    });
});