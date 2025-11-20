import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { HomePage } from './home.page';
import { TodoService } from '../services/todo.service';
import { By } from '@angular/platform-browser';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

import { FormsModule } from '@angular/forms';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let todoServiceMock: any;
  let todosSubject: BehaviorSubject<any[]>;

  beforeEach(async () => {
    todosSubject = new BehaviorSubject([{ id: '1', title: 'Test Todo', isDone: false }]);

    todoServiceMock = {
      todos$: todosSubject.asObservable(),
      toggleTodo: jasmine.createSpy('toggleTodo'),
      addTodo: jasmine.createSpy('addTodo'),
      deleteTodo: jasmine.createSpy('deleteTodo')
    };

    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [
        { provide: TodoService, useValue: todoServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle todo when clicking the item text', fakeAsync(() => {
    // Mock triggerHapticFeedback
    spyOn(component, 'triggerHapticFeedback').and.returnValue(Promise.resolve());

    // Mock matchMedia
    spyOn(window, 'matchMedia').and.returnValue({
      matches: false,
      addListener: () => { },
      removeListener: () => { }
    } as any);

    // Mock triggerConfetti
    spyOn(component, 'triggerConfetti');

    const label = fixture.debugElement.query(By.css('ion-label'));
    label.nativeElement.click();

    tick(); // Wait for async operations in toggleTodo

    expect(todoServiceMock.toggleTodo).toHaveBeenCalledWith('1');
  }));

  it('should delete todo on swipe', () => {
    const itemOptions = fixture.debugElement.query(By.css('ion-item-options'));
    itemOptions.triggerEventHandler('ionSwipe', null);
    expect(todoServiceMock.deleteTodo).toHaveBeenCalledWith('1');
  });

  it('should trigger confetti and haptics when todo is completed', fakeAsync(() => {
    // Mock matchMedia for no reduced motion
    spyOn(window, 'matchMedia').and.returnValue({
      matches: false,
      addListener: () => { },
      removeListener: () => { }
    } as any);

    // Mock helper methods
    spyOn(component, 'triggerHapticFeedback').and.returnValue(Promise.resolve());
    spyOn(component, 'triggerConfetti');

    const toastSpy = jasmine.createSpyObj('ToastController', ['create']);
    component['toastController'] = toastSpy; // Inject mock controller

    const todo = { id: '1', title: 'Test', isDone: false };
    component.toggleTodo(todo);

    tick(); // Wait for async operations

    expect(component.triggerHapticFeedback).toHaveBeenCalled();
    expect(component.triggerConfetti).toHaveBeenCalled();
    expect(toastSpy.create).not.toHaveBeenCalled();
  }));

  it('should show toast when reduced motion is enabled', fakeAsync(() => {
    // Mock matchMedia for reduced motion
    spyOn(window, 'matchMedia').and.returnValue({
      matches: true,
      addListener: () => { },
      removeListener: () => { }
    } as any);

    // Mock helper methods
    spyOn(component, 'triggerHapticFeedback').and.returnValue(Promise.resolve());
    spyOn(component, 'triggerConfetti');

    const toastSpy = jasmine.createSpyObj('ToastController', ['create']);
    const toast = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
    toastSpy.create.and.returnValue(Promise.resolve(toast));
    component['toastController'] = toastSpy;

    const todo = { id: '1', title: 'Test', isDone: false };
    component.toggleTodo(todo);

    tick(); // Wait for async operations

    expect(component.triggerHapticFeedback).toHaveBeenCalled();
    expect(component.triggerConfetti).not.toHaveBeenCalled();
    expect(toastSpy.create).toHaveBeenCalled();
    expect(toast.present).toHaveBeenCalled();
  }));
});
