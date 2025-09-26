---
title: Object groupBy
date: 2025-09-26 21:04:18
tags:
  - Snippet/JavaScript
---

## Usage

The `Object.groupBy()` static method groups the elements of a given iterable according to the string values returned by a provided callback function. The returned object has separate properties for each group, containing arrays with the elements in the group.

## Code

```typescript
const inventory = [
  { name: "asparagus", type: "vegetables", quantity: 5 },
  { name: "bananas", type: "fruit", quantity: 0 },
  { name: "goat", type: "meat", quantity: 23 },
  { name: "cherries", type: "fruit", quantity: 5 },
  { name: "fish", type: "meat", quantity: 22 },
]

const result = Object.groupBy(inventory, ({ type }) => type)
/** 
{
  vegetables: [ { name: 'asparagus', type: 'vegetables', quantity: 5 } ],
  fruit: [
    { name: 'bananas', type: 'fruit', quantity: 0 },
    { name: 'cherries', type: 'fruit', quantity: 5 }
  ],
  meat: [
    { name: 'goat', type: 'meat', quantity: 23 },
    { name: 'fish', type: 'meat', quantity: 22 }
  ]
}
 */
```
