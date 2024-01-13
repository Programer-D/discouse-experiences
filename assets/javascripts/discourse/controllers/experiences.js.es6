import Controller from "@ember/controller";
export function check_required(form_data, es_element_list) {
  console.log('check_required')
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
  if (form_data.get('how_level') === "") {
    $('#state').append('<p class="error-detail"><strong>どの選考段階まで進んだか選択してください。</strong></p>');
    have_error = true;
  }

  if (es_element_list.length === 0) {
    $('#state').append('<p class="error-detail"><strong>ESの設問が1つも無い状態での送信は出来ません。</strong></p>');
    have_error = true;
  }
  es_element_list.forEach(id => {
    if (form_data.get('question_' + id) === "") {
      $('#state').append('<p class="error-detail"><strong>設問' + id + 'を入力してください。</strong></p>');
      have_error = true;
    }
    if (form_data.get('answer_' + id) === "") {
      $('#state').append('<p class="error-detail"><strong>設問の回答' + id + 'を入力してください。</strong></p>');
      have_error = true;
    }
  })

  return have_error
}

export default Controller.extend({
  es_element_list: [],
  current_num: 0,
  success_post: false,
  actions: {
    append_es_form: function (event) {
      let tmp_list = this.es_element_list.slice()
      tmp_list.push(this.current_num);
      this.set('es_element_list', tmp_list);
      this.set('current_num', this.current_num + 1);
      return 'success';
    },
    delete_es_form: function (id) {
      this.set('es_element_list', this.es_element_list.filter(n => n !== id));
      return 'success';
    },
    upload_es: function (event) {
      const ember_controller = this;
      $('#state').html("");
      let form_data = new FormData($('#es_form').get(0))
      form_data.append('id', Date.now())
      if (check_required(form_data, this.es_element_list)) {
        return false
      }
      form_data.append('es_data_list', JSON.stringify(this.es_element_list.map(id => {
        return {'question': form_data.get('question_' + id), 'answer': form_data.get('answer_' + id)}
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
    }
  }
});
