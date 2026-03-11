import { describe, it, expect } from 'vitest'
import { execute } from './sandbox'

// Sandbox tests require browser environment (window, document, iframe)
// These tests run in Node.js so we only test non-DOM functionality

describe('sandbox execution', () => {
  describe('execute', () => {
    it('should return error for unsupported languages', async () => {
      const result = await execute('code', 'rust')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('not supported')
    })

    it('should return error for unknown language', async () => {
      const result = await execute('code', 'cobol')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Language "cobol" is not supported for execution')
    })
  })
})
