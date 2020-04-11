
import 'source-map-support/register'

import { Data } from '../dataLayer/data'
import { TodoUpdate } from '../../models/TodoUpdate'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const data = new Data()



export async function updateToDo(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest ): Promise<TodoUpdate>{
    const updatedTodo: TodoUpdate = {
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: updateTodoRequest.done
    }

    return await data.updateToDo(userId, todoId, updatedTodo)
}