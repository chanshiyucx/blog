---
title: Delay
date: 2025-09-04 14:08:12
tags:
  - JavaScript/Function
---

## Description

Creates a Promise that resolves after a specified amount of time. This is useful for creating a pause or "sleep" effect within async functions.

## Code

```typescript
const delay = (time: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, time))
```

## Usage

This function is most commonly used with `async/await` syntax to pause code execution in a non-blocking way.

Basic Example:

```typescript
async function greetWithDelay() {
  console.log('Hello')
  // Pauses for 2 seconds
  await delay(2000) 
  console.log('World!')
}
```

Use in a Loop:

```typescript
async function processTasks(tasks) {
  for (const task of tasks) {
    console.log(`Processing task: ${task}`)
    // Pause for 1 second between processing each task
    await delay(1000) 
  }
  console.log('All tasks processed.')
}

processTasks(['task1', 'task2', 'task3'])```
