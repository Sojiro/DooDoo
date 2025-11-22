import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject } from 'rxjs';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface Todo {
  id: string;
  title: string;
  isDone: boolean;
  notificationId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private todosSubject = new BehaviorSubject<Todo[]>([]);
  public todos$ = this.todosSubject.asObservable();

  private readonly STORAGE_KEY = 'todos';

  constructor() {
    this.loadTodos();
  }

  async loadTodos() {
    const { value } = await Preferences.get({ key: this.STORAGE_KEY });
    if (value) {
      this.todosSubject.next(JSON.parse(value));
    }
  }

  async saveTodos(todos: Todo[]) {
    await Preferences.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(todos)
    });
    this.todosSubject.next(todos);
  }

  async addTodo(title: string) {
    const notificationId = Math.floor(Math.random() * 1000000); // Simple random ID
    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      isDone: false,
      notificationId
    };
    const currentTodos = this.todosSubject.value;
    const updatedTodos = [...currentTodos, newTodo];
    await this.saveTodos(updatedTodos);
    await this.scheduleReminder(newTodo);
  }

  async toggleTodo(id: string) {
    const currentTodos = this.todosSubject.value;
    const todo = currentTodos.find(t => t.id === id);

    if (todo) {
      if (!todo.isDone) {
        // Marking as done, cancel reminder
        if (todo.notificationId) {
          await this.cancelReminder(todo.notificationId);
        }
      } else {
        // Marking as undone (active), reschedule reminder? 
        // For now, let's just create a new notification ID and schedule it
        // Ideally we should update the todo with a new notification ID
        const newNotificationId = Math.floor(Math.random() * 1000000);
        todo.notificationId = newNotificationId;
        await this.scheduleReminder(todo);
      }
    }

    const updatedTodos = currentTodos.map(t =>
      t.id === id ? { ...t, isDone: !t.isDone, notificationId: t.id === id && !t.isDone ? t.notificationId : t.notificationId } : t
    );
    await this.saveTodos(updatedTodos);
  }

  async deleteTodo(id: string) {
    const currentTodos = this.todosSubject.value;
    const todo = currentTodos.find(t => t.id === id);
    if (todo && todo.notificationId) {
      await this.cancelReminder(todo.notificationId);
    }
    const updatedTodos = currentTodos.filter(todo => todo.id !== id);
    await this.saveTodos(updatedTodos);
  }

  async scheduleReminder(todo: Todo) {
    if (!todo.notificationId) return;

    // Register action type if not already done (safe to call multiple times)
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: 'REMINDER',
          actions: [
            {
              id: 'MARK_DONE',
              title: 'Mark as Done',
              foreground: true // Bring app to foreground to ensure processing
            }
          ]
        }
      ]
    });

    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'DooDoo Reminder',
          body: `Did you do ${todo.title}?`,
          id: todo.notificationId,
          schedule: {
            every: 'minute',
            allowWhileIdle: true
          },
          actionTypeId: 'REMINDER',
          extra: {
            todoId: todo.id
          }
        }
      ]
    });
  }

  async cancelReminder(notificationId: number) {
    await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
  }
}
