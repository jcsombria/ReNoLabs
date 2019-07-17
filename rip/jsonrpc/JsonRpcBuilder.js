/**
 * JSON-RPC Builder
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

var JsonRpcBuilder = {
	request: function(method, params, id) {
		if(params && !(params instanceof Array)) {
			throw new InvalidParamsException();
		}
		var request = {
			jsonrpc: '2.0',
			method: method,
		};
		if(params !== undefined) {
			request.params = params;
		}
		if(id !== undefined) {
			request.id = id;
		}
		return request;
	},

	response: function(result, id) {
		return {
			jsonrpc: '2.0',
			result: result,
			id: id
		}
	},

	responseWithError: function(error, id) {
		return {
			jsonrpc: '2.0',
			error: error,
			id: id
		};
	},

	error: function(code, message, data) {
		return {
			code: code, 
			message: message, 
			data: data
		};
	},

	parseResponse: function(resString) {
		var response = null;
		try {
			response = JSON.parse(resString);
		} catch(error) {
			console.log(error);
		}
		return (response != null) ? response.result : null;
	}
}

module.exports = JsonRpcBuilder;
