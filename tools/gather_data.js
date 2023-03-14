const models = require('../src/models');
const csv = require('csv-parser');
const fs = require('fs');
const Settings = require('../src/settings'); 
// const readLastLines = require('read-last-lines');

const { open } = require('fs/promises');

(async () => {
  var files = fs.readdirSync(Settings.DATA)
    .sort((a, b) => {
      return fs.statSync(`${Settings.DATA}/${b}`).mtime.getTime() - fs.statSync(Settings.DATA + '/' + a).mtime.getTime();
    });
  let experiments = files.map(async data => {
    const file = await open(`${Settings.DATA}/${data}`);
    var t_start, t_end;
    for await (const line of file.readLines()) {
      var t = line.split(' ')[0];
      if (t_start == undefined) { t_start = t; }
      t_end = t;
    }
    // var last = await readLastLines.read(`${Settings.DATA}/${data}`, 1);
    var duration = t_end - t_start;
    if (Number.isNaN(duration)) { duration = 0; }
    var fields = data.substring(0, data.lastIndexOf('.')).split('_');
    var username = fields[0];
    var date = fields[1];
    var time = fields[2];
    var datestr = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
    var timestr = `${time.substring(0, 2)}:${time.substring(2, 4)}:${time.substring(4, 6)}`;
    var startedAt = new Date(`${datestr}T${timestr}Z`);
    var finishedAt = new Date(startedAt);
    finishedAt.setSeconds(finishedAt.getSeconds() + duration)
  
    try {
      var session = await models.Session.build({
        ActivityName: 'Dobot Magician',
        UserUsername: username,
        startedAt,
        finishedAt,
        data,
      });
      session.save()
      console.log(session.toJSON())
    } catch(e) {
      console.log(e)
    }
  });
  }
)()