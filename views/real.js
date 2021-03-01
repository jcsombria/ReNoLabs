/* _inputParameters: an object with different values for the model parameters */
function Unnamed(_topFrame,_libraryPath,_codebasePath, _inputParameters) {
  var _model = EJSS_CORE.createAnimationLMS();
  var _view;
  var _isPlaying = false;
  var _isPaused = true;
  var _isMobile = (navigator===undefined) ? false : navigator.userAgent.match(/iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile/i);

var _stringProperties = {};
  var _tools = {
    showInputDialog : EJSS_INTERFACE.BoxPanel.showInputDialog,
    showOkDialog : EJSS_INTERFACE.BoxPanel.showOkDialog,
    showOkCancelDialog : EJSS_INTERFACE.BoxPanel.showOkCancelDialog,
    downloadText: EJSS_TOOLS.File.downloadText,
    uploadText: function(action) { EJSS_TOOLS.File.uploadText(_model,action); } 
  };

var lab = new LabInstance("147.96.67.49", "80");lab.connect();


  function _play()  { _isPaused = false; _isPlaying = true;  _model.play();  }
  function _pause() { _isPaused = true;  _isPlaying = false; _model.pause(); }
  function _step()  { _pause();  _model.step(); }
  function _reset() { _model.reset();  _isPaused = _model.isPaused(); _isPlaying = _model.isPlaying(); }
  _model._play  = _play;
  _model._pause = _pause;
  _model._step  = _step;
  _model._reset = _reset;
  function _update() { _model.update(); }
  function _initialize() { _model.initialize(); }
  function _setFPS(_fps) { _model.setFPS(_fps); }
  function _setDelay(_delay) { _model.setDelay(_delay); }
  function _setStepsPerDisplay(_spd) { _model.setStepsPerDisplay(_spd); }
  function _setUpdateView(_updateView) { _model.setUpdateView(_updateView); }
  function _setAutoplay(_auto) { _model.setAutoplay(_auto); }
  function _println(_message) { console.log(_message); }

  function _breakAfterThisPage() { _model.setShouldBreak(true); }

  function _resetSolvers() { if (_model.resetSolvers) _model.resetSolvers(); }

  function _saveText(name,type,content) { if (_model.saveText) _model.saveText(name,type,content); }

  function _saveState(name) { if (_model.saveState) _model.saveState(name); }

  function _saveImage(name,panelname) { if (_model.saveImage) _model.saveImage(name,panelname); }

  function _readState(url,type) { if (_model.readState) _model.readState(url,type); }

  function _readText(url,type,varname) { if (_model.readText) _model.readText(url,type,varname); }

  function _getStringProperty(propertyName) {
    var _value = _stringProperties[propertyName];
    if (_value===undefined) return propertyName;
    else return _value;
  }
  var __pagesEnabled = [];
  function _setPageEnabled(pageName,enabled) { __pagesEnabled[pageName] = enabled; }

  var time; // EjsS Model.Variables.Lab Variables.time
  var ref; // EjsS Model.Variables.Lab Variables.ref
  var u; // EjsS Model.Variables.Lab Variables.u
  var output; // EjsS Model.Variables.Lab Variables.output

  var showEvolution; // EjsS Model.Variables.View.showEvolution
  var showLissajous; // EjsS Model.Variables.View.showLissajous
  var window; // EjsS Model.Variables.View.window
  var max_window; // EjsS Model.Variables.View.max_window
  var MAX_WINDOW; // EjsS Model.Variables.View.MAX_WINDOW
  var MAX_POINTS; // EjsS Model.Variables.View.MAX_POINTS
  var autoScaleEvolution; // EjsS Model.Variables.View.autoScaleEvolution
  var autoScaleLissajous; // EjsS Model.Variables.View.autoScaleLissajous
  var ips; // EjsS Model.Variables.View.ips

  _model.getOdes = function() { return []; };

  _model.removeEvents = function(){
  };

  function _serialize() { return _model.serialize(); }

  _model._userSerialize = function() {
    return {
      time : time,
      ref : ref,
      u : u,
      output : output,
      showEvolution : showEvolution,
      showLissajous : showLissajous,
      window : window,
      max_window : max_window,
      MAX_WINDOW : MAX_WINDOW,
      MAX_POINTS : MAX_POINTS,
      autoScaleEvolution : autoScaleEvolution,
      autoScaleLissajous : autoScaleLissajous,
      ips : ips
    };
  };

  function _serializePublic() { return _model.serializePublic(); }

  _model._userSerializePublic = function() {
    return {
      time : time,
      ref : ref,
      u : u,
      output : output,
      showEvolution : showEvolution,
      showLissajous : showLissajous,
      window : window,
      max_window : max_window,
      MAX_WINDOW : MAX_WINDOW,
      MAX_POINTS : MAX_POINTS,
      autoScaleEvolution : autoScaleEvolution,
      autoScaleLissajous : autoScaleLissajous,
      ips : ips
    };
  };

  _model._readParameters = function(json) {
    if(typeof json.time != "undefined") time = json.time;
    if(typeof json.ref != "undefined") ref = json.ref;
    if(typeof json.u != "undefined") u = json.u;
    if(typeof json.output != "undefined") output = json.output;
    if(typeof json.showEvolution != "undefined") showEvolution = json.showEvolution;
    if(typeof json.showLissajous != "undefined") showLissajous = json.showLissajous;
    if(typeof json.window != "undefined") window = json.window;
    if(typeof json.max_window != "undefined") max_window = json.max_window;
    if(typeof json.MAX_WINDOW != "undefined") MAX_WINDOW = json.MAX_WINDOW;
    if(typeof json.MAX_POINTS != "undefined") MAX_POINTS = json.MAX_POINTS;
    if(typeof json.autoScaleEvolution != "undefined") autoScaleEvolution = json.autoScaleEvolution;
    if(typeof json.autoScaleLissajous != "undefined") autoScaleLissajous = json.autoScaleLissajous;
    if(typeof json.ips != "undefined") ips = json.ips;
  };

  _model._readParametersPublic = function(json) {
    if(typeof json.time != "undefined") time = json.time;
    if(typeof json.ref != "undefined") ref = json.ref;
    if(typeof json.u != "undefined") u = json.u;
    if(typeof json.output != "undefined") output = json.output;
    if(typeof json.showEvolution != "undefined") showEvolution = json.showEvolution;
    if(typeof json.showLissajous != "undefined") showLissajous = json.showLissajous;
    if(typeof json.window != "undefined") window = json.window;
    if(typeof json.max_window != "undefined") max_window = json.max_window;
    if(typeof json.MAX_WINDOW != "undefined") MAX_WINDOW = json.MAX_WINDOW;
    if(typeof json.MAX_POINTS != "undefined") MAX_POINTS = json.MAX_POINTS;
    if(typeof json.autoScaleEvolution != "undefined") autoScaleEvolution = json.autoScaleEvolution;
    if(typeof json.autoScaleLissajous != "undefined") autoScaleLissajous = json.autoScaleLissajous;
    if(typeof json.ips != "undefined") ips = json.ips;
  };

  function _unserializePublic(json) { return _model.unserializePublic(json); }

  _model._userUnserializePublic = function(json) {
    _model._readParametersPublic(json);
   _resetSolvers();
   _model.update();
  };

  function _unserialize(json) { return _model.unserialize(json); }

  _model._userUnserialize = function(json) {
    _model._readParameters(json);
   _resetSolvers();
   _model.update();
  };

  _model.addToReset(function() {
    __pagesEnabled["Init Page"] = true;
    __pagesEnabled["Evol Page"] = true;
    __pagesEnabled["FixRel Page"] = true;
  });

  _model.addToReset(function() {
    time = 0; // EjsS Model.Variables.Lab Variables.time
    ref = 0; // EjsS Model.Variables.Lab Variables.ref
    u = 0; // EjsS Model.Variables.Lab Variables.u
    output = 0; // EjsS Model.Variables.Lab Variables.output
  });

  _model.addToReset(function() {
    showEvolution = "inline-block"; // EjsS Model.Variables.View.showEvolution
    showLissajous = "inline-block"; // EjsS Model.Variables.View.showLissajous
    window = 5; // EjsS Model.Variables.View.window
    max_window = 5; // EjsS Model.Variables.View.max_window
    MAX_WINDOW = 200; // EjsS Model.Variables.View.MAX_WINDOW
    MAX_POINTS = 2000; // EjsS Model.Variables.View.MAX_POINTS
    autoScaleEvolution = false; // EjsS Model.Variables.View.autoScaleEvolution
    autoScaleLissajous = false; // EjsS Model.Variables.View.autoScaleLissajous
    ips = 10; // EjsS Model.Variables.View.ips
  });

  if (_inputParameters) {
    _inputParameters = _model.parseInputParameters(_inputParameters);
    if (_inputParameters) _model.addToReset(function() { _model._readParameters(_inputParameters); });
  }

  _model.addToReset(function() {
    _model.setAutoplay(true);
    _model.setPauseOnPageExit(false);
    _model.setFPS(20);
    _model.setStepsPerDisplay(1);
  });

  _model.addToInitialization(function() {
    if (!__pagesEnabled["Init Page"]) return;
  });

  _model.addToEvolution(function() {
    if (!__pagesEnabled["Evol Page"]) return;
    try {  // > Evolution.Evol Page:1
      available = lab.buffer.length;  // > Evolution.Evol Page:2
      if(available > 0) {  // > Evolution.Evol Page:3
        var c = Math.round(10 - 0.1*(10 - available));  // > Evolution.Evol Page:4
        if (c != ips) {  // > Evolution.Evol Page:5
          ips = c;  // > Evolution.Evol Page:6
          _model.setFPS(ips);  // > Evolution.Evol Page:7
        }  // > Evolution.Evol Page:8
        var state = lab.buffer.shift();  // > Evolution.Evol Page:9
        time = state[0];  // > Evolution.Evol Page:10
        ref = state[1];  // > Evolution.Evol Page:11
        u = state[2];  // > Evolution.Evol Page:12
        output = state[3];  // > Evolution.Evol Page:13
      }  // > Evolution.Evol Page:14
    //  time = lab.state_REAL.evolution[0];  // > Evolution.Evol Page:15
    //  ref = lab.state_REAL.evolution[1];  // > Evolution.Evol Page:16
    //  u = lab.state_REAL.evolution[2];  // > Evolution.Evol Page:17
    //  output = lab.state_REAL.evolution[3];  // > Evolution.Evol Page:18
    } catch(e) {  // > Evolution.Evol Page:19
      time = 0;  // > Evolution.Evol Page:20
      ref = 0;  // > Evolution.Evol Page:21
      u = 0;  // > Evolution.Evol Page:22
      output = 0;  // > Evolution.Evol Page:23
    }  // > Evolution.Evol Page:24
  });

  _model.addToFixedRelations(function() { _isPaused = _model.isPaused(); _isPlaying = _model.isPlaying(); });

  _model.addToFixedRelations(function() {
    if (!__pagesEnabled["FixRel Page"]) return;
    if (time < MAX_WINDOW) {  // > FixedRelations.FixRel Page:1
      max_window = Math.floor(time);  // > FixedRelations.FixRel Page:2
    } else if (isNaN(time)) {  // > FixedRelations.FixRel Page:3
      max_window = 5;  // > FixedRelations.FixRel Page:4
    } else {  // > FixedRelations.FixRel Page:5
      max_window = MAX_WINDOW;  // > FixedRelations.FixRel Page:6
    }  // > FixedRelations.FixRel Page:7
  });

  _model.addToFixedRelations(function() { _isPaused = _model.isPaused(); _isPlaying = _model.isPlaying(); });

    _model._fontResized = function(iBase,iSize,iDelta) {
      _view._fontResized(iBase,iSize,iDelta);
  }; // end of _fontResized

  function _getViews() {
    var _viewsInfo = [];
    var _counter = 0;
    _viewsInfo[_counter++] = { name : "HtmlView Page", width : 800, height : 600 };
    return _viewsInfo;
  } // end of _getViews

  function _selectView(_viewNumber) {
    _view = null;
    _view = new Unnamed_View(_topFrame,_viewNumber,_libraryPath,_codebasePath);
    var _view_super_reset = _view._reset;
    _view._reset = function() {
      _view_super_reset();
      switch(_viewNumber) {
        case -10 : break; // make Lint happy
        default :
        case 0:
          _view.mainPanel.linkProperty("CSS",  function() { return {"display":"inline-block",  "margin":"auto", }; } ); // HtmlView Page linking property 'CSS' for element 'mainPanel'
          _view.plottingPanel1.setAction("OnDoubleClick", function(_data,_info) {
  _view.ref.clear();
  _view.output.clear();
  _view.input.clear();

}); // HtmlView Page setting action 'OnDoubleClick' for element 'plottingPanel1'
          _view.plottingPanel1.linkProperty("MinimumX",  function() { return -window; } ); // HtmlView Page linking property 'MinimumX' for element 'plottingPanel1'
          _view.plottingPanel1.linkProperty("AutoScaleY",  function() { return autoScaleEvolution; }, function(_v) { autoScaleEvolution = _v; } ); // HtmlView Page linking property 'AutoScaleY' for element 'plottingPanel1'
          _view.plottingPanel1.linkProperty("Display",  function() { return showEvolution; }, function(_v) { showEvolution = _v; } ); // HtmlView Page linking property 'Display' for element 'plottingPanel1'
          _view.ref.linkProperty("Maximum",  function() { return MAX_POINTS; }, function(_v) { MAX_POINTS = _v; } ); // HtmlView Page linking property 'Maximum' for element 'ref'
          _view.ref.linkProperty("X",  function() { return -time; } ); // HtmlView Page linking property 'X' for element 'ref'
          _view.ref.linkProperty("InputX",  function() { return time; }, function(_v) { time = _v; } ); // HtmlView Page linking property 'InputX' for element 'ref'
          _view.ref.linkProperty("InputY",  function() { return ref; }, function(_v) { ref = _v; } ); // HtmlView Page linking property 'InputY' for element 'ref'
          _view.output.linkProperty("Maximum",  function() { return MAX_POINTS; }, function(_v) { MAX_POINTS = _v; } ); // HtmlView Page linking property 'Maximum' for element 'output'
          _view.output.linkProperty("X",  function() { return -time; } ); // HtmlView Page linking property 'X' for element 'output'
          _view.output.linkProperty("InputX",  function() { return time; }, function(_v) { time = _v; } ); // HtmlView Page linking property 'InputX' for element 'output'
          _view.output.linkProperty("InputY",  function() { return output; }, function(_v) { output = _v; } ); // HtmlView Page linking property 'InputY' for element 'output'
          _view.input.linkProperty("Maximum",  function() { return MAX_POINTS; }, function(_v) { MAX_POINTS = _v; } ); // HtmlView Page linking property 'Maximum' for element 'input'
          _view.input.linkProperty("X",  function() { return -time; } ); // HtmlView Page linking property 'X' for element 'input'
          _view.input.linkProperty("InputX",  function() { return time; }, function(_v) { time = _v; } ); // HtmlView Page linking property 'InputX' for element 'input'
          _view.input.linkProperty("InputY",  function() { return u; }, function(_v) { u = _v; } ); // HtmlView Page linking property 'InputY' for element 'input'
          _view.plottingPanel2.setAction("OnDoubleClick", function(_data,_info) {
  _view.trail2.clear();

}); // HtmlView Page setting action 'OnDoubleClick' for element 'plottingPanel2'
          _view.plottingPanel2.linkProperty("AutoScaleY",  function() { return autoScaleLissajous; }, function(_v) { autoScaleLissajous = _v; } ); // HtmlView Page linking property 'AutoScaleY' for element 'plottingPanel2'
          _view.plottingPanel2.linkProperty("AutoScaleX",  function() { return autoScaleLissajous; }, function(_v) { autoScaleLissajous = _v; } ); // HtmlView Page linking property 'AutoScaleX' for element 'plottingPanel2'
          _view.plottingPanel2.linkProperty("Display",  function() { return showLissajous; }, function(_v) { showLissajous = _v; } ); // HtmlView Page linking property 'Display' for element 'plottingPanel2'
          _view.trail2.linkProperty("Maximum",  function() { return MAX_POINTS; }, function(_v) { MAX_POINTS = _v; } ); // HtmlView Page linking property 'Maximum' for element 'trail2'
          _view.trail2.linkProperty("InputX",  function() { return u; }, function(_v) { u = _v; } ); // HtmlView Page linking property 'InputX' for element 'trail2'
          _view.trail2.linkProperty("InputY",  function() { return output; }, function(_v) { output = _v; } ); // HtmlView Page linking property 'InputY' for element 'trail2'
          _view.showEvolution.setAction("OnCheckOff", function(_data,_info) {
  showEvolution = "none";
  _view.autoScaleEvolution.setDisabled(true);

}); // HtmlView Page setting action 'OnCheckOff' for element 'showEvolution'
          _view.showEvolution.setAction("OnCheckOn", function(_data,_info) {
  showEvolution = "inline-block";
  _view.autoScaleEvolution.setDisabled(false);

}); // HtmlView Page setting action 'OnCheckOn' for element 'showEvolution'
          _view.autoScaleEvolution.linkProperty("Checked",  function() { return autoScaleEvolution; }, function(_v) { autoScaleEvolution = _v; } ); // HtmlView Page linking property 'Checked' for element 'autoScaleEvolution'
          _view.autoScaleEvolution.setAction("OnCheckOff", function(_data,_info) {
  _view.plottingPanel1.getController().setWorldYMin(-12);
  _view.plottingPanel1.getController().setWorldYMax(12);

}); // HtmlView Page setting action 'OnCheckOff' for element 'autoScaleEvolution'
          _view.autoScaleEvolution.setAction("OnCheckOn", function(_data,_info) {
  _view.plottingPanel1.getController().setWorldYMin(0)
  _view.plottingPanel1.getController().setWorldYMax(0);

}); // HtmlView Page setting action 'OnCheckOn' for element 'autoScaleEvolution'
          _view.slider.linkProperty("Maximum",  function() { return max_window; }, function(_v) { max_window = _v; } ); // HtmlView Page linking property 'Maximum' for element 'slider'
          _view.slider.linkProperty("Value",  function() { return window; }, function(_v) { window = _v; } ); // HtmlView Page linking property 'Value' for element 'slider'
          _view.showLissajous.setAction("OnCheckOff", function(_data,_info) {
  showLissajous = "none";
  _view.autoScaleLissajous.setDisabled(true);

}); // HtmlView Page setting action 'OnCheckOff' for element 'showLissajous'
          _view.showLissajous.setAction("OnCheckOn", function(_data,_info) {
  showLissajous = "inline-block";
  _view.autoScaleLissajous.setDisabled(false);

}); // HtmlView Page setting action 'OnCheckOn' for element 'showLissajous'
          _view.autoScaleLissajous.linkProperty("Checked",  function() { return autoScaleLissajous; }, function(_v) { autoScaleLissajous = _v; } ); // HtmlView Page linking property 'Checked' for element 'autoScaleLissajous'
          _view.autoScaleLissajous.setAction("OnCheckOff", function(_data,_info) {
  _view.plottingPanel2.getController().setWorldXMin(-12);
  _view.plottingPanel2.getController().setWorldXMax(12);
  _view.plottingPanel2.getController().setWorldYMin(-12);
  _view.plottingPanel2.getController().setWorldYMax(12);

}); // HtmlView Page setting action 'OnCheckOff' for element 'autoScaleLissajous'
          _view.autoScaleLissajous.setAction("OnCheckOn", function(_data,_info) {
  _view.plottingPanel2.getController().setWorldXMin(0);
  _view.plottingPanel2.getController().setWorldXMax(0);
  _view.plottingPanel2.getController().setWorldYMin(0);
  _view.plottingPanel2.getController().setWorldYMax(0);

}); // HtmlView Page setting action 'OnCheckOn' for element 'autoScaleLissajous'
          _view.labControl.linkProperty("Lab",  function() { return lab; }, function(_v) { lab = _v; } ); // HtmlView Page linking property 'Lab' for element 'labControl'
          _view.labFunctionParameter.linkProperty("Lab",  function() { return lab; }, function(_v) { lab = _v; } ); // HtmlView Page linking property 'Lab' for element 'labFunctionParameter'
          _view.labLogin.linkProperty("Labs",  function() { return lab; } ); // HtmlView Page linking property 'Labs' for element 'labLogin'
          break;
      } // end of switch
    }; // end of new reset

    _model.setView(_view);
    _model.reset();
    _view._enableEPub();
  } // end of _selectView

  _model.setAutoplay(true);
  _model.setFPS(20);
  _model.setStepsPerDisplay(1);
  _selectView(_model._autoSelectView(_getViews())); // this includes _model.reset()
  return _model;
}
function Unnamed_View (_topFrame,_viewNumber,_libraryPath,_codebasePath) {
  var _view;
  switch(_viewNumber) {
    case -10 : break; // make Lint happy
    default :
    case 0: _view = Unnamed_View_0 (_topFrame); break;
  } // end of switch

  if (_codebasePath) _view._setResourcePath(_codebasePath);

  if (_libraryPath) _view._setLibraryPath(_libraryPath);

  _view._addDescriptionPage('Intro Page','./Unnamed_Intro_1.html');

  return _view;
} // end of main function

function Unnamed_View_0 (_topFrame) {
  var _view = EJSS_CORE.createView(_topFrame);

  _view._reset = function() {
    _view._clearAll();
    _view._addElement(EJSS_INTERFACE.panel,"threePanelsPanel", _view._topFrame) // EJsS HtmlView.HtmlView Page: declaration of element 'threePanelsPanel'
      ;

    _view._addElement(EJSS_INTERFACE.panel,"labelPanel", _view.threePanelsPanel) // EJsS HtmlView.HtmlView Page: declaration of element 'labelPanel'
      ;

    _view._addElement(EJSS_INTERFACE.imageAndTextButton,"topLabel", _view.labelPanel) // EJsS HtmlView.HtmlView Page: declaration of element 'topLabel'
      .setProperty("Text","<h1>Práctica de Sistemas Lineales</h1>") // EJsS HtmlView.HtmlView Page: setting property 'Text' for element 'topLabel'
      ;

    _view._addElement(EJSS_INTERFACE.panel,"mainPanel", _view.threePanelsPanel) // EJsS HtmlView.HtmlView Page: declaration of element 'mainPanel'
      ;

    _view._addElement(EJSS_INTERFACE.panel,"subPanel1", _view.mainPanel) // EJsS HtmlView.HtmlView Page: declaration of element 'subPanel1'
      .setProperty("Height",300) // EJsS HtmlView.HtmlView Page: setting property 'Height' for element 'subPanel1'
      .setProperty("Width",800) // EJsS HtmlView.HtmlView Page: setting property 'Width' for element 'subPanel1'
      .setProperty("CSS",{"display":"flex",   "flex-direction":"row",   "margin":"2px",    "vertical-align": "top"}) // EJsS HtmlView.HtmlView Page: setting property 'CSS' for element 'subPanel1'
      ;

    _view._addElement(EJSS_DRAWING2D.plottingPanel,"plottingPanel1", _view.subPanel1) // EJsS HtmlView.HtmlView Page: declaration of element 'plottingPanel1'
      .setProperty("Height","100%") // EJsS HtmlView.HtmlView Page: setting property 'Height' for element 'plottingPanel1'
      .setProperty("Width","100%") // EJsS HtmlView.HtmlView Page: setting property 'Width' for element 'plottingPanel1'
      .setProperty("CSS",{"float":"left"}) // EJsS HtmlView.HtmlView Page: setting property 'CSS' for element 'plottingPanel1'
      .setProperty("EnabledZooming",true) // EJsS HtmlView.HtmlView Page: setting property 'EnabledZooming' for element 'plottingPanel1'
      .setProperty("Title","Entrada (azul), Salida (rojo)") // EJsS HtmlView.HtmlView Page: setting property 'Title' for element 'plottingPanel1'
      .setProperty("Enabled",true) // EJsS HtmlView.HtmlView Page: setting property 'Enabled' for element 'plottingPanel1'
      .setProperty("MaximumY",12) // EJsS HtmlView.HtmlView Page: setting property 'MaximumY' for element 'plottingPanel1'
      .setProperty("MaximumX",0) // EJsS HtmlView.HtmlView Page: setting property 'MaximumX' for element 'plottingPanel1'
      .setProperty("MinimumY",-12) // EJsS HtmlView.HtmlView Page: setting property 'MinimumY' for element 'plottingPanel1'
      .setProperty("TitleY","Amplitud (V)") // EJsS HtmlView.HtmlView Page: setting property 'TitleY' for element 'plottingPanel1'
      .setProperty("TitleX","Tiempo (s)") // EJsS HtmlView.HtmlView Page: setting property 'TitleX' for element 'plottingPanel1'
      .setProperty("AutoScaleX",false) // EJsS HtmlView.HtmlView Page: setting property 'AutoScaleX' for element 'plottingPanel1'
      ;

    _view._addElement(EJSS_DRAWING2D.trail,"ref", _view.plottingPanel1) // EJsS HtmlView.HtmlView Page: declaration of element 'ref'
      .setProperty("LineColor","Blue") // EJsS HtmlView.HtmlView Page: setting property 'LineColor' for element 'ref'
      .setProperty("NoRepeat",true) // EJsS HtmlView.HtmlView Page: setting property 'NoRepeat' for element 'ref'
      .setProperty("LineWidth",2) // EJsS HtmlView.HtmlView Page: setting property 'LineWidth' for element 'ref'
      ;

    _view._addElement(EJSS_DRAWING2D.trail,"output", _view.plottingPanel1) // EJsS HtmlView.HtmlView Page: declaration of element 'output'
      .setProperty("LineColor","Red") // EJsS HtmlView.HtmlView Page: setting property 'LineColor' for element 'output'
      .setProperty("NoRepeat",true) // EJsS HtmlView.HtmlView Page: setting property 'NoRepeat' for element 'output'
      .setProperty("LineWidth",2) // EJsS HtmlView.HtmlView Page: setting property 'LineWidth' for element 'output'
      ;

    _view._addElement(EJSS_DRAWING2D.trail,"input", _view.plottingPanel1) // EJsS HtmlView.HtmlView Page: declaration of element 'input'
      .setProperty("LineColor","Blue") // EJsS HtmlView.HtmlView Page: setting property 'LineColor' for element 'input'
      .setProperty("NoRepeat",true) // EJsS HtmlView.HtmlView Page: setting property 'NoRepeat' for element 'input'
      .setProperty("LineWidth",2) // EJsS HtmlView.HtmlView Page: setting property 'LineWidth' for element 'input'
      ;

    _view._addElement(EJSS_DRAWING2D.plottingPanel,"plottingPanel2", _view.subPanel1) // EJsS HtmlView.HtmlView Page: declaration of element 'plottingPanel2'
      .setProperty("Height","100%") // EJsS HtmlView.HtmlView Page: setting property 'Height' for element 'plottingPanel2'
      .setProperty("Width","100%") // EJsS HtmlView.HtmlView Page: setting property 'Width' for element 'plottingPanel2'
      .setProperty("CSS",{"float":"right"}) // EJsS HtmlView.HtmlView Page: setting property 'CSS' for element 'plottingPanel2'
      .setProperty("Enabled",true) // EJsS HtmlView.HtmlView Page: setting property 'Enabled' for element 'plottingPanel2'
      .setProperty("Title","") // EJsS HtmlView.HtmlView Page: setting property 'Title' for element 'plottingPanel2'
      .setProperty("MaximumY",12) // EJsS HtmlView.HtmlView Page: setting property 'MaximumY' for element 'plottingPanel2'
      .setProperty("MaximumX",12) // EJsS HtmlView.HtmlView Page: setting property 'MaximumX' for element 'plottingPanel2'
      .setProperty("MinimumX",-12) // EJsS HtmlView.HtmlView Page: setting property 'MinimumX' for element 'plottingPanel2'
      .setProperty("MinimumY",-12) // EJsS HtmlView.HtmlView Page: setting property 'MinimumY' for element 'plottingPanel2'
      .setProperty("TitleY","Salida (V)") // EJsS HtmlView.HtmlView Page: setting property 'TitleY' for element 'plottingPanel2'
      .setProperty("TitleX","Entrada (V)") // EJsS HtmlView.HtmlView Page: setting property 'TitleX' for element 'plottingPanel2'
      ;

    _view._addElement(EJSS_DRAWING2D.trail,"trail2", _view.plottingPanel2) // EJsS HtmlView.HtmlView Page: declaration of element 'trail2'
      .setProperty("LineColor","Blue") // EJsS HtmlView.HtmlView Page: setting property 'LineColor' for element 'trail2'
      .setProperty("NoRepeat",true) // EJsS HtmlView.HtmlView Page: setting property 'NoRepeat' for element 'trail2'
      .setProperty("LineWidth",2) // EJsS HtmlView.HtmlView Page: setting property 'LineWidth' for element 'trail2'
      ;

    _view._addElement(EJSS_INTERFACE.panel,"subPanel2", _view.mainPanel) // EJsS HtmlView.HtmlView Page: declaration of element 'subPanel2'
      .setProperty("Height","50px") // EJsS HtmlView.HtmlView Page: setting property 'Height' for element 'subPanel2'
      .setProperty("CSS",{ "vertical-align":"middle",    "display":"flex",   "flex-direction":"row"}) // EJsS HtmlView.HtmlView Page: setting property 'CSS' for element 'subPanel2'
      ;

    _view._addElement(EJSS_INTERFACE.panel,"panel", _view.subPanel2) // EJsS HtmlView.HtmlView Page: declaration of element 'panel'
      .setProperty("Width","50%") // EJsS HtmlView.HtmlView Page: setting property 'Width' for element 'panel'
      .setProperty("CSS",{"display":"flex",  "flex-direction":"column",}) // EJsS HtmlView.HtmlView Page: setting property 'CSS' for element 'panel'
      ;

    _view._addElement(EJSS_INTERFACE.panel,"panel2", _view.panel) // EJsS HtmlView.HtmlView Page: declaration of element 'panel2'
      ;

    _view._addElement(EJSS_INTERFACE.checkBox,"showEvolution", _view.panel2) // EJsS HtmlView.HtmlView Page: declaration of element 'showEvolution'
      .setProperty("Checked",true) // EJsS HtmlView.HtmlView Page: setting property 'Checked' for element 'showEvolution'
      .setProperty("CSS",{"vertical-align":"middle"}) // EJsS HtmlView.HtmlView Page: setting property 'CSS' for element 'showEvolution'
      .setProperty("Text","Evolución") // EJsS HtmlView.HtmlView Page: setting property 'Text' for element 'showEvolution'
      ;

    _view._addElement(EJSS_INTERFACE.checkBox,"autoScaleEvolution", _view.panel2) // EJsS HtmlView.HtmlView Page: declaration of element 'autoScaleEvolution'
      .setProperty("CSS",{"vertical-align":"middle"}) // EJsS HtmlView.HtmlView Page: setting property 'CSS' for element 'autoScaleEvolution'
      .setProperty("Text","Auto Escala - Evolución") // EJsS HtmlView.HtmlView Page: setting property 'Text' for element 'autoScaleEvolution'
      ;

    _view._addElement(EJSS_INTERFACE.panel,"panel3", _view.panel) // EJsS HtmlView.HtmlView Page: declaration of element 'panel3'
      ;

    _view._addElement(EJSS_INTERFACE.imageAndTextButton,"Window_", _view.panel3) // EJsS HtmlView.HtmlView Page: declaration of element 'Window_'
      .setProperty("CSS",{ "vertical-align":"middle" }) // EJsS HtmlView.HtmlView Page: setting property 'CSS' for element 'Window_'
      .setProperty("Foreground","Blue") // EJsS HtmlView.HtmlView Page: setting property 'Foreground' for element 'Window_'
      .setProperty("Text","Window:") // EJsS HtmlView.HtmlView Page: setting property 'Text' for element 'Window_'
      ;

    _view._addElement(EJSS_INTERFACE.slider,"slider", _view.panel3) // EJsS HtmlView.HtmlView Page: declaration of element 'slider'
      .setProperty("ShowText",true) // EJsS HtmlView.HtmlView Page: setting property 'ShowText' for element 'slider'
      .setProperty("Minimum",1) // EJsS HtmlView.HtmlView Page: setting property 'Minimum' for element 'slider'
      .setProperty("CSS",{ "vertical-align":"middle" }) // EJsS HtmlView.HtmlView Page: setting property 'CSS' for element 'slider'
      .setProperty("Format","#") // EJsS HtmlView.HtmlView Page: setting property 'Format' for element 'slider'
      .setProperty("Foreground","Blue") // EJsS HtmlView.HtmlView Page: setting property 'Foreground' for element 'slider'
      .setProperty("Step",1) // EJsS HtmlView.HtmlView Page: setting property 'Step' for element 'slider'
      ;

    _view._addElement(EJSS_INTERFACE.panel,"panel4", _view.subPanel2) // EJsS HtmlView.HtmlView Page: declaration of element 'panel4'
      .setProperty("Width","50%") // EJsS HtmlView.HtmlView Page: setting property 'Width' for element 'panel4'
      ;

    _view._addElement(EJSS_INTERFACE.checkBox,"showLissajous", _view.panel4) // EJsS HtmlView.HtmlView Page: declaration of element 'showLissajous'
      .setProperty("Checked",true) // EJsS HtmlView.HtmlView Page: setting property 'Checked' for element 'showLissajous'
      .setProperty("CSS",{"vertical-align":"middle",}) // EJsS HtmlView.HtmlView Page: setting property 'CSS' for element 'showLissajous'
      .setProperty("Text","Lissajous") // EJsS HtmlView.HtmlView Page: setting property 'Text' for element 'showLissajous'
      ;

    _view._addElement(EJSS_INTERFACE.checkBox,"autoScaleLissajous", _view.panel4) // EJsS HtmlView.HtmlView Page: declaration of element 'autoScaleLissajous'
      .setProperty("CSS",{"vertical-align":"middle",}) // EJsS HtmlView.HtmlView Page: setting property 'CSS' for element 'autoScaleLissajous'
      .setProperty("Text","Auto Escala - Lissajous") // EJsS HtmlView.HtmlView Page: setting property 'Text' for element 'autoScaleLissajous'
      ;

    _view._addElement(EJSS_INTERFACE.panel,"controlPanel", _view.threePanelsPanel) // EJsS HtmlView.HtmlView Page: declaration of element 'controlPanel'
      .setProperty("CSS",{"padding-top":"30px" }) // EJsS HtmlView.HtmlView Page: setting property 'CSS' for element 'controlPanel'
      ;

    _view._addElement(EJSS_INTERFACE.RENOLABS.labControl,"labControl", _view.controlPanel) // EJsS HtmlView.HtmlView Page: declaration of element 'labControl'
      .setProperty("ButtonHeight","30px") // EJsS HtmlView.HtmlView Page: setting property 'ButtonHeight' for element 'labControl'
      .setProperty("ButtonWidth","65px") // EJsS HtmlView.HtmlView Page: setting property 'ButtonWidth' for element 'labControl'
      ;

    _view._addElement(EJSS_INTERFACE.RENOLABS.labFunctionParameter,"labFunctionParameter", _view.controlPanel) // EJsS HtmlView.HtmlView Page: declaration of element 'labFunctionParameter'
      .setProperty("RowHeight","20px") // EJsS HtmlView.HtmlView Page: setting property 'RowHeight' for element 'labFunctionParameter'
      .setProperty("ColumnWidth","80px") // EJsS HtmlView.HtmlView Page: setting property 'ColumnWidth' for element 'labFunctionParameter'
      .setProperty("Config","reference") // EJsS HtmlView.HtmlView Page: setting property 'Config' for element 'labFunctionParameter'
      .setProperty("Width",380) // EJsS HtmlView.HtmlView Page: setting property 'Width' for element 'labFunctionParameter'
      ;

    _view._addElement(EJSS_INTERFACE.RENOLABS.labLogin,"labLogin", _view.controlPanel) // EJsS HtmlView.HtmlView Page: declaration of element 'labLogin'
      ;

  };

  return _view;
}



      var _model;
      var _scorm;
      window.addEventListener('load',
        function () { 
          _model =  new Unnamed("_topFrame","_ejs_library/",null);
          if (typeof _isApp !== "undefined" && _isApp) _model.setRunAlways(true);
          TextResizeDetector.TARGET_ELEMENT_ID = '_topFrame';
          TextResizeDetector.USER_INIT_FUNC = function () {
            var iBase = TextResizeDetector.addEventListener(function(e,args) {
              _model._fontResized(args[0].iBase,args[0].iSize,args[0].iDelta);
              },null);
            _model._fontResized(iBase);
          };
          _model.onload();
        }, false);
