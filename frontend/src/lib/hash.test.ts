import { describe, it, expect } from 'vitest'
import { encodeWorkspace, decodeWorkspace, HashError } from './hash'
import { Workspace, DEFAULT_WORKSPACE } from '../types/workspace'

describe('hash encoding/decoding', () => {
  it('should encode and decode a workspace', () => {
    const workspace: Workspace = {
      version: 1,
      files: [
        { name: 'test.py', content: 'print("hello")', language: 'python' },
      ],
      activeFile: 'test.py',
      settings: {
        theme: 'dark',
        fontSize: 14,
        tabSize: 2,
        wordWrap: true,
      },
    }
    
    const encoded = encodeWorkspace(workspace)
    expect(encoded).toBeTruthy()
    expect(typeof encoded).toBe('string')
    
    const decoded = decodeWorkspace(encoded)
    expect(decoded.version).toBe(1)
    expect(decoded.files).toHaveLength(1)
    expect(decoded.files[0].name).toBe('test.py')
    expect(decoded.files[0].content).toBe('print("hello")')
  })
  
  it('should return default workspace for empty hash', () => {
    const result = decodeWorkspace('')
    expect(result).toEqual(DEFAULT_WORKSPACE)
  })
  
  it('should throw on oversized hash', () => {
    const hugeHash = 'a'.repeat(600_000)
    expect(() => decodeWorkspace(hugeHash)).toThrow(HashError)
  })
  
  it('should throw on invalid JSON', () => {
    // This will decompress to invalid JSON
    expect(() => decodeWorkspace('not-valid-lz-string')).toThrow(HashError)
  })
  
  it('should strip unknown fields during encoding', () => {
    const workspace = {
      version: 1,
      files: [{ name: 'test.py', content: 'test', language: 'python' }],
      malicious: 'payload', // Unknown field - should be stripped
    }
    
    const encoded = encodeWorkspace(workspace as unknown as Workspace)
    const decoded = decodeWorkspace(encoded)
    
    // Unknown field should be stripped
    expect(decoded).not.toHaveProperty('malicious')
    expect(decoded.version).toBe(1)
    expect(decoded.files).toHaveLength(1)
  })
  
  it('should handle multiple files', () => {
    const workspace: Workspace = {
      version: 1,
      files: [
        { name: 'main.py', content: 'import utils', language: 'python' },
        { name: 'utils.py', content: 'def helper(): pass', language: 'python' },
        { name: 'config.json', content: '{"key": "value"}', language: 'json' },
      ],
      activeFile: 'main.py',
    }
    
    const encoded = encodeWorkspace(workspace)
    const decoded = decodeWorkspace(encoded)
    
    expect(decoded.files).toHaveLength(3)
    expect(decoded.files.map(f => f.name)).toEqual(['main.py', 'utils.py', 'config.json'])
  })
  
  it('should preserve file content with special characters', () => {
    const workspace: Workspace = {
      version: 1,
      files: [
        { 
          name: 'test.py', 
          content: `# Special chars: éàü\n"quotes" and 'apostrophes'\n\ttabs\nline\\nbreak`,
          language: 'python',
        },
      ],
    }
    
    const encoded = encodeWorkspace(workspace)
    const decoded = decodeWorkspace(encoded)
    
    expect(decoded.files[0].content).toBe(workspace.files[0].content)
  })
})
