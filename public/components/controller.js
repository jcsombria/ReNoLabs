export default {
  template: `
<table class="table table-sm table-striped table-hover table-borderless caption-top" id="viewsTable">
  <caption>{{ model_name }} disponibles</caption>
  <thead class="table-primary">
      <tr>
        <th class="align-middle" scope="col"><input type="checkbox"></input></th>
        <th class="align-middle" scope="col"></th>
        <th class="align-middle" scope="col"></th>
        <template v-for="c in columns">
          <th class="align-middle" scope="col">{{ c }}</th>
        </template>
      </tr>
  </thead>
  <tbody>
    <tr v-for="v in model" :key="v.id">
      <td class="align-middle"><input type="checkbox"></input></td>
      <td class="align-middle"><i class="bi bi-pencil" style="cursor:pointer"></i></td>
      <td class="align-middle"><i class="bi bi-trash" style="cursor:pointer"></i></td>
      <template v-for="f in fields">
        <th v-if="f['strong']" class="align-middle" scope="row">{{ v[f['key']] }}</th>
        <td v-else class="align-middle">{{ v[f['key']] }}</td>
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
  <button class="btn btn-success mx-3 my-3" data-bs-toggle="modal" data-bs-target="#modalController">
    Añadir controlador...
  </button>
</div>
<div class="modal fade" id="modalController" tabindex="-1" aria-labelledby="modalController" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <form>
        <div class="modal-header">
          <h5 class="modal-title" id="modalControllerLabel">Importar controlador desde archivo (zip)</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="view" class="form-label">Nombre:</label>
            <input type="text" class="form-control" name="name" v-model="form['name']">
          </div>
      
          <div class="mb-3">
            <label for="view" class="form-label">Descripción:</label>
            <input type="text" class="form-control" name="comments" v-model="form['comments']">
          </div>

          <div class="mb-3">
            <label for="controller" class="form-label">Controlador (zip):</label>
            <input type="file" class="form-control" name="controller" @input="event => form['controller'] = event.target">
          </div>

          <div class="mb-3">
            <label for="config" class="form-label">Configuración (JSON):</label>
            <textarea class="form-control" name="config" rows="10" v-model="form['config']"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <input type="button" @click="submit()" class="btn btn-primary" value="Submit">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </form>
  </div>
</div>
    `,

      data() {
        return {
          columns: ['Nombre', 'Fecha', 'Lenguaje', 'Ruta', 'Id'],
          fields: [
            { 'key': 'name', 'strong': true },
            { 'key': 'createdAt', 'strong': true },
            { 'key': 'type', 'strong': false },
            { 'key': 'path', 'strong': false },
            { 'key': 'id', 'strong': false },
          ],
          model: [],
          model_name: 'controller',
          form: {},
          query: {}
        }
      },

      methods: {
        reloadActivities() {
          post(`/admin/q/${this.model_name}/get`,
            JSON.stringify(this.query),
            result => { this.model = result; },
            error => {
              showMessage(`Cannot load ${this.model_name} from server.`, 'modalGenericMessage');
            }
          )
        },

        edit(entity) {
          this.$router.push(`/${this.model_name}/${entity.name}`);
        },

        submit() {
          const [file] = this.form['controller'].files;
          if (file) {
            const reader = new FileReader();
            reader.addEventListener("load", () => {
              this.form['controller'] = reader.result;
              post(`/admin/q/${this.model_name}/add`,
                JSON.stringify({ 'data': this.form }),
                result => { this.model = result; },
                error => {
                  showMessage(`Cannot load ${this.model_name} from server.`, 'modalGenericMessage');
                }
              )          
            });
            reader.readAsDataURL(file);
          }
        },

      },

      mounted() {
        this.reloadActivities();
      }
    }
