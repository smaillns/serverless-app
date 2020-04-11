import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

const docClient =  new AWS.DynamoDB.DocumentClient()
const toDOTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('updating TODO item')
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  const userId = getUserId(event)

  await docClient.put({
      TableName: toDOTable,
      Item: {
        userId: userId,
        todoId: todoId,  
        ...updatedTodo
        }
    }).promise()

  return {
      statusCode: 204,
      headers: {
          'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        updatedTodo
      })
  }
  
  return undefined
}
