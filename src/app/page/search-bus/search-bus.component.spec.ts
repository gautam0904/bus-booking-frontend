import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBusComponent } from './search-bus.component';

describe('SearchBusComponent', () => {
  let component: SearchBusComponent;
  let fixture: ComponentFixture<SearchBusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchBusComponent]
    });
    fixture = TestBed.createComponent(SearchBusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
