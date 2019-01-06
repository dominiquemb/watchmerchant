import { TestBed, async, inject } from '@angular/core/testing';

import { RequireLoginGuard } from './require-login.guard';

describe('RequireLoginGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RequireLoginGuard]
    });
  });

  it('should ...', inject([RequireLoginGuard], (guard: RequireLoginGuard) => {
    expect(guard).toBeTruthy();
  }));
});
