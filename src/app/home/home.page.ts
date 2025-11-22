import { Component } from '@angular/core';
import { Todo, TodoService } from '../services/todo.service';
import { ToastController } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  newTodoTitle = '';
  showCelebration = false;
  celebrationMessage = '';

  private celebrationMessages = [
    'Awesome!',
    'Great Job!',
    'Way to go!',
    'You\'re on fire!',
    'Fantastic!',
    'Keep it up!',
    'Spectacular!',
    'You did it!'
  ];

  constructor(
    public todoService: TodoService,
    private toastController: ToastController
  ) { }

  addTodo() {
    if (this.newTodoTitle.trim().length > 0) {
      this.todoService.addTodo(this.newTodoTitle);
      this.newTodoTitle = '';
    }
  }

  async toggleTodo(todo: Todo) {
    if (!todo.isDone) {
      await this.triggerHapticFeedback();

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Pick a random message
      this.celebrationMessage = this.celebrationMessages[Math.floor(Math.random() * this.celebrationMessages.length)];

      if (prefersReducedMotion) {
        const toast = await this.toastController.create({
          message: `${this.celebrationMessage} 🎉`,
          duration: 2000,
          position: 'top',
          color: 'success'
        });
        await toast.present();
      } else {
        // Show celebration banner
        this.showCelebration = true;
        setTimeout(() => {
          this.showCelebration = false;
        }, 3000);

        this.triggerConfetti();
      }
    }
    this.todoService.toggleTodo(todo.id);
  }

  async triggerHapticFeedback() {
    await Haptics.impact({ style: ImpactStyle.Light });
  }

  triggerConfetti() {
    // Fire confetti from 4 corners
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#bb0000', '#ffffff'];

    // Top Left
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.4 }
    });
    // Top Right
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.4 }
    });
    // Bottom Left
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 }
    });
    // Bottom Right
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 }
    });
  }

  async deleteTodo(todo: Todo) {
    await Haptics.impact({ style: ImpactStyle.Medium });
    this.todoService.deleteTodo(todo.id);
  }
}
