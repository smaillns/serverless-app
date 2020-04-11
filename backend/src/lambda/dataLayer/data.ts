import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoUpdate } from '../../models/TodoUpdate'




export class Data {

    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly toDoTable = process.env.TODO_TABLE

    ) {
    }


    async updateToDo(userId: string, todoId: string, todoUpdate: TodoUpdate):Promise<TodoUpdate> {

        const itemToUpdate = await this.docClient.get({
                TableName: this.toDoTable,
                Key: {
                    todoId: todoId,
                    userId: userId
                }
            }).promise()

            if (!itemToUpdate.Item)
                return null

            await this.docClient.update({
                TableName: this.toDoTable,
                Key: {
                    userId: userId,
                    todoId: todoId
                },
                UpdateExpression: "set #n = :r, dueDate=:p, done=:a",
                ExpressionAttributeValues: {
                    ":r": todoUpdate.name,
                    ":p": todoUpdate.dueDate,
                    ":a": todoUpdate.done
                },
                ExpressionAttributeNames: {
                    "#n": "name"
                },
                ReturnValues: "UPDATED_NEW"
            }).promise()
            return todoUpdate
    }

}