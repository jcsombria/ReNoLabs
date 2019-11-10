var Config = require('../AppConfig');
var fs = require('fs');
var spawn = require('child_process').spawn;

class CodeManager {
  upload_view(data) {
    /*  Upload the code */
    var fileName = Config.Lab.GUI_JS;
    var code_stream = fs.createWriteStream('./views/' + fileName);
    code_stream.write(data);
    code_stream.end();
  }

  upload_code(data) {
    /*  Upload the controller code */
    var username = data.name;
    var lang = data.languaje; // Me duelen los ojos!!!
    this.prepare_dev_folder(lang, username);
    var folder = 'controllers/' + data.languaje;
    if (data.version && data.version === 'private') {
      folder = folder  + '/users/' + data.name + '/';
      username = data.name;
    } else {
      folder = folder  + '/default/';
    }
    for (var f in data.files) {
      var code_stream = fs.createWriteStream(folder + data.files[f].fileName);
      code_stream.write(data.files[f].code);
      code_stream.end();
    }
    this.compile_code(data.languaje, username, null);
  }

  download_code(data) {
    /*  Download the code */
    var folder = 'controllers/' + data.languaje;
    if (data.version && data.version === 'private') {
      folder = folder  + '/users/' + data.name + '/';
    } else {
      folder = folder  + '/default/';
    }
    var fileNames = fs.readdirSync(folder);
    var files = [];
    for (var i = 0; i < fileNames.length; i++) {
      var name = fileNames[i];
      if (name.length - name.lastIndexOf(".c") == 2) {
        var fileInfo = {};
        fileInfo.fileName = name;
        fileInfo.code = fs.readFileSync(folder + name, {encoding: 'utf8'});
        files.push(fileInfo);
      }
    }
    return files;
  }

  prepare_dev_folder(lang, username) {
    try {
      var stats = fs.statSync('./controllers/'+ lang + '/users/' + username);
    } catch (e) {
      console.info('[INFO] Folder not found!');
      var fromFolder = './controllers/' + lang + '/default/';
      console.log(fromFolder);
      var toFolder = './controllers/' + lang + '/users/' + username + '/';
      console.log(toFolder);
      var fileNames = fs.readdirSync(fromFolder);
      var files = [];
      fs.mkdirSync(toFolder);
      for (var i = 0; i < fileNames.length; i++) {
        var name = fileNames[i];
        var content = fs.readFileSync(fromFolder + name);
        var stats = fs.statSync(fromFolder + name);
        fs.writeFileSync(toFolder + name, content, {mode: stats.mode});
      }
    }
  }

  compile_code(lang, user, socket) {
    /*
     * Ejecuta el controlador e inicia una comunicación síncrona.
     */
    var p;
    if (user == null) {
      p = spawn('make',['-C', './controllers/'+ lang + '/default', '-f', 'Makefile', 'c_controller']);
    }
    else {
      p = spawn('make',['-C', './controllers/'+ lang + '/users/' + user, '-f', 'Makefile', 'c_controller']);
    }

    /*
     * Recibe la información del compilador canalizandola al usuario.
     * Además guarda el estado en el servidor para escribir en el fichero
     * toda la información que necesita el cliente (señal + controller).
     */
    p.stdout.setEncoding('utf8');
    p.stdout.on('data', function(data) {
//        console.log(data);
    });

    /*
     * En caso de fallo del controlador resetea las variables config y evolucion.
     * Si hay algún usuario conectado en ese momento lo redirige a la página principal.
     */
    p.on('exit', function(code, string) {
        if (code == null) {
            console.log('Process ended due to signal: ' + string);
            if (socket != null) {
                socket.emit('compilation_result', { signal: string });
            }
        }
        else {
            console.log('Process ended with code: ' + code);
            if (socket != null) {
                socket.emit('compilation_result', { code: code });
            }
        }
    });

    /*
     * En caso de error se escribe en la terminal o en su defecto en un
     * fichero de salida (output.log) si se ejecuta el servidor como:
     * nohup node app_....js > output.log &
     */
    p.stderr.setEncoding('utf8');
    p.stderr.on('data', function(data) {
        console.log('Error: ' + data);
        if (socket != null) {
            socket.emit('compilation_error', { error: data });
        }
    });
  }
}

module.exports = CodeManager;
