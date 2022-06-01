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
        }
      },

      mounted() {
        this.reloadActivities();
      }
    }
