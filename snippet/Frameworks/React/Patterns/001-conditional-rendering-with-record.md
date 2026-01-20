---
title: Conditional Rendering With Record
date: 2025-09-06 08:25:27
tags:
  - Snippet/React
references:
  - https://www.reddit.com/r/reactjs/comments/z5c7iu/react_conditional_rendering_with_type_safety_and/
---

## Description

Creates a type-safe conditional rendering pattern using Record type to map union types to React components.

This approach eliminates the need for switch statements or multiple conditional renders, providing a clean and maintainable solution for rendering different components based on a prop value.

## Code

```jsx {10-15}
import { type ReactNode } from 'react'

type Fruit = 'apple' | 'kiwi' | 'cherry' | 'grape'

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

## Usage

This pattern is particularly useful when you have a finite set of options that need to render different components or content.

```tsx
function App() {
  return (
    <div>
      <ConditionalFruitFacts fruit="apple" />
      <ConditionalFruitFacts fruit="kiwi" />
      <ConditionalFruitFacts fruit="cherry" />
    </div>
  )
}
```
