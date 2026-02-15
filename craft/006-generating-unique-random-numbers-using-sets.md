---
title: Generating Unique Random Numbers Using Sets
date: 2025-07-21 13:57:19
tags:
  - Web/JavaScript
references:
  - https://www.smashingmagazine.com/2024/08/generating-unique-random-numbers-javascript-using-sets/
---

JavaScript's built-in `Math.random()` method is great for generating random floating-point numbers that you can convert to integers. However, it has one significant limitation: it can't guarantee uniqueness across multiple calls. If you need to generate a series of unique random numbers, you'll need a more sophisticated approach.

In this article, we'll explore how to solve this problem using JavaScript's `Set` object, which naturally ensures uniqueness among its elements.

## The Problem with Random Generation

When you call `Math.random()` multiple times, there's always a chance of getting duplicate values, especially when working with smaller ranges or generating many numbers. For example:

```typescript
// This might produce duplicates
const numbers: number[] = [];
for (let i = 0; i < 5; i++) {
  numbers.push(Math.floor(Math.random() * 10) + 1);
}
console.log(numbers); // Could be [3, 7, 3, 9, 1] - notice the duplicate 3
```

## Leveraging Sets for Uniqueness

Sets in JavaScript automatically handle uniqueness—they simply ignore attempts to add duplicate values. This makes them perfect for our use case. Here's our strategy:

1. Create a Set to store our unique numbers
2. Define our parameters: how many numbers we need and the range to draw from
3. Generate and collect random numbers until we have enough unique values
4. Convert to array for easier manipulation

Here's a robust function that generates unique random numbers:

```typescript
const generateRandomNumbers = (
  count: number,
  min: number,
  max: number,
): number[] => {
  const rangeSize = max - min + 1;
  // Validation: ensure we're not asking for more numbers than possible
  if (count > rangeSize) {
    throw new Error("Count cannot be greater than the size of the range");
  }
  if (count <= 0) {
    throw new Error("Count must be a positive number");
  }
  if (min > max) {
    throw new Error("Minimum value cannot be greater than maximum value");
  }

  const uniqueNumbers: Set<number> = new Set();

  // Keep generating until we have enough unique numbers
  while (uniqueNumbers.size < count) {
    const random = Math.floor(Math.random() * rangeSize) + min;
    uniqueNumbers.add(random);
  }

  return Array.from(uniqueNumbers);
};

console.log(generateRandomNumbers(5, 5, 10));
```

## Performance Considerations

This method works well for most use cases, but be aware that as the ratio of `count` to `rangeSize` approaches 1, the algorithm may need many iterations to find the remaining unique values.

For such scenarios, you might consider alternative approaches like:

- Generating all possible numbers and shuffling the array
- Using a rejection sampling method with tracking

## Wrapping Up

By combining JavaScript's `Math.random()` with the uniqueness properties of Sets, we can easily generate collections of unique random numbers. This approach is clean, readable, and handles edge cases gracefully.

The key takeaway? When you need uniqueness in randomness, don't fight against duplicates—use data structures that naturally prevent them.
