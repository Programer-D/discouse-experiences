import {ajax} from 'discourse/lib/ajax';

export function check_required(form_data, es_element_list) {
  let have_error = false;
  if (form_data.get('es_type') === "") {
    $('#state').append('<p class="error-detail"><strong>インターンまたは本選考を選択してください。</strong></p>');
    have_error = true;
  }
  if (form_data.get('company_name') === "") {
    $('#state').append('<p class="error-detail"><strong>企業名を入力してください。</strong></p>');
    have_error = true;
  }
  if (form_data.get('es_type') === 'selection' && form_data.get('occupation_name') === "") {
    $('#state').append('<p class="error-detail"><strong>本選考の場合は職種名の入力は必須です。</strong></p>');
    have_error = true;
  }

  if (!form_data.get('school_year')) {
    $('#state').append('<p class="error-detail"><strong>提出時の学年を入力してください。</strong></p>');
    have_error = true;
  }

  if (!form_data.get('year') || !form_data.get('month')) {
    $('#state').append('<p class="error-detail"><strong>提出年月を入力してください。</strong></p>');
    have_error = true;
  }

  if (es_element_list.length === 0) {
    $('#state').append('<p class="error-detail"><strong>ESの設問が1つも無い状態での送信は出来ません。</strong></p>');
    have_error = true;
  }
  es_element_list.forEach(id => {
    console.log(id)
    if (form_data.get('question_' + id.id) === "") {
      $('#state').append('<p class="error-detail"><strong>設問' + id.id + 'を入力してください。</strong></p>');
      have_error = true;
    }
    if (form_data.get('answer_' + id.id) === "") {
      $('#state').append('<p class="error-detail"><strong>設問の回答' + id.id + 'を入力してください。</strong></p>');
      have_error = true;
    }
  })

  return have_error
}

export default Ember.Controller.extend({
  es_element_list: [],
  current_num: 0,
  success_post: false,
  queryParams: ['es_id'],
  es_id: 0,
  actions: {
    append_es_form: function (event) {
      let tmp_list = this.es_element_list.slice()
      tmp_list.push({'id': this.current_num, 'question': '', 'answer': ''});
      this.set('es_element_list', tmp_list);
      this.set('current_num', this.current_num + 1);
      return 'success';
    },
    delete_es_form: function (id) {
      this.set('es_element_list', this.es_element_list.filter(n => n.id !== id));
      return 'success';
    },
    upload_es: function (event) {
      const ember_controller = this;
      $('#state').html("");
      let form_data = new FormData($('#es_form').get(0))
      if (this.es_id) {
        form_data.append('id', this.es_id)
      } else {
        form_data.append('id', Date.now())

      }
      if (check_required(form_data, this.es_element_list)) {
        return false
      }
      form_data.append('es_data_list', JSON.stringify(this.es_element_list.map(es => {

        return {'question': form_data.get('question_' + es.id), 'answer': form_data.get('answer_' + es.id)}
      })));

      $.ajax({
        url: "/es_post",
        type: "POST",
        data: form_data,
        dataType: "json",
        contentType: false,
        processData: false,
      })
        .done(function (data, textStatus, jqXHR) {
          $('#state').html('投稿が完了しました。');
          ember_controller.set('success_post', true)
          ember_controller.init();

          return 'success'
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          $('#state').html('エラーがありました。<br>不備が無いのにエラーが継続的に発生する場合は<a href="https://discourse.f-syukatu-community.com/u/programmer-d/summary">技術担当者</a>までご連絡ください。')
          return 'fail'
        })
    },
    get_mine_es: function () {
      this.set('mine_es_list', []);
      const ember_controller = this;
      $('#mine_es_state').html("");
      $.ajax({
        url: "/mine_es_list",
        type: "GET"
      })
        .done(function (data, textStatus, jqXHR) {
          console.log(data);
          if (data.data.length) {
            ember_controller.set('mine_es_list', data.data)
            ember_controller.init();
          } else {
            $('#mine_es_state').html('過去に投稿したESはありません。');
          }
          return 'success'
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          if (jqXHR.status === 404) {
            $('#mine_es_state').html('過去に投稿したESはありません。');
          } else {
            $('#mine_es_state').html('エラーがありました。<br>不備が無いのにエラーが継続的に発生する場合は<a href="https://discourse.f-syukatu-community.com/u/programmer-d/summary">技術担当者</a>までご連絡ください。')
          }
          console.log(errorThrown)
          return 'fail'
        })
    },
    get_es_model: function (es_id) {
      this.set('success_post', false);
      const model = ajax('/post_es_detail/' + es_id + '.json')
        .then(d => {
          console.log(d);
          let rtn = d.data;
          rtn.State = d.status;
          rtn.ESDataList = JSON.parse(rtn.ESDataList);
          this.set('model', rtn);
          this.set('current_num', rtn.ESDataList.length);
          this.set('es_element_list', rtn.ESDataList.map((d, index) => {
            return {'id': index, 'question': d['question'], 'answer': d['answer']}
          }))
          this.init();
        });
    },
    reset_page: function () {
      this.set('success_post', false);
      this.set('current_num', 0);
      this.set('es_id', 0);
      this.set('es_element_list', []);
      this.set('model', null);
    },
    open_delete_modal: function () {

      const ember_controller = this;
      const showModal = require("discourse/lib/show-modal").default;
      let delete_modal = showModal("delete", {
        model: {'ID': this.es_id},
      }).set('actions', {
        delete_es: function (es_id) {
          console.log(es_id);
          $.ajax({
            url: "/delete_es/" + es_id,
            type: "DELETE"
          })
            .done(function (data, textStatus, jqXHR) {
              console.log(jqXHR);
              ember_controller.set('mine_es_list', [])
              ember_controller.set('success_post', false);
              ember_controller.set('current_num', 0);
              ember_controller.set('es_id', 0);
              ember_controller.set('es_element_list', []);
              ember_controller.set('model', null);
              ember_controller.init();
              $('#delete_state').html('削除が完了しました。');
              return 'success'
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
              $('#delete_state').html('エラーがありました。<br>不備が無いのにエラーが継続的に発生する場合は<a href="https://discourse.f-syukatu-community.com/u/programmer-d/summary">技術担当者</a>までご連絡ください。')

              return 'fail'
            })
        }
      })
    },
    delete_es: function (es_id) {
      $.ajax({
        url: "/delete_es/" + es_id,
        type: "DELETE"
      })
        .done(function (data, textStatus, jqXHR) {
          $('#delete_state').html('削除が完了しました。');
          ember_controller.set('success_post', false);
          ember_controller.set('current_num', 0);
          ember_controller.set('es_id', 0);
          ember_controller.set('es_element_list', []);
          ember_controller.set('model', null);
          ember_controller.init();
          return 'success'
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          $('#delete_state').html('エラーがありました。<br>不備が無いのにエラーが継続的に発生する場合は<a href="https://discourse.f-syukatu-community.com/u/programmer-d/summary">技術担当者</a>までご連絡ください。')

          return 'fail'
        })
    }
  }
});
