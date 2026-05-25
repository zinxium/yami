// Set JWT secrets before any module loads
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-tests';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-key-for-tests';

// Mock firebase-admin avant tout import pour éviter le crash sur les credentials
jest.mock('firebase-admin', () => {
  const mockMessaging = { send: jest.fn().mockResolvedValue('message-id') };
  return {
    __esModule: true,
    default: {
      apps: [{}], // Simulate already initialized
      initializeApp: jest.fn(),
      credential: { cert: jest.fn() },
      messaging: () => mockMessaging,
    },
    apps: [{}],
    initializeApp: jest.fn(),
    credential: { cert: jest.fn() },
    messaging: () => mockMessaging,
  };
});
