const path = require('path');
const TEST_DIR = path.normalize(`${__dirname}/../../test`);
process.env.BASE = TEST_DIR;
process.env.CODEBASE = path.normalize(`${__dirname}/..`);
process.env.SQLITE_DB_FILE = `${TEST_DIR}/var/db/database.sqlite`;

const fs = require('fs');
const { where } = require('sequelize');
const { Hardware } = require('../config/AppConfig');
const exp = require('constants');
const { doesNotMatch } = require('assert');

const models = require(`${process.env.CODEBASE}/models`);
const { Updater } = require(`${process.env.CODEBASE}/updater`);
const { SessionManager, HardwarePool } = require(`${process.env.CODEBASE}/sessions`);

describe('Test Updater', () => {
  beforeAll(async () => {
    await models.sequelize.sync({ force: true });
    await models.User.create({
      username: 'admin',
      displayName: 'Administrator',
      emails: 'jeschaco@ucm.es',
      password: 'admin_circuit',
      permissions: 'ADMIN;RO'
    });
    fs.mkdirSync(`${TEST_DIR}/var/views`, {'recursive': true});
    fs.mkdirSync(`${TEST_DIR}/var/controllers`, {'recursive': true});
  });

  afterAll(() => {
    fs.unlinkSync(process.env.SQLITE_DB_FILE);
    fs.rmdirSync(`${TEST_DIR}/var`, {recursive: true});
  });

  test('Can get hardware.', (done) => {
    Updater.addController({
      'name': 'Controller',
      'controller': fs.readFileSync(`${TEST_DIR}/fixtures/Controller_Circuitos_PC.zip`)
    }).then(controller => {
      var hardware1 = HardwarePool.getHardwareFor(controller);
      expect(hardware1).not.toBeNull();
      expect(hardware1).toHaveProperty('adapter');
      expect(hardware1).toHaveProperty('logger');
      expect(hardware1).toHaveProperty('eventGenerator');
      var hardware2 = HardwarePool.getHardwareFor(controller);
      expect(hardware1).toBe(hardware2);
      done();
    }).catch(error => { done(error); });
  });

  // test('Can start activity.', done => {
  //   Updater.addActivity({
  //     'name': 'Test',
  //     'disconnectTimeout': 0.1,
  //     'sessionTimeout': 1,
  //     'view': fs.readFileSync(`${TEST_DIR}/fixtures/View_Sistemas Lineales.zip`),
  //     'controller': fs.readFileSync(`${TEST_DIR}/fixtures/Controller_C.zip`)
  //   }).then(() => {
  //     models.User.findOne({
  //       where: { username: 'admin'}
  //     })
  //       .then(user => {
  //       var activity = 'Test';
  //       var credentials = { 'username': user.username, 'password': user.password };
  //       SessionManager.connect(activity, credentials, "test_user", "1")
  //       .then(session => {
  //         expect(session).not.toBeNull();
  //         expect(session.finished).toBe(false);
  //         session.end().then(result => {
  //           console.log(result)
  //           console.log(session.finished)
  //           expect(session.finished).toBe(true);
  //           done();
  //         });
  //       })
  //     })
  //   })
  // });
});