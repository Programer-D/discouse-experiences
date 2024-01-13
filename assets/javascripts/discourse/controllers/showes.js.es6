import Controller from "@ember/controller";
export default Controller.extend({
  entrysheet_list: [],

  actions: {
    search: function () {
      const ember_controller = this;
      this.set('entrysheet_list', [])
      let form_data = new FormData($('#search-entrysheet').get(0))
      $('#state').html("");
      $.ajax({
        url: "/searches",
        type: "POST",
        data: form_data,
        dataType: "json",
        contentType: false,
        processData: false,
      })
        .done(function (data, textStatus, jqXHR) {
          console.log(data);
          if (data.data.length) {
            ember_controller.set('entrysheet_list', data.data)
            ember_controller.init();
          } else {
            $('#state').html('検索条件に該当するESはありません。')
          }

          return 'success'
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          $('#state').html('エラーがありました。<br>不備が無いのにエラーが継続的に発生する場合は<a href="https://discourse.f-syukatu-community.com/u/programmer-d/summary">技術担当者</a>までご連絡ください。')
          return 'fail'
        })

    }
  }
});
