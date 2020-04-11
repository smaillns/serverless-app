import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import { getUserId } from '..//utils'

const docClient = new AWS.DynamoDB.DocumentClient()
const toDoTable = process.env.TODO_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    const userId = getUserId(event)
    const itemID = uuid.v4()
    const timestamp = new Date().toISOString()



    const newItem = {
        userId: userId,
        todoId: itemID,
        createdAt: timestamp,
        ...newTodo
    }

    await docClient.put({
        TableName: toDoTable,
        Item: newItem
    }).promise()

    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            item: newItem
        })
    }
}
