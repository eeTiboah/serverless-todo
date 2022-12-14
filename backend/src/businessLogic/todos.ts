import { TodosAccess } from '../dataLayer/todosAcess'
import { TodoItem } from '../models/TodoItem'
import {CreateTodoRequest} from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'
import { getImageUrl } from './attachmentUtils'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { parseUserId } from '../auth/utils'

const todosAccess = new TodosAccess()
const logger = createLogger('todos-logic')

export async function createTodo(
  request: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {
  const { dueDate, name } = request
  const todoId = uuid.v4()
  const userId = parseUserId(jwtToken)
  const url = getImageUrl(todoId)
  logger.info('Create todo')
  return await todosAccess.createTodo({
    userId,
    todoId,
    name,
    dueDate,
    done: false,
    createdAt: new Date().toISOString(),
    attachmentUrl: url
  })
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
  logger.info(`Fetch todos for user with ID: ${userId}`)
  return await todosAccess.getUserTodos(userId)
}

export async function updateTodo(
  todoUpdateReq: UpdateTodoRequest,
  todoId: string,
  userId: string
): Promise<TodoUpdate> {
  logger.info('Update todo')
  return await todosAccess.updateTodo(todoUpdateReq, todoId, userId)
}

export async function deleteTodo(todoId: string, userId: string) {
  logger.info('Delete todo')
  return await todosAccess.deleteTodo(todoId, userId)
}
