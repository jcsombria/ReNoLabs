process.env.BASE = __dirname;
process.env.SQLITE_DB_FILE = 'test/var/db/database.sqlite';

const path = require('path');
const BASE_DIR = path.normalize('../src');
const assert = require('assert');
const fs = require('fs');
const models = require(`${BASE_DIR}/models`);
const { where } = require('sequelize');
const { Updater, Bundle } = require(`${BASE_DIR}/updater`);
const AdmZip = require('adm-zip');
const { SessionManager } = require(`${BASE_DIR}/sessions`);

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
    fs.mkdirSync('test/var/views', {'recursive': true});
    fs.mkdirSync('test/var/controllers', {'recursive': true});
  });

  afterAll(() => {
    fs.unlinkSync(process.env.SQLITE_DB_FILE);
    fs.rmdirSync('test/var', {recursive: true});
  });

  test('Updater.addController stores controller in filesystem and adds new controller to database.', async () => {
    await Updater.addController({
      'controller': fs.readFileSync('test/fixtures/Controller_C.zip')
    });
    var controller = await models.Controller.findOne({
      where: { name: 'Circuit Controller' }
    });
    var controllerFileExists = fs.existsSync(`test/var/controllers/${controller.id}.zip`);
    var controllerFolderExists = fs.existsSync(`test/var/controllers/${controller.id}/`);
    expect(controllerFileExists).toBe(true);
    expect(controllerFolderExists).toBe(true);
    expect(controller).toMatchObject({
      'name': 'Circuit Controller',
      'type': 'C',
      // 'main': 'circuitos.c',
    });
  });

  test('Updater.addView with name provided stores view in filesystem and adds new view to database.', async () => {
    await Updater.addView({
      'name': 'Sistemas Lineales',
      'view': fs.readFileSync('test/fixtures/View_Sistemas Lineales.zip')
    });
    var view = await models.View.findOne({
      where: { name: 'Sistemas Lineales' }
    });
    var viewFileExists = fs.existsSync(`test/var/views/${view.id}.zip`);
    var viewFolderExists = fs.existsSync(`test/public/views/${view.id}/`);
    expect(viewFileExists).toBe(true);
    expect(viewFolderExists).toBe(true);
    expect(view).toMatchObject({
      'name': 'Sistemas Lineales',
      'path': 'Bode_Simulation.xhtml',
      'description': 'Bode_Intro_1.html',
    });
  });

  test('Updater.addView with name provided in bundle stores view in filesystem and adds new view to database.', async () => {
    await Updater.addView({
      'view': fs.readFileSync('test/fixtures/View_Sistemas Lineales.zip')
    });
    var view = await models.View.findOne({
      where: { name: 'Sistemas Lineales - Práctica de Identificación de Sistemas' }
    });
    var viewFileExists = fs.existsSync(`test/var/views/${view.id}.zip`);
    var viewFolderExists = fs.existsSync(`test/public/views/${view.id}/`);
    expect(viewFileExists).toBe(true);
    expect(viewFolderExists).toBe(true);
    expect(view).toMatchObject({
      'name': 'Sistemas Lineales - Práctica de Identificación de Sistemas',
      'path': 'Bode_Simulation.xhtml',
      'description': 'Bode_Intro_1.html',
    });
  });

  test('Updater.addActivity stores view/controller in filesystem and adds new activity to database.', async () => {
    await Updater.addActivity({
      'name': 'Sistemas Lineales',
      'view': fs.readFileSync('test/fixtures/View_Sistemas Lineales.zip'),
      'controller': fs.readFileSync('test/fixtures/Controller_C.zip')
    });
    var activity = await models.Activity.findOne({
      where: { name: 'Sistemas Lineales' }
    });
    var controllerFileExists = fs.existsSync(`test/var/controllers/${activity.ControllerId}.zip`);
    var controllerFolderExists = fs.existsSync(`test/var/controllers/${activity.ControllerId}/`);
    var viewFileExists = fs.existsSync(`test/var/views/${activity.ViewId}.zip`);
    var viewFolderExists = fs.existsSync(`test/public/views/${activity.ViewId}/`);
    expect(controllerFileExists).toBe(true);
    expect(controllerFolderExists).toBe(true);
    expect(viewFileExists).toBe(true);
    expect(viewFolderExists).toBe(true);
    expect(activity).toMatchObject({
      'name': 'Sistemas Lineales',
    });
  });


  test('Can start activity.', async () => {
    await Updater.addActivity({
      'name': 'Test',
      'view': fs.readFileSync('test/fixtures/View_Sistemas Lineales.zip'),
      'controller': fs.readFileSync('test/fixtures/Controller_C.zip')
    });
    var activity = await models.Activity.findOne({
      where: { name: 'Test' },
      include: 'Controller'
    });
    var user = await models.User.findOne({
      where: { username: 'admin'}
    });
    console.log(activity.Controller)
    var credentials = { 'username': user.username, 'password': user.password };
    var session = SessionManager.connect("test_user", null, credentials, activity);
    expect(session).not.toBeNull();
    console.log(session.hardware)

    session.end()

  });

});