const models = require('../src/models');
const csv = require('csv-parser');
const fs = require('fs');

function title(str) {
  return str.split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase())
    .join(' ');
}

(async () => {

  var usersImported = 0;

  fs.createReadStream('tools/students.csv')
    .pipe(csv({ delimiter: ',' }))
    .on('error', (error) => {
      console.log(error);
    })
    .on('data', (row) => {
      models.User.create({
        username: row['Correo'],
        displayName: `${title(row['Apellidos'])}, ${title(row['Nombre'])}`,
        password: `${row['Nombre'].toUpperCase().substring(0, 4)}${row['DNI'].substring(0, 4)}`,
        emails: row['Correo'],
        permissions: 'USER'
      })
        .then(async user => {
          console.log(`${user.username} created.`)
          let a = await models.Activity.findOne({ where: { name: 'Dobot Magician'}});
          user.addActivity(a);
          usersImported ++;
        })
        .catch(e => {
          console.log(e)
        });
    })
    .on('end', () => {
      console.log('CSV file successfully processed');
      console.log(`${usersImported} users created.`);
    });
  }
)()