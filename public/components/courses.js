export default {
  template: `
<table class="table table-sm table-striped table-hover table-borderless caption-top" id="viewsTable">
  <caption>{{ title }}</caption>
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
      <td class="align-middle"><i @click="edit(v)" class="bi bi-pencil" style="cursor:pointer"></i></td>
      <td class="align-middle"><i @click="remove(v)" class="bi bi-trash" style="cursor:pointer"></i></td>
      <template v-for="f in fields">
        <th v-if="f['strong']" class="align-middle" scope="row">{{ v[f['key']] }}</th>
        <td v-else class="align-middle">{{ fields_value[f['key']] }}</td>
      </template>
    </tr>
  </tbody>
</table>
    `,

    data() {
      return {
        columns: ['Nombre', 'Curso'],
        fields: [
          { 'key': 'name', 'strong': true },
          { 'key': 'year', 'strong': true },
        ],
        model: [],
        model_name: 'course',
        title: 'Cursos disponibles',
        query: {}
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
            showMessage(`Cannot load ${this.model_name} from server.`, 'modalGenericMessage');
          }
        )
      },

      remove(entity) {
        post(`/admin/q/${this.model_name}/delete`,
          JSON.stringify({ 'where': { 'id': entity.id }}),
          result => {
            console.log(result) 
          },
          error => {
            showMessage(`Cannot load ${this.model_name} from server.`, 'modalGenericMessage');
          }
        )
      },

      edit(entity) {
        // post(`/admin/q/${this.model_name}/delete`,
        //   JSON.stringify({ 'where': { 'id': entity.id }}),
        //   result => {
        //     console.log(result)
        //   },
        //   error => {
        //     showMessage(`Cannot load ${this.model_name} from server.`, 'modalGenericMessage');
        //   }
        // )
      }
    },

    mounted() {
      this.reloadActivities();
    }
  }
