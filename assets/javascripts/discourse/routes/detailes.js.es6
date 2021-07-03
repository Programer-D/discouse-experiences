import {ajax} from 'discourse/lib/ajax';

console.log('detail-es-route1')
export default Ember.Route.extend({

  model(params) {
    return ajax('/detailes/' + params.es_id + '.json')
      .then(d => {
        console.log(d);
        let rtn = d.data;
        rtn.State = d.status;
        console.log(rtn);
        rtn.ESDataList = JSON.parse(rtn.ESDataList);
        return rtn
      });

  }
});
