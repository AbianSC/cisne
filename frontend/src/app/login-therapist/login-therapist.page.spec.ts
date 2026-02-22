import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginTherapistPage } from './login-therapist.page';

describe('LoginTherapistPage', () => {
  let component: LoginTherapistPage;
  let fixture: ComponentFixture<LoginTherapistPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginTherapistPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
