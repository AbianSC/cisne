import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginCentrePage } from './login-centre.page';

describe('LoginCentrePage', () => {
  let component: LoginCentrePage;
  let fixture: ComponentFixture<LoginCentrePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginCentrePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
