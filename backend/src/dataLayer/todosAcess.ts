import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoPayload } from '../requests/CreateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE
  ) {}

  async getTodoById(todoId: string): Promise<TodoItem> {
    logger.info(`Get todo with ID: ${todoId}`)
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
          ':todoId': todoId
        },
        ScanIndexForward: false
      })
      .promise()
    const item = result.Items[0]
    return item as TodoItem
  }

  async getUserTodos(userId: string): Promise<TodoItem[]> {
    logger.info(`Get todo for user with USERID: ${userId}`)
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()
    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todo: CreateTodoPayload): Promise<CreateTodoPayload> {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()
    return todo
  }

  async deleteTodo(todoId: string, userId: string): Promise<string> {
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        }
      })
      .promise()
    return 'deleted'
  }

  async updateTodo(
    todoUpdate: TodoUpdate,
    todoId: string,
    userId: string
  ): Promise<TodoUpdate> {
    const { name, dueDate, done } = todoUpdate
    logger.info(
      `Update todo {name, dueDate, done}: ${name}, ${dueDate}, ${done}`
    )
    try {
      await this.docClient
        .update({
          TableName: this.todosTable,
          Key: {
            todoId,
            userId
          },
          UpdateExpression: 'SET #n = :val_n, #dt = :val_dt, #dn = :val_dn',
          ExpressionAttributeValues: {
            ':val_n': name,
            ':val_dt': dueDate,
            ':val_dn': done
          },
          ExpressionAttributeNames: {
            '#n': 'name',
            '#dt': 'dueDate',
            '#dn': 'done'
          },
          ReturnValues: 'UPDATED_NEW'
        })
        .promise()
      logger.info('Todo update successful')
      return todoUpdate
    } catch (err) {
      logger.info(`Todo update failed: ${(err as Error).message}`)
    }
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
