---
title: React Conditional Rendering
date: 2024-12-04 11:30:45
tags:
  - Web/React
---
The use of `Record<Fruit, ReactNode>` for conditional rendering offers several benefits:

1. **Type Safety**
   - The `Record` type ensures that all possible `Fruit` values are mapped to a corresponding component
   - TypeScript will throw an error if any fruit type is missing from the mapping
   - It prevents runtime errors by catching missing cases at compile time

2. **Clean and Maintainable Code**
   - Eliminates the need for multiple if/else statements or switch cases
   - The mapping object provides a clear, single source of truth for all fruit-to-icon relationships
   - New fruit types can be easily added by updating both the `Fruit` type and the `icon` mapping

3. **Performance**
   - Object lookup (`icon[fruit]`) is more performant than evaluating multiple conditions
   - React doesn't need to process conditional statements on each render
   - Direct access to components through object properties is more efficient

4. **Readability**
   - The code is more declarative rather than imperative
   - The relationship between fruits and their icons is clearly visible in one place
   - Makes the code easier to understand and maintain for other developers

5. **Scalability**
   - The pattern scales well as more fruit types are added
   - No need to modify the component logic when adding new fruits
   - Maintains consistent structure regardless of how many options are added

This approach represents a more elegant and maintainable solution compared to traditional conditional rendering methods using if/else or switch statements.

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

Ref: <https://www.reddit.com/r/reactjs/comments/z5c7iu/react_conditional_rendering_with_type_safety_and/>
