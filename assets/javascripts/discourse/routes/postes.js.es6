import {ajax} from 'discourse/lib/ajax';
import Route from '@ember/routing/route';

export default Route.extend({
  setupController: function (controller, model) {
    if (model) {
      console.log('setup_controller')
      controller.set('model', model);
      controller.set('current_num', model.ESDataList.length);
      controller.set('es_element_list', model.ESDataList.map((d, index) => {
        return {'id': index, 'question': d['question'], 'answer': d['answer']}
      }))
    }
  },
  model(params) {
    console.log('params:')
    console.log(params)
    if (params.es_id) {
      return ajax('/post_es_detail/' + params.es_id + '.json')
        .then(d => {
          console.log(d);
          let rtn = d.data;
          rtn.State = d.status;
          console.log(rtn);
          rtn.ESDataList = JSON.parse(rtn.ESDataList);
          return rtn
        });
    }
  }

});
