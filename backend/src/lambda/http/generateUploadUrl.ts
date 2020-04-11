import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import { getUserId } from '../utils'


const docClient = new AWS.DynamoDB.DocumentClient()
const s3 = new  AWS.S3({
    signatureVersion: 'v4'
})


const toDoTable = process.env.TODO_TABLE
const bucketName =  process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event) 

  const itemToUpdate = await docClient.get({
    TableName: toDoTable,
    Key: {
        userId: userId,
        todoId: todoId
    }
    }).promise()

    if (!itemToUpdate.Item){
    return {
        statusCode: 404,
        body: JSON.stringify({
            error: 'TODO item with the given id does not exist'
        })
    }
    }

    const imageId = uuid.v4()

    //storing new item
    const newItem = {
        userId,
        todoId,
        ...itemToUpdate.Item,
        attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${imageId}`
      }
    
      await docClient.put({
          TableName: toDoTable,
          Item: newItem
        }).promise()
    //-----------------------------

    const url = s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: imageId,
        Expires: urlExpiration
    })

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin' : '*'
        },
        body: JSON.stringify({
            uploadUrl: url
        })
    }
}


  