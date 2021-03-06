import 'source-map-support/register'
import * as AWS from 'aws-sdk'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { parseUserId } from '../../auth/utils'


const docClient = new AWS.DynamoDB.DocumentClient()
const toDoTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)

  const itemToUpdate = await docClient.get({
      TableName: toDoTable,
      Key: {
          todoId: todoId,
          userId: userId
      }
  }).promise()

  if (!itemToUpdate.Item){
    return {
        statusCode: 404,
        body: JSON.stringify({
            error: 'TODO item does not exist'
        })
    }
  }

  await docClient.delete({
      TableName: toDoTable,
      Key: {
          todoId: todoId,
          userId: userId
      }
  }).promise()
  
  return {
      statusCode: 204,
      headers: {
          'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
          info: 'item deleted succesfully'
      })
  }

}
