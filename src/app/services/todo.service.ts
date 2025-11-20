import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject } from 'rxjs';

export interface Todo {
  id: string;
  title: string;
  isDone: boolean;
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
    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      isDone: false
    };
    const currentTodos = this.todosSubject.value;
    const updatedTodos = [...currentTodos, newTodo];
    await this.saveTodos(updatedTodos);
  }

  async toggleTodo(id: string) {
    const currentTodos = this.todosSubject.value;
    const updatedTodos = currentTodos.map(todo =>
      todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
    );
    await this.saveTodos(updatedTodos);
  }

  async deleteTodo(id: string) {
    const currentTodos = this.todosSubject.value;
    const updatedTodos = currentTodos.filter(todo => todo.id !== id);
    await this.saveTodos(updatedTodos);
  }
}
