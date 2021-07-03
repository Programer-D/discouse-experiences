# name: discourse-experiences
# version: 0.7.0

enabled_site_setting :experiences_enabled
register_asset 'stylesheets/discourse_experiences.css'

after_initialize do
  load File.expand_path('../app/controllers/experiences_controller.rb', __FILE__)
  load File.expand_path('../app/controllers/entrysheet_controller.rb', __FILE__)

  Discourse::Application.routes.append do
    get '/experiences' => 'experiences#index'
    post '/es_post' => 'entrysheet#upload'
    delete '/delete_es/:es_id' => 'entrysheet#destroy'
    get '/mine_es_list' => 'entrysheet#mine_es_list'
    get '/postes' => 'experiences#index'
    get '/postes/:es_id' => 'entrysheet#index'
    get '/showes' => 'experiences#index'
    post '/searches' => 'entrysheet#search'
    get '/experiences/postes' => 'experiences#index'
    get '/detailes/:es_id' => 'entrysheet#show_detail'
    get '/post_es_detail/:es_id' => 'entrysheet#edit_detail'
  end
end
