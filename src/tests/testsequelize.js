const models = require('./models');

// sequelize.sync({ force: true }).then();
// const view = View.create({
//   name: "Sistemas Lineales",
//   path: '/Sistemas Lineales/Unnamed_Simulation.xhtml'
// }).catch((e) => {
//   e.errors.forEach((e) => {
//     console.log(e.message);
//   });
// });

const v = models.View.findAll({
  where: {
    name: "Sistemas Lineales"
  }
}).then((result) => {
  result.forEach((view)=>{
    console.log(view.dataValues)
  })
}).catch((error) => {
  // console.log(error);
});

// console.log(v)
// (async() => { 
//     try {
//     await sequelize.authenticate();
//     console.log('Connection has been established successfully.');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//   }
// })();

