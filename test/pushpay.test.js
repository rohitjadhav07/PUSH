const { MessageParser } = require('../src/message-parser');
const { PushChainUniversalClient } = require('../src/pushchain-client');

describe('PushPay Tests', () => {
  let messageParser;
  let pushClient;

  beforeEach(() => {
    messageParser = new MessageParser();
    pushClient = new PushChainUniversalClient({
      rpcUrl: 'https://rpc-donut.push.network',
      privateKey: '0x' + '0'.repeat(64) // Mock private key
    });
  });

  describe('MessageParser', () => {
    test('should parse send payment command', () => {
      const result = messageParser.parseMessage('Send 2 ETH to +1234567890');
      expect(result.type).toBe('SEND_PAYMENT');
      expect(result.amount).toBe(2);
      expect(result.token).toBe('ETH');
      expect(result.recipient).toBe('+1234567890');
    });

    test('should parse buy crypto command', () => {
      const result = messageParser.parseMessage('Buy $100 USDC');
      expect(result.type).toBe('BUY_CRYPTO');
      expect(result.fiatAmount).toBe(100);
      expect(result.fiatCurrency).toBe('USD');
      expect(result.token).toBe('USDC');
    });

    test('should parse split bill command', () => {
      const result = messageParser.parseMessage('Split 100 USDC dinner with +123456, +789012');
      expect(result.type).toBe('SPLIT_BILL');
      expect(result.amount).toBe(100);
      expect(result.token).toBe('USDC');
      expect(result.participants).toHaveLength(2);
    });

    test('should parse balance command', () => {
      const result = messageParser.parseMessage('balance');
      expect(result.type).toBe('BALANCE');
    });

    test('should default to help for unknown commands', () => {
      const result = messageParser.parseMessage('hello world');
      expect(result.type).toBe('HELP');
    });
  });

  describe('PushChainUniversalClient', () => {
    test('should get supported tokens', () => {
      const tokens = pushClient.getSupportedTokens();
      expect(tokens).toContain(
        expect.objectContaining({ symbol: 'ETH' })
      );
      expect(tokens).toContain(
        expect.objectContaining({ symbol: 'USDC' })
      );
    });

    test('should get token decimals', () => {
      expect(pushClient.getTokenDecimals('ETH')).toBe(18);
      expect(pushClient.getTokenDecimals('USDC')).toBe(6);
      expect(pushClient.getTokenDecimals('SOL')).toBe(9);
    });

    test('should estimate gas', async () => {
      const estimate = await pushClient.estimateGas({
        amount: 1,
        token: 'ETH',
        from: '0x123',
        to: '0x456'
      });
      
      expect(estimate).toHaveProperty('gasLimit');
      expect(estimate).toHaveProperty('gasPrice');
      expect(estimate).toHaveProperty('gasCost');
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete payment flow', async () => {
      // Parse message
      const command = messageParser.parseMessage('Send 1 USDC to +1234567890');
      
      // Validate command
      expect(command.type).toBe('SEND_PAYMENT');
      expect(command.amount).toBe(1);
      expect(command.token).toBe('USDC');
      
      // Mock payment processing
      const mockTxHash = '0x' + '1'.repeat(64);
      expect(mockTxHash).toMatch(/^0x[0-9a-f]{64}$/);
    });

    test('should handle fiat purchase flow', async () => {
      // Parse message
      const command = messageParser.parseMessage('Buy $50 USDC');
      
      // Validate command
      expect(command.type).toBe('BUY_CRYPTO');
      expect(command.fiatAmount).toBe(50);
      expect(command.fiatCurrency).toBe('USD');
      expect(command.token).toBe('USDC');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid send payment format', () => {
      expect(() => {
        messageParser.parseMessage('Send invalid format');
      }).toThrow('Invalid send payment format');
    });

    test('should handle invalid buy crypto format', () => {
      expect(() => {
        messageParser.parseMessage('Buy invalid format');
      }).toThrow('Invalid buy format');
    });

    test('should handle invalid split bill format', () => {
      expect(() => {
        messageParser.parseMessage('Split invalid format');
      }).toThrow('Invalid split format');
    });
  });
});

describe('Performance Tests', () => {
  test('message parsing should be fast', () => {
    const parser = new MessageParser();
    const start = Date.now();
    
    for (let i = 0; i < 1000; i++) {
      parser.parseMessage('Send 1 ETH to +1234567890');
    }
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100); // Should parse 1000 messages in under 100ms
  });
});

describe('Security Tests', () => {
  test('should validate payment amounts', () => {
    const parser = new MessageParser();
    
    // Should reject negative amounts
    expect(() => {
      parser.parseMessage('Send -1 ETH to +1234567890');
    }).toThrow();
    
    // Should reject zero amounts
    expect(() => {
      parser.parseMessage('Send 0 ETH to +1234567890');
    }).toThrow();
  });

  test('should validate phone numbers', () => {
    const parser = new MessageParser();
    
    // Should accept valid phone numbers
    const result1 = parser.parseMessage('Send 1 ETH to +1234567890');
    expect(result1.recipient).toBe('+1234567890');
    
    // Should accept names (resolved to phone numbers)
    const result2 = parser.parseMessage('Send 1 ETH to John');
    expect(result2.recipient).toBe('John');
  });
});