import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookBusFormComponent } from './book-bus-form.component';

describe('BookBusFormComponent', () => {
  let component: BookBusFormComponent;
  let fixture: ComponentFixture<BookBusFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BookBusFormComponent]
    });
    fixture = TestBed.createComponent(BookBusFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
