const models = require('../models');
const logger = require('winston').loggers.get('log');

(async () => {
  try {
    await models.sequelize.sync({ alter: true });
  } catch(e) {
    logging.error(e);
  }
})();
