import { describe, it, expect, vi } from 'vitest'
import { setupCounter } from './counter.js'

describe('Counter', () => {
  it('initializes with count 0', () => {
    const element = { 
      innerHTML: '',
      addEventListener: vi.fn()
    }
    
    setupCounter(element)
    
    expect(element.innerHTML).toBe('count is 0')
  })

  it('increments on click', () => {
    let clickHandler
    const element = { 
      innerHTML: '',
      addEventListener: vi.fn((event, handler) => {
        if (event === 'click') clickHandler = handler
      })
    }
    
    setupCounter(element)
    expect(element.innerHTML).toBe('count is 0')
    
    clickHandler()
    expect(element.innerHTML).toBe('count is 1')
    
    clickHandler()
    expect(element.innerHTML).toBe('count is 2')
  })
})
