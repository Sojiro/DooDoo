import { Component } from '@angular/core';
import { Todo, TodoService } from '../services/todo.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  newTodoTitle = '';

  constructor(public todoService: TodoService) { }

  addTodo() {
    if (this.newTodoTitle.trim().length > 0) {
      this.todoService.addTodo(this.newTodoTitle);
      this.newTodoTitle = '';
    }
  }

  toggleTodo(todo: Todo) {
    this.todoService.toggleTodo(todo.id);
  }

  deleteTodo(todo: Todo) {
    this.todoService.deleteTodo(todo.id);
  }
}
