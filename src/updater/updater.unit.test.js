const path = require('path');
const TEST_DIR = path.normalize(`${__dirname}/../../test`);
process.env.BASE = TEST_DIR;
process.env.CODEBASE = path.normalize(`${__dirname}/..`);
process.env.SQLITE_DB_FILE = `${TEST_DIR}/var/db/database.sqlite`;

const fs = require('fs');
const { where } = require('sequelize');

const models = require(`${process.env.CODEBASE}/models`);
const { Updater } = require(`${process.env.CODEBASE}/updater`);

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

  test('Updater.addController stores controller in filesystem and adds new controller to database.', async () => {
    await Updater.addController({
      'controller': fs.readFileSync(`${TEST_DIR}/fixtures/Controller_Circuitos_PC.zip`)
    });
    var controller = await models.Controller.findOne({
      where: { name: 'Circuitos PC' }
    });
    var controllerFileExists = fs.existsSync(`${TEST_DIR}/var/controllers/${controller.id}.zip`);
    var controllerFolderExists = fs.existsSync(`${TEST_DIR}/var/controllers/${controller.id}/`);
    expect(controllerFileExists).toBe(true);
    expect(controllerFolderExists).toBe(true);
    expect(controller).toMatchObject({
      'name': 'Circuitos PC',
      'type': 'C',
      'path': 'circuitos',
    });
  });

  test('Updater.addView with name provided stores view in filesystem and adds new view to database.', async () => {
    await Updater.addView({
      'name': 'Sistemas Lineales',
      'view': fs.readFileSync(`${TEST_DIR}/fixtures/View_Sistemas Lineales.zip`)
    });
    var view = await models.View.findOne({
      where: { name: 'Sistemas Lineales' }
    });
    var viewFileExists = fs.existsSync(`${TEST_DIR}/var/views/${view.id}.zip`);
    var viewFolderExists = fs.existsSync(`${TEST_DIR}/public/views/${view.id}/`);
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
      'view': fs.readFileSync(`${TEST_DIR}/fixtures/View_Sistemas Lineales.zip`)
    });
    var view = await models.View.findOne({
      where: { name: 'Sistemas Lineales - Práctica de Identificación de Sistemas' }
    });
    var viewFileExists = fs.existsSync(`${TEST_DIR}/var/views/${view.id}.zip`);
    var viewFolderExists = fs.existsSync(`${TEST_DIR}/public/views/${view.id}/`);
    expect(viewFileExists).toBe(true);
    expect(viewFolderExists).toBe(true);
    expect(view).toMatchObject({
      'name': 'Sistemas Lineales - Práctica de Identificación de Sistemas',
      'path': 'Bode_Simulation.xhtml',
      'description': 'Bode_Intro_1.html',
    });
  });

  test('Add invalid view throws.', done => {
    Updater.addView({
      'view': fs.readFileSync(`${TEST_DIR}/fixtures/Controller_Circuitos_PC.zip`)
    })
      .then(() => { done(new Error('Did not throw')); })
      .catch(error => { done(); });
  });

  test('Add invalid controller throws.', done => {
    Updater.addController({
      'controller': fs.readFileSync(`${TEST_DIR}/fixtures/View_Sistemas Lineales.zip`)
    })
      .then(() => { done(new Error('Did not throw')); })
      .catch(error => { done(); });
  });

  test('Add existent activity throws.', done => {
    Updater.addActivity({
      'name': 'Duplicated Activity',
      'view': fs.readFileSync(`${TEST_DIR}/fixtures/View_Sistemas Lineales.zip`),
      'controller': fs.readFileSync(`${TEST_DIR}/fixtures/Controller_Circuitos_PC.zip`)
    }).then( () => {
      Updater.addActivity({
        'name': 'Duplicated Activity',
        'view': fs.readFileSync(`${TEST_DIR}/fixtures/View_Sistemas Lineales.zip`),
        'controller': fs.readFileSync(`${TEST_DIR}/fixtures/Controller_Circuitos_PC.zip`)
      }).then(() => {
        done(new Error('Did not throw'));
      }).catch(error => {
        done();
      })

    })
  });

  test('Add invalid activity throws.', done => {
    Updater.addActivity({
      'name': 'Test',
      'controller': fs.readFileSync(`${TEST_DIR}/fixtures/View_Sistemas Lineales.zip`),
      'view': fs.readFileSync(`${TEST_DIR}/fixtures/Controller_Circuitos_PC.zip`)
    })
      .then(() => { done(new Error('Did not throw')); })
      .catch(error => { done(); });
  });

  test('Updater.addActivity stores view/controller in filesystem and adds new activity to database.', async () => {
    await Updater.addActivity({
      'name': 'Sistemas Lineales',
      'view': fs.readFileSync(`${TEST_DIR}/fixtures/View_Sistemas Lineales.zip`),
      'controller': fs.readFileSync(`${TEST_DIR}/fixtures/Controller_Circuitos_PC.zip`)
    });
    var activity = await models.Activity.findOne({
      where: { name: 'Sistemas Lineales' }
    });
    var controllerFileExists = fs.existsSync(`${TEST_DIR}/var/controllers/${activity.ControllerId}.zip`);
    var controllerFolderExists = fs.existsSync(`${TEST_DIR}/var/controllers/${activity.ControllerId}/`);
    var viewFileExists = fs.existsSync(`${TEST_DIR}/var/views/${activity.ViewId}.zip`);
    var viewFolderExists = fs.existsSync(`${TEST_DIR}/public/views/${activity.ViewId}/`);
    expect(controllerFileExists).toBe(true);
    expect(controllerFolderExists).toBe(true);
    expect(viewFileExists).toBe(true);
    expect(viewFolderExists).toBe(true);
    expect(activity).toMatchObject({
      'name': 'Sistemas Lineales',
    });
  });


  test('Can download controller files', done => {
    Updater.addController({
      'controller': fs.readFileSync(`${TEST_DIR}/fixtures/Controller_DOBOT.zip`)
    })
      .catch(error => { done(error); })
      .then(() => {
        Updater.getController({ 'name': 'DOBOT Controller' })
          .catch(error => { done(error); })
          .then(c => {
            c.forEach(f => {
              if ('filename' in f && 'code' in f) { return; }
              done(new Error('Invalid response'));
            })
            done();
          });
        });
  });

  test('Can download controller files as zip', done => {
    Updater.addController({
      'name': 'DOBOT zip',
      'controller': fs.readFileSync(`${TEST_DIR}/fixtures/Controller_DOBOT.zip`)
    })
      .catch(error => { done(error); })
      .then(() => {
        Updater.getController({ 'name': 'DOBOT zip', 'format': 'zip' })
          .catch(error => { done(error); })
          .then(c => {
            if (c.length == 1 && c[0]['filename'].endsWith('zip') && 'code' in c[0]) {
              return done();
            }
            done(new Error('Invalid Response'))
          });
        });
  });

  test('Can download view files', done => {
    Updater.addView({
      'name': 'Sistemas Lineales raw',
      'view': fs.readFileSync(`${TEST_DIR}/fixtures/View_Sistemas Lineales.zip`)
    })
      .catch(error => { done(error); })
      .then(() => {
        Updater.getView({ 'name': 'Sistemas Lineales raw' })
          .catch(error => { done(error); })
          .then(c => {
            c.forEach(f => {
              if ('filename' in f && 'code' in f) { return; }
              done(new Error('Invalid response'));
            })
            done()
          });
        });
  });

  test('Can download view files as zip', done => {
    Updater.addView({
      'name': 'Sistemas Lineales zip',
      'view': fs.readFileSync(`${TEST_DIR}/fixtures/View_Sistemas Lineales.zip`)
    })
      .catch(error => { done(error); })
      .then(() => {
        Updater.getView({ 'name': 'Sistemas Lineales zip', 'format': 'zip' })
          .catch(error => { done(error); })
          .then(c => {
            if (c.length == 1 && c[0]['filename'].endsWith('zip') && 'code' in c[0]) {
              return done();
            }
            done(new Error('Invalid Response'))
          });
        });
  });

  test('Can delete controller', async () => {
    var controller = await Updater.addController({
      'name': 'Controller to delete',
      'controller': fs.readFileSync(`${TEST_DIR}/fixtures/Controller_DOBOT.zip`)
    });
    var controller1 = await models.Controller.findOne({
      where: { id: controller.id}
    });
    await Updater.deleteController({ 'id': controller.id });
    var controller2 = await models.Controller.findOne({
      where: { id: controller.id }
    });
    var controllerFileExists = fs.existsSync(`${TEST_DIR}/var/controllers/${controller.id}.zip`);
    var controllerFolderExists = fs.existsSync(`${TEST_DIR}/var/controllers/${controller.id}/`);
    expect(controller1).not.toBe(null);
    expect(controller2).toBe(null);
    expect(controllerFileExists).toBe(false);
    expect(controllerFolderExists).toBe(false);
  })

  test('Can delete view', async () => {
    var view = await Updater.addView({
      'name': 'view to delete',
      'view': fs.readFileSync(`${TEST_DIR}/fixtures/View_Sistemas Lineales.zip`)
    });
    var view1 = await models.View.findOne({
      where: { id: view.id}
    });
    await Updater.deleteView({ 'id': view.id });
    var view2 = await models.View.findOne({
      where: { id: view.id }
    });
    var viewFileExists = fs.existsSync(`${TEST_DIR}/var/views/${view.id}.zip`);
    var viewFolderExists = fs.existsSync(`${TEST_DIR}/public/views/${view.id}/`);
    expect(view1).not.toBe(null);
    expect(view2).toBe(null);
    expect(viewFileExists).toBe(false);
    expect(viewFolderExists).toBe(false);
  })

  test('Can delete activity', async () => {
    var activity = await Updater.addActivity({
      'name': 'Activity to delete',
      'view': fs.readFileSync(`${TEST_DIR}/fixtures/View_Sistemas Lineales.zip`),
      'controller': fs.readFileSync(`${TEST_DIR}/fixtures/Controller_Circuitos_PC.zip`)
    });
    var activity1 = await models.Activity.findOne({
      where: { name: activity.name }
    });
    await Updater.deleteActivity({ 'name': activity.name });
    var activity2 = await models.Activity.findOne({
      where: { name: activity.name }
    });
    expect(activity1).not.toBe(null);
    expect(activity2).toBe(null);
  })

});