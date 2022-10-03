export default {
    template: `
<table class="table table-sm table-striped table-hover table-borderless caption-top" id="viewsTable">
  <caption>Actividades disponibles</caption>
  <thead class="table-primary">
      <tr>
        <th class="align-middle" scope="col"><input type="checkbox" /></th>
        <th class="align-middle" scope="col"></th>
        <th class="align-middle" scope="col"></th>
        <template v-for="c in columns">
          <th class="align-middle" scope="col">{{ c }}</th>
        </template>
      </tr>
  </thead>
  <tbody>
    <tr v-for="v in model" :key="v.id">
      <td class="align-middle"><input type="checkbox" /></td>
      <td class="align-middle"><i @click="edit(v.name)" class="bi bi-pencil" style="cursor:pointer"></i></td>
      <td class="align-middle"><i @click="remove(v.name)" class="bi bi-trash" style="cursor:pointer"></i></td>
      <template v-for="f in fields">
        <th v-if="f['strong']" class="align-middle" scope="row">{{ fields_value(v, f['key']) }}</th>
        <td v-else class="align-middle">{{ fields_value(v, f['key']) }}</td>
      </template>
    </tr>
  </tbody>
</table>
<div class="d-flex justify-content-center" id="activitiesNavBar">
  <button @click="$router.go(-1)" class="btn btn-primary text-light mx-3 my-3">
    <i class="bi bi-arrow-left"></i>Atrás
  </button>
  <button @click="$router.go(1)" class="btn btn-primary text-light mx-3 my-3">
  <i class="bi bi-arrow-right"></i>Adelante
  </button>
  <button class="btn btn-success mx-3 my-3" data-bs-toggle="modal" data-bs-target="#modalActivity">
    Añadir actividad...
  </button>
</div>
<div class="modal fade" id="modalActivity" tabindex="-1" aria-labelledby="modalActivity" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
  <div class="modal-dialog modal-dialog-centered modal-lg container">
    <div class="modal-content">
      <form id="formAddActivity" action="/admin/activity/add" method="post" encType="multipart/form-data">
        <!-- input type="hidden" name="_csrf" value="<%= csrfToken %>" / -->
        <div class="modal-header">
          <h5 class="modal-title" id="modalActivityLabel">Añadir actividad.</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="container-fluid">
            <div class="row mb-3">
              <div class="col-md-2"><label for="name" class="col-form-label">Nombre:</label></div>
              <div class="col-md-10"><input type="text" class="form-control" name="name" /></div>
            </div>
            <div class="row mb-3">
              <div class="col-md-4"><label for="name" class="col-form-label">Tiempo de sesión (min):</label></div>
              <div class="col-md-2"><input type="text" class="form-control" name="sessionTimeout" value="15" /></div>
              <div class="col-md-4"><label for="name" class="col-form-label">Tiempo de Desconexión (s):</label></div>
              <div class="col-md-2"><input type="text" class="form-control" name="disconnectTimeout" value="20" /></div>
            </div>
            <div class="row mb-3">
              <div class="col-md-4">
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="radioView" id="radioView1" value="true" checked />
                  <label class="form-check-label" for="radioView1">
                    Vista existente:
                  </label>
                  <select class="form-select" name="viewName">
                  <option value="" selected>Elige una vista...</option>
                    <template v-for="v in views">
                      <option :value="v.name" :name="v.name" />
                    </template>
                  </select>
                </div>
              </div>
              <div class="col-md-8">
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="radioView" id="radioView2" value="false">
                  <label class="form-check-label" for="radioView2">
                    Nueva vista:
                  </label>
                  <input type="file" class="form-control" name="view">
                </div>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-md-4">
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="radioController" id="radioController1" value="true" checked>
                  <label class="form-check-label" for="radioController1">
                    Controlador existente:
                  </label>
                  <select class="form-select" name="controllerName">
                    <option value="" selected>Elige un controlador...</option>
                  </select>
                </div>
              </div>
              <div class="col-md-8">
                <div class="form-check">
                  <input class="form-check-input" type="radio" name="radioController" id="radioController2" value="false">
                  <label class="form-check-label" for="radioController2">
                    Nuevo controlador:
                  </label>
                  <input type="file" class="form-control" name="controller">
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <input type="button" class="btn btn-primary" value="Submit" v-on:click="sbm">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </form>
    </div>
  </div>
</div>
    `,

    data() {
      return {
        columns: ['Nombre', 'Vista', 'Versión de la Vista', 'Controlador', 'Versión del Controlador'],
        fields: [
          { 'key': 'name', 'strong': true },
          { 'key': 'viewName', 'strong': true },
          { 'key': 'View', 'strong': false },
          { 'key': 'controllerName', 'strong': false },
          { 'key': 'Controller', 'strong': false },
        ],
        model: [],
        views: [],
        controllers: [],
        model_name: 'activity',
        query: { include: ['view', 'controller'] }
      }
    },

    methods: {
      fields_value(row, key) {
        var f = {
            'View': (o) => { return o.View ? o.View.createdAt.toLocaleString() : "La más reciente" },
            'Controller': (o) => { return o.Controller ? o.Controller.createdAt.toLocaleString() : "La más reciente" }
          }
        return (key in f) ? f[key](row) : row[key];
      },

      reloadActivities() {
        post(`/admin/q/${this.model_name}/get`,
          JSON.stringify(this.query),
          result => { this.model = result; },
          error => {
            console.log(error)
            // showMessage(`Cannot load ${this.model_name} from server.`, 'modalGenericMessage');
          }
        )
        this.fill('view', $('[name=viewName]'));
        this.fill('controller', $('[name=controllerName]'));
      },

      fill(model, select) {
        post(`/admin/q/${model}/get`, 
          JSON.stringify(this.query),
          result => {
            this.filter(result).forEach(element => {
              select.append($('<option>', {
                value: element.name,
                text: element.name
              }));
            });
          },
          error => { console.log(error) }
        )
      },

      filter(list) {
        let distinct = [];
        return list.filter(item => {
          if (distinct.includes(item.name)) {
            return false;
          }
          distinct.push(item.name); 
          return true;
        });
      },

      edit(entity) {
        console.log(`/${this.model_name}/${entity.name}`)
        this.$router.push(`/${this.model_name}/${entity.name}`);
      },

      remove(entity) {
        console.log(entity)
        post(`/admin/q/${this.model_name}/delete`, 
          JSON.stringify({ where: {name: entity} }),
          result => { location.reload(); },
          error => { console.log(error); }
        )
      },

      sbm() {
        let form = $('#formAddActivity'), data = new FormData(form[0]);
        let filter = [
          'radioController',
          'radioView',
          (data.get('radioController') == 'true') ? 'controller' : 'controllerName',
          (data.get('radioView') == 'true') ? 'view' : 'viewName' 
        ];
        filter.forEach(e => data.delete(e) );
        var o = {}; data.forEach((v, k) => o[k] = v);
        post(form.attr('action'), JSON.stringify(o),
          success => {
            showMessage('Actividad añadida.', 'modalGenericMessage');
            location.reload();
          },
          error => {
            showMessage(error.responseText, 'modalGenericMessage');
        });
      }
    },

    mounted() {
      this.reloadActivities();
    }
  }
