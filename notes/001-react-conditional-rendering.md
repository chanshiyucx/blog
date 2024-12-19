---
title: React Conditional Rendering
date: 2024-12-04 11:30:45
tags:
  - Web/React
  - TypeScript/Record
---
Using `Record` for conditional rendering provides a more elegant and maintainable solution compared to traditional methods like if/else or switch statements.

This approach offers several key advantages:

1. **Type Safety** - The `Record` type ensures all possible `Fruit` values have corresponding components at compile time.
2. **Clean Code** - Replaces verbose if/else or switch statements with a concise object lookup.
3. **Performance** - Direct object lookups are more efficient than evaluating multiple conditions, and React only renders the relevant component.
4. **Readability** - A single mapping object clearly visualizes all fruit-to-icon relationships.
5. **Scalability** - Adding new fruit types only requires updating the type and mapping, not the component logic.

```jsx {10-15}
import type { ReactNode } from 'react'

export type Fruit = 'apple' | 'kiwi' | 'cherry' | 'grape'

const Apple = () => <span>🍎</span>
const Kiwi = () => <span>🥝</span>
const Cherry = () => <span>🍒</span>
const Grape = () => <span>🍇</span>

const icon: Record<Fruit, ReactNode> = {
  apple: <Apple />,
  kiwi: <Kiwi />,
  cherry: <Cherry />,
  grape: <Grape />,
}

export const ConditionalFruitFacts = ({ fruit }: { fruit: Fruit }) => {
  return <>{icon[fruit]}</>
}
```

Ref: [React Conditional Rendering With Type Safety and Exhaustive Checking](https://www.reddit.com/r/reactjs/comments/z5c7iu/react_conditional_rendering_with_type_safety_and/)
