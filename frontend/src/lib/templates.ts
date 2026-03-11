import { Workspace } from '../types/workspace'

export interface Template {
  id: string
  name: string
  description: string
  icon: string
  workspace: Workspace
}

export const templates: Template[] = [
  {
    id: 'python-hello',
    name: 'Python Hello World',
    description: 'A simple Python script to get started',
    icon: '🐍',
    workspace: {
      version: 1,
      files: [
        {
          name: 'main.py',
          content: `# Python Hello World
# Run with Ctrl+Enter

def greet(name: str) -> str:
    """Generate a greeting message."""
    return f"Hello, {name}!"

def main():
    names = ["World", "HashIDE", "Developer"]
    for name in names:
        print(greet(name))

if __name__ == "__main__":
    main()
`,
          language: 'python',
        },
      ],
      activeFile: 'main.py',
      settings: { theme: 'dark', fontSize: 14, tabSize: 4, wordWrap: true },
    },
  },
  {
    id: 'js-async',
    name: 'JavaScript Async',
    description: 'Async/await patterns in JavaScript',
    icon: '⚡',
    workspace: {
      version: 1,
      files: [
        {
          name: 'main.js',
          content: `// JavaScript Async Patterns
// Run with Ctrl+Enter

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchData() {
  console.log('Starting fetch...');
  
  // Simulate API calls
  await delay(100);
  console.log('Got user data');
  
  await delay(100);
  console.log('Got posts');
  
  await delay(100);
  console.log('Got comments');
  
  return { users: 10, posts: 50, comments: 200 };
}

async function main() {
  try {
    const data = await fetchData();
    console.log('\\nFinal data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
`,
          language: 'javascript',
        },
      ],
      activeFile: 'main.js',
      settings: { theme: 'dark', fontSize: 14, tabSize: 2, wordWrap: true },
    },
  },
  {
    id: 'python-classes',
    name: 'Python OOP',
    description: 'Object-oriented programming in Python',
    icon: '🏗️',
    workspace: {
      version: 1,
      files: [
        {
          name: 'shapes.py',
          content: `# Python OOP - Shapes Example

from abc import ABC, abstractmethod
import math

class Shape(ABC):
    """Abstract base class for shapes."""
    
    @abstractmethod
    def area(self) -> float:
        pass
    
    @abstractmethod
    def perimeter(self) -> float:
        pass

class Rectangle(Shape):
    def __init__(self, width: float, height: float):
        self.width = width
        self.height = height
    
    def area(self) -> float:
        return self.width * self.height
    
    def perimeter(self) -> float:
        return 2 * (self.width + self.height)

class Circle(Shape):
    def __init__(self, radius: float):
        self.radius = radius
    
    def area(self) -> float:
        return math.pi * self.radius ** 2
    
    def perimeter(self) -> float:
        return 2 * math.pi * self.radius

# Demo
shapes = [
    Rectangle(5, 3),
    Circle(4),
    Rectangle(10, 10),
]

for shape in shapes:
    name = shape.__class__.__name__
    print(f"{name}: area={shape.area():.2f}, perimeter={shape.perimeter():.2f}")
`,
          language: 'python',
        },
      ],
      activeFile: 'shapes.py',
      settings: { theme: 'dark', fontSize: 14, tabSize: 4, wordWrap: true },
    },
  },
  {
    id: 'js-functional',
    name: 'JS Functional',
    description: 'Functional programming patterns',
    icon: 'λ',
    workspace: {
      version: 1,
      files: [
        {
          name: 'functional.js',
          content: `// Functional Programming in JavaScript

// Pure functions
const add = (a, b) => a + b;
const multiply = (a, b) => a * b;

// Higher-order functions
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);

// Currying
const curry = (fn) => {
  const arity = fn.length;
  return function curried(...args) {
    if (args.length >= arity) return fn(...args);
    return (...more) => curried(...args, ...more);
  };
};

// Examples
const numbers = [1, 2, 3, 4, 5];

// Map, filter, reduce
const doubled = numbers.map(x => x * 2);
const evens = numbers.filter(x => x % 2 === 0);
const sum = numbers.reduce(add, 0);

console.log('Original:', numbers);
console.log('Doubled:', doubled);
console.log('Evens:', evens);
console.log('Sum:', sum);

// Composition
const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

const transform = compose(square, double, addOne);
console.log('\\ncompose(square, double, addOne)(3) =', transform(3));
// (3 + 1) * 2 = 8, then 8² = 64

// Currying example
const curriedAdd = curry(add);
const add5 = curriedAdd(5);
console.log('add5(10) =', add5(10));
`,
          language: 'javascript',
        },
      ],
      activeFile: 'functional.js',
      settings: { theme: 'dark', fontSize: 14, tabSize: 2, wordWrap: true },
    },
  },
  {
    id: 'python-data',
    name: 'Python Data',
    description: 'Data processing with Python',
    icon: '📊',
    workspace: {
      version: 1,
      files: [
        {
          name: 'data.py',
          content: `# Python Data Processing

from collections import Counter
from functools import reduce

# Sample data
sales = [
    {"product": "Apple", "quantity": 10, "price": 1.50},
    {"product": "Banana", "quantity": 15, "price": 0.75},
    {"product": "Apple", "quantity": 8, "price": 1.50},
    {"product": "Orange", "quantity": 12, "price": 2.00},
    {"product": "Banana", "quantity": 20, "price": 0.75},
]

# Total revenue per product
def calculate_revenue(items):
    revenue = {}
    for item in items:
        product = item["product"]
        amount = item["quantity"] * item["price"]
        revenue[product] = revenue.get(product, 0) + amount
    return revenue

# Using list comprehensions
quantities = [s["quantity"] for s in sales]
total_items = sum(quantities)

# Product frequency
products = [s["product"] for s in sales]
product_counts = Counter(products)

# Results
print("=== Sales Analysis ===")
print(f"Total transactions: {len(sales)}")
print(f"Total items sold: {total_items}")
print(f"\\nProduct frequency: {dict(product_counts)}")

revenue = calculate_revenue(sales)
print(f"\\nRevenue by product:")
for product, amount in sorted(revenue.items()):
    print(f"  {product}: \${amount:.2f}")

print(f"\\nTotal revenue: \${sum(revenue.values()):.2f}")
`,
          language: 'python',
        },
      ],
      activeFile: 'data.py',
      settings: { theme: 'dark', fontSize: 14, tabSize: 4, wordWrap: true },
    },
  },
  {
    id: 'blank',
    name: 'Blank Workspace',
    description: 'Start from scratch',
    icon: '📄',
    workspace: {
      version: 1,
      files: [
        {
          name: 'main.py',
          content: '# Start coding here\n',
          language: 'python',
        },
      ],
      activeFile: 'main.py',
      settings: { theme: 'dark', fontSize: 14, tabSize: 2, wordWrap: true },
    },
  },
]

export function getTemplate(id: string): Template | undefined {
  return templates.find(t => t.id === id)
}
