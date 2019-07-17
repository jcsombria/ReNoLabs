/**
 * RIPGeneric.js
 * author: Jesús Chacón <jcsombria@gmail.com>
 *
 * Copyright (C) 2019 Jesús Chacón
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

class Method {
  constructor(url, description='Dummy Method', type_, params=[], returns='text/event-stream', example='') {
    var metadata = {
      'url': url,
      'type': type_,
      'description': description,
      'params': params,
      'returns': returns,
      'example': example,
    }
    for (var v in metadata) {
      this[v] = metadata[v];
    }
  }
}

class Param {
  constructor(name, required, location, type_=undefined, subtype=undefined, value=undefined, elements=undefined) {
    var metadata = {
      'name': name,
      'required': required,
      'location': location,
      'type': type_,
      'subtype': subtype,
      'value': value,
      'elements': elements,
    };
    this.assignIfDefined(metadata);
  }

  assignIfDefined(o) {
    for(var v in o) {
      if(v != undefined) {
        this[v] = o[v];
      }
    }
  }
}

class LabInfo {
  constructor(host='127.0.0.1', experiences=[]) {
    this.host = host;
    this.experiences = experiences;
    this.metadata = this.build();
  }

  build() {
    var info = {
      'experiences': {
        'list': this.createList(),
        'methods': this.createMethods(),
      }
    };
    return info;
  }

  createList() {
    var list = [];
    var n = this.experiences.length;
    for (var i=0; i<n; i++) {
      list.push({'id': this.experiences[i]});
    }
    return list;
  }

  createMethods() {
    var expid = '';
    try {
      expid = this.experiences[0];
    } catch(e) {
      expid = 'experience'
    }
    var url = `http://${this.host}/RIP`;
    var example = `http://${this.host}/RIP?expId=${expid}`;
    var params = [{
        'name': 'Accept',
        'required': 'no',
        'location': 'header',
        'value': 'application/json',
      }, {
        'name': 'expId',
        'required': 'no',
        'location': 'query',
        'type': 'string',
      }
    ];
    var m1 = {
      'url': url,
      'type': 'GET',
      'description': 'Retrieves information (variables and methods) of the experiences hosted in the server',
      'params': params,
      'returns': 'application/json',
      'example': example,
    }
    return [m1];
  }

  createExperience(expid) {
    if (!(expid in this.experiences)) {
      this.experiences.push(expid);
      this.metadata = this.build();
    }
  }
}

class ExperienceInfo {
  constructor(lab, experience='Experience', description, readables=[], writables=[], authors='', keywords='') {
    this.lab = lab;
    this.experience = experience;
    this.readables = readables;
    this.writables = writables;
    this.metadata = {
      'info': {
        'name': experience,
        'description': description,
        'authors': authors,
        'keywords': keywords,
      },
      'readables': this.createReadables(),
      'writables': this.createWritables(),
    }
  };

  createReadables() {
    return {
      'list': this.readables,
      'methods': [
        MethodInfoBuilder.buildSSEGETInfo(this.lab.host, this.experience),
        MethodInfoBuilder.buildPOSTGETInfo(this.lab.host, this.experience, this.readables, this.writables),
      ],
    }
  }

  createWritables() {
    return {
      'list': this.writables,
      'methods': [
        MethodInfoBuilder.buildPOSTSETInfo(this.lab.host, this.experience, this.readables, this.writables),
      ],
    }
  }
}

class MethodInfoBuilder {
  static buildSSEGETInfo(address, experience) {
    return new Method(
      `${address}/RIP/SSE`,
      'Suscribes to an SSE to get regular updates on the servers\' variables',
      'GET',
      [
        new Param('Accept', 'no', 'header', undefined, undefined, 'application/json'),
        new Param('expId', 'yes', 'query', 'string'),
        new Param('variables', 'no', 'query', 'array', 'string'),
      ],
      'text/event-stream',
      `${address}/RIP/SSE?expId=${experience}`,
    );
  }

  static buildPOSTSETInfo(address, experience, readables, writables) {
    var elements = [
      {'description': 'Experience id','type': 'string'},
      {'description': 'Name of variables to write','type': 'array','subtype': 'string'},
      {'description': 'Value for variables','type': 'array','subtype': 'mixed'}
    ];
    var params_post_set = [
      new Param('Accept', 'no', 'header', 'application/json'),
      new Param('Content-Type', 'yes', 'header', 'application/json'),
      new Param('jsonrpc', 'yes', 'body', 'string', undefined, '2.0'),
      new Param('method', 'yes', 'body', 'string', undefined, 'set'),
      new Param('params', 'yes', 'body', 'array', undefined, undefined, elements),
      new Param('id', 'yes', 'body', 'int'),
      new Param('variables', 'no', 'query', 'array', 'string'),
    ];
    var names = [], values = [];
    for (var i = 0; i < writables.length; i++) {
      names[i] = writables[i].name;
      values[i] = 'val';
    }
    var example_post_set = {};
    example_post_set[`${address}/RIP/POST`] = {
      'headers': {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      'body': {
        'jsonrpc':'2.0',
        'method':'set',
        'params': [experience, writables, values],
        'id':'1'}
    };
    return new Method(
      `${address}/RIP/POST`,
      'Sends a request to retrieve the value of one or more servers\' variables on demand',
      'POST',
      params_post_set,
      'application/json',
      example_post_set
    )
  }

  static buildPOSTGETInfo(address, experience, readables, writables) {
    var elements = [{
        'description': 'Experience id',
        'type': 'string'
      }, {
        'description': 'Name of variables to be retrieved',
        'type': 'array',
        'subtype': 'string'
    }];
    var example = {};
    example[`${address}/RIP/POST`] = {
      'headers': {'Accept': 'application/json','Content-Type': 'application/json'},
      // 'body': {'jsonrpc':'2.0', 'method':'get', 'params':['%s' % self.name, [r['name'] for r in self.readables]], 'id':'1'}
    };
    return new Method(
      `${address}/RIP/POST`,
      'Sends a request to retrieve the value of one or more servers\' variables on demand',
      'POST',
      [
        new Param('Accept', 'no', 'header', undefined, undefined, 'application/json'),
        new Param('Content-Type', 'yes', 'header',  undefined,  undefined, 'application/json'),
        new Param('jsonrpc', 'yes', 'body', 'string', undefined, '2.0'),
        new Param('method', 'yes', 'body', 'string', undefined, 'get'),
        new Param('params', 'yes', 'body', 'array',  undefined,  undefined, elements),
        new Param('id', 'yes', 'body', 'int'),
      ],
      'application/json',
      example,
    )
  }
}

class Variable {
  constructor(name, description='Variable', type_='float', min_=0, max_=1, precision=0) {
    this.name = name;
    this.description = description;
    this.type = type_;
    this.min = min_;
    this.max = max_;
    this.precision = precision;
  }
}

module.exports = {
  LabInfo: LabInfo,
  ExperienceInfo: ExperienceInfo,
  Variable: Variable,
};
