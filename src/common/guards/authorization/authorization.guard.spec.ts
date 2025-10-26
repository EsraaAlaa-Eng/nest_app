import { Reflector } from '@nestjs/core';
import { AuthorizationGuard } from './authorization.guard';

describe('AuthorizationGuard', () => {
    it('should be defined', () => {
        expect(new AuthorizationGuard()).toBeDefined();

        // expect(true).toBe(true);

        // const mockReflector = {
        //     getAllAndOverride: jest.fn(), // mock function
        // } as unknown as Reflector;

        // const guard = new AuthorizationGuard(mockReflector);
        // expect(guard).toBeDefined();
    });
});
