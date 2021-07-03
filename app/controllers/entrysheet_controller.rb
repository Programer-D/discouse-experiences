require 'aws-sdk-dynamodb'
require 'time'
AWS_REGION = 'ap-northeast-1'

class EntrysheetController < ApplicationController
  def index
  end

  def get_dynamodb
    return Aws::DynamoDB::Client.new(
      access_key_id: ENV['ACCESS_KEY_ID'],
      secret_access_key: ENV['SECRET_ACCESS_KEY'],
      region: AWS_REGION
    )
  end

  def destroy
    dynamodb = get_dynamodb
    Rails.logger.info params
    params.require(:es_id)
    setting = {
      table_name: "DiscourseEntrysheet",
      key: {
        ID: params['es_id'],
      }
    }

    begin
      dynamodb.delete_item(setting)
      Rails.logger.info 'Complete'
      render status: 200, json: { status: 200 }
    rescue StandardError => e
      render states: 500
    end

  end

  def get_detail(es_id)
    Rails.logger.info 'Called EntrysheetController#detail'
    Rails.logger.info params
    params.require(:es_id)
    dynamodb = get_dynamodb
    setting = {
      table_name: "DiscourseEntrysheet",
      key: {
        ID: params['es_id'],
      }
    }

    Rails.logger.info 'Called EntrysheetController#start_get'
    begin
      result = dynamodb.get_item(setting)
      Rails.logger.info 'Get entrysheet_detail:'
      Rails.logger.info result.item
      return result.item
    rescue Aws::DynamoDB::Errors::ServiceError => error
      Rails.logger.info 'Unable to get entrysheet:'
      Rails.logger.info error.message
      return error
    end

  end

  def mine_es_list
    dynamodb = get_dynamodb
    setting = {
      table_name: "DiscourseEntrysheet",
      expression_attribute_names: { '#uid': "UserID" },
      expression_attribute_values: { ":u": current_user.id },
      filter_expression: "#uid=:u"
    }
    begin
      result = dynamodb.scan(setting)
      Rails.logger.info 'Get entrysheet_detail:'
      Rails.logger.info result.items
      rtn = result.items
      if params['company_name'] then
        rtn = rtn.select { |d| d['Company'].include? params['company_name'] }
      end
      render status: 200, json: { status: 200, data: rtn }
    rescue Aws::DynamoDB::Errors::ServiceError => error
      Rails.logger.info 'Unable to get entrysheet:'
      Rails.logger.info error.message
      render status: 404, json: { status: 404 }
    end
  end

  def show_detail
    Rails.logger.info 'Called EntrysheetController#detail'
    Rails.logger.info params
    params.require(:es_id)
    begin
      data = get_detail(params['es_id'])
      if current_user.id == data['UserID'] then
        state = 200
      else
        state = 403
      end
      render status: 200, json: { status: state, data: data }
    rescue Aws::DynamoDB::Errors::ServiceError => error
      render status: 404, json: { status: 404 }
    end
  end

  def edit_detail
    Rails.logger.info 'Called EntrysheetController#detail'
    Rails.logger.info params
    params.require(:es_id)
    begin
      data = get_detail(params['es_id'])
      if current_user.id == data['UserID'] then
        state = 200
      else
        state = 403
      end
      render status: state, json: { status: state, data: data }
    rescue Aws::DynamoDB::Errors::ServiceError => error
      render status: 404, json: { status: 404 }
    end

  end

  def search
    Rails.logger.info 'Called EntrysheetController#detail'
    Rails.logger.info params
    Rails.logger.info params['es_type']
    dynamodb = get_dynamodb
    names = {}
    values = {}
    filter = ''
    if params['es_type'] && params['es_type'] != "" then
      Rails.logger.info 'es_type'
      names['#type'] = "ESType"
      values[':t'] = params['es_type']
      filter += '#type=:t'
    end

    if params['industry'] && params['industry'] != "" then
      Rails.logger.info 'industry'
      names['#ind'] = "Industry"
      values[':i'] = params['industry']

      if !filter.empty?
        filter += ' AND '
      end
      filter += '#ind=:i'
    end

    if params['degree'] && params['degree'] != "" then
      names['#deg'] = "Degree"
      values[':d'] = params['degree']

      if !filter.empty?
        filter += ' AND '
      end
      filter += '#deg=:d'
    end

    if params['how_level'] && params['how_level'] != "" then
      names['#how'] = "HowLevel"
      values[':h'] = params['how_level']

      if !filter.empty?
        filter += ' AND '
      end
      filter += '#how=:h'
    end

    if params['only_mine'] then
      names['#uid'] = "UserID"
      values[':u'] = current_user.id

      if !filter.empty?
        filter += ' AND '
      end
      filter += '#uid=:u'
    end

    setting = {
      table_name: "DiscourseEntrysheet",
      expression_attribute_names: names,
      expression_attribute_values: values,
      filter_expression: filter
    }

    Rails.logger.info names
    Rails.logger.info values
    Rails.logger.info filter
    begin
      if names.empty? then
        Rails.logger.info 'Get All ES'
        result = dynamodb.scan({ table_name: "DiscourseEntrysheet" })
      else
        result = dynamodb.scan(setting)
      end
      Rails.logger.info 'Get entrysheet_detail:'
      Rails.logger.info result.items
      rtn = result.items
      if params['company_name'] then
        rtn = rtn.select { |d| d['Company'].include? params['company_name'] }
      end
      render status: 200, json: { status: 200, data: rtn }
    rescue Aws::DynamoDB::Errors::ServiceError => error
      Rails.logger.info 'Unable to get entrysheet:'
      Rails.logger.info error.message
      render status: 404, json: { status: 404 }
    end

  end

  def upload
    Rails.logger.info 'Called EntrysheetController#post'
    Rails.logger.info params

    dynamodb = get_dynamodb
    print 'userinformation'
    item = {
      ID: params['id'],
      User: current_user.username,
      UserID: current_user.id,
      University: current_user.user_fields['1'],
      Undergraduate: current_user.user_fields['9'],
      Degree: params['degree'],
      ESType: params['es_type'],
      Industry: params['industry'],
      Company: params['company_name'],
      Department: params['department_name'],
      Occupation: params['occupation_name'],
      Year: params['year'],
      Month: params['month'],
      HowLevel: params['how_level'],
      ESDataList: params['es_data_list'],
      Status: 10,
      UpdateTime: Time.now.strftime("%Y-%m-%d %H:%M:%S")
    }
    data = {
      table_name: 'DiscourseEntrysheet',
      item: item

    }

    begin
      dynamodb.put_item(data)
    rescue Aws::DynamoDB::Errors::ServiceError => error
      Rails.logger.info 'Unable to add entrysheet:'
      Rails.logger.info error.message
    end

    render json: { evidence: current_user }
  end
end
