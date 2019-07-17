/**
 * JSON-RPC Server
 * author: Jesús Chacón <jcsombria@gmail.com>
 *
 * Copyright (C) 2013 Jesús Chacón
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

function JsonRpcServer() {
  this.methods = {};
  this.ERRORS = {
    PARSE_ERROR: { // An error occurred on the server while parsing the JSON text.
      code: -32700,
      message: 'Invalid JSON was received by the server.',
    },
    INVALID_REQUEST: {
      code: -32600,
      message: 'The JSON sent is not a valid Request object.',
    },
    METHOD_NOT_FOUND: {
      code: -32601,
      message: 'Method not found. The method does not exist / is not available.',
    },
    INVALID_PARAMS: { // Invalid method parameter(s).
      code: -32602,
      message: 'Invalid params',
    },
    INTERNAL_ERROR: {
      code: -32603,
      message:'Internal JSON-RPC error.',
    },
//-32000 to -32099	Server error	Reserved for implementation-defined server-errors.
  };
}

JsonRpcServer.prototype.parse = function(jsonrpc) {
	var methodCall;
  try {
     methodCall = JSON.parse(jsonrpc);
  } catch(e) {
    var error = this.ERRORS['PARSE_ERROR'];
    return this.responseWithError(null, error.code, error.message);
  }
	var isBatchMode = (methodCall instanceof Array);
	var response;
	if(isBatchMode) {
		response = [];
		for(var i=0, len=methodCall.length; i<len; i++) {
			var result = this.process(methodCall[i]);
			response.push(result);
		}
	} else {
		response = this.process(methodCall);
	}
	return response;
}

JsonRpcServer.prototype.process = function(request) {
	var method = this.methods[request.method];
	var params;
	var result;
	if(method) {
	  try {
	    params = request.params.length;
	  } catch(error) {
	    params = 0;
	  }
    if(params != method.nparams) {
      var error = this.ERRORS['INVALID_PARAMS'];
  		return this.responseWithError(request.id, error.code, error.message);
 		}
		result = method.handler.apply(this, request.params);
		return this.response(result, request.id);
	} else {
	  error = this.ERRORS['METHOD_NOT_FOUND'];
		return this.responseWithError(request.id, error.code, error.message);
	}
	return result;
};

JsonRpcServer.prototype.on = function(method, info, handler) {
  var nparams = 0;
  try {
    if(typeof info == 'number') {
      nparams = info;
    } else if(info.params != undefined) {
      for(var param in info.params) nparams ++;
    };

  } catch(error) {
    console.log(error);
  }
	this.methods[method] = {nparams: nparams, handler: handler, info: info};
};

JsonRpcServer.prototype.getMethods = function() {
  var methods = {}
  for(var method in this.methods) {
    methods[method] = this.methods[method].info;
  }
  return methods;
}

JsonRpcServer.prototype.responseWithError = function(id, code, message, data) {
	return {
		jsonrpc: '2.0',
		error: {
			code: code,
			message: message,
			data: data,
		},
		id: id,
	};
};

JsonRpcServer.prototype.response = function(result, id) {
	var response = {
	  jsonrpc: '2.0',
	  result: result,
  };
	if(id !== undefined) {
    response.id = id;
  }
	return response;
}

module.exports = JsonRpcServer;
