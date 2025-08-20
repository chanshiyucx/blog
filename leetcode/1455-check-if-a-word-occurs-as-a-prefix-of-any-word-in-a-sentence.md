---
title: Check If a Word Occurs As a Prefix of Any Word in a Sentence
date: 2024-12-02 21:15:36
level: Easy
tags:
  - Algorithm/TwoPointers
---

## Intuition

The problem requires finding the position of the first word in a sentence that starts with a given prefix. If such a word is found, the function should return the 1-based index of the word in the sentence. If no word starts with the prefix, it should return -1.

We can approach this problem by:

1. Splitting the sentence into individual words.
2. Iterating through the words, checking if each word starts with the given prefix.
3. Returning the index of the first word that matches the condition.
4. If no match is found after checking all words, return -1.

## Approach

Below is the step-by-step breakdown of the approach:

1. **Split the Sentence**:  
	- The sentence can be split into an array of words using the `split(' ')` method.

2. **Check Each Word**:  
	- Loop through the array of words, checking if each word starts with searchWord using the `startsWith()` method. The `startsWith()` method is case-sensitive and checks whether the word begins with the specified prefix.

3. **Return the Index**:  
	- If a word matches, return its index (adjusted to be 1-based, so add 1 to the zero-based index). If no match is found, return -1.

## Complexity

- **Time Complexity**: **O(n)**, where n is the number of words in the sentence. This is because we loop through all the words and perform a string comparison for each word.
- **Space Complexity**: **O(m)**, where m is the length of the sentence, due to the space needed to store the words array after splitting the sentence.

## Code

```typescript
function isPrefixOfWord(sentence: string, searchWord: string): number {
  const words = sentence.split(' ') 
  for (let i = 0; i < words.length; i++) {
    if (words[i].startsWith(searchWord)) { 
      return i + 1 
    }
  }
  return -1 
}
```
