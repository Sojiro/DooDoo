import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { HomePage } from './home.page';
import { TodoService } from '../services/todo.service';
import { By } from '@angular/platform-browser';

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

  it('should toggle todo when clicking the item text', () => {
    const label = fixture.debugElement.query(By.css('ion-label'));
    label.nativeElement.click();
    expect(todoServiceMock.toggleTodo).toHaveBeenCalledWith('1');
  });

  it('should delete todo on swipe', () => {
    const itemOptions = fixture.debugElement.query(By.css('ion-item-options'));
    itemOptions.triggerEventHandler('ionSwipe', null);
    expect(todoServiceMock.deleteTodo).toHaveBeenCalledWith('1');
  });
});
