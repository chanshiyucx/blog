---
title: Generating Unique Random Numbers Using Sets
date: 2025-07-21 13:57:19
tags:
  - Web/JavaScript
  - JavaScript/Set
references: 
  - https://www.smashingmagazine.com/2024/08/generating-unique-random-numbers-javascript-using-sets/
---
JavaScript comes with a lot of built-in functions that allow you to carry out so many different operations. One of these built-in functions is the `Math.random()` method, which generates a random floating-point number that can then be manipulated into integers.

However, if you wish to generate a series of unique random numbers and create more random effects in your code, you will need to come up with a custom solution for yourself because the `Math.random()` method on its own cannot do that for you.

In this article, we're going to be learning how to circumvent this issue and generate a series of unique random numbers using the `Set` object in JavaScript, which we can then use to create more randomized effects in our code.

## Generating a Unique Series of Random Numbers

One of the ways to generate a unique series of random numbers in JavaScript is by using `Set` objects. The reason why we're making use of sets is because the elements of a set are unique. We can iteratively generate and insert random integers into sets until we get the number of integers we want.

And since sets do not allow duplicate elements, they are going to serve as a filter to remove all of the duplicate numbers that are generated and inserted into them so that we get a set of unique integers.

Here's how we are going to approach the work:

1. Create a `Set` object.
2. Define how many random numbers to produce and what range of numbers to use.
3. Generate each random number and immediately insert the numbers into the `Set` until the `Set` is filled with a certain number of them.

One thing to note, however, is that the number of integers you want to generate (represented by `count` in the code) should be less than the upper limit of your range plus one (represented by `max + 1` in the code). Otherwise, the code will run forever. You can add an `if statement` to the code to ensure that this is always the case.

The following is a quick example of how the code comes together:

```typescript
const generateRandomNumbers = (
  count: number,
  min: number,
  max: number,
): number[] => {
  const rangeSize = max - min + 1
  // Validation: ensure we're not asking for more numbers than possible
  if (count > rangeSize) {
    throw new Error('Count cannot be greater than the size of the range')
  }

  // 1: Create a `Set` object
  const uniqueNumbers: Set<number> = new Set()

  // 2: Generate each random number
  while (uniqueNumbers.size < count) {
    const random = Math.floor(Math.random() * rangeSize) + min
    uniqueNumbers.add(random)
  }
  
  // 3: Immediately insert them numbers into the Set…
  return Array.from(uniqueNumbers)
}

console.log(generateRandomNumbers(5, 5, 10))
```

What the code does is create a new `Set` object and then generate and add the random numbers to the set until our desired number of integers has been included in the set. The reason why we're returning an array is because they are easier to work with.

The best way to learn anything in software development is by consuming content and reinforcing whatever knowledge you've gotten from that content by practicing. So, don't stop here. Run the examples in this tutorial, play around with them, come up with your own unique solutions, and also don't forget to share your good work. Ciao!
