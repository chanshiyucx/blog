---
title: Match Chinese Characters
date: 2024-12-25 16:11:36
tags:
  - Web/JavaScript
  - JavaScript/RegExp
---
When searching for "JavaScript regex for matching Chinese characters" on Google, most results suggest using `/[\u4e00-\u9fa5]/`. But is this regular expression really correct? Let's dive in and find out.

## Han Script and Han Characters

Let's start by understanding two fundamental concepts:

- **Han Script** is a writing system that originated from Chinese and was later adopted by Japanese, Korean, and other languages
- **Han Characters (CJK Ideographs)** are the basic units of Han Script

Many countries and regions in the Han cultural sphere have developed their own character encoding standards. Unicode unifies these standards, aiming to achieve lossless conversion between original standards and Unicode encoding.

## Character Sets and Character Encodings

What's the difference between Unicode, GBK, and UTF-8? They are actually concepts from different domains.

### Character Sets

Common character sets like Unicode and ASCII are designed to represent characters with a series of numbers, also known as code points.

ASCII uses one byte to represent a character, defining encodings for 128 characters that correspond to English characters and binary values.

For Asian languages like Chinese, more bytes are needed to represent a single character. For example, GB2312 (for Simplified Chinese) uses two bytes per character, allowing representation of up to 65,536 characters (256 x 256).

The existence of multiple encoding systems meant that the same binary number could be interpreted as different symbols. Reading text with the wrong encoding results in garbled characters. This is why Unicode was created.

Unicode is a unified character set that assigns a unique code to every symbol in the world. This uniqueness eliminates character encoding confusion.

### Character Encodings

Unicode is just a character set - it defines binary codes for symbols but doesn't specify how to store these codes. To save characters in computers, they must first be encoded.

UTF-8 is one of Unicode's encoding methods and the most widely used on the internet. Other implementations include UTF-16 (using two or four bytes per character) and UTF-32 (using four bytes per character).

UTF-8's main feature is its variable-length encoding, using 1-4 bytes per symbol depending on the character.

GBK (Chinese Internal Code Specification) is similar to UTF-8 but specifically for Chinese characters. It's an extension of GB2312.

In summary: **ASCII and Unicode are character sets, while UTF-8 and GBK are encoding methods**. They serve different purposes and cannot be directly compared.

In summary:

- **Character sets (e.g., Unicode, ASCII)** define mappings between characters and codes.
- **Encodings (e.g., UTF-8, GBK)** specify how those codes are stored.

## Matching Chinese Characters with Regex

Now that we understand character sets and encodings, let's return to our main topic. What exactly do we mean by "Chinese characters" in terms of character sets?

Unicode unifies characters from different encoding standards based on three dimensions: semantics, abstract shape, and typeface. Characters with the same origin, meaning, and similar shapes are given the same encoding. These encoded characters are called CJK Unified Ideographs, which we referred to as "Han Characters" earlier.

The regex `/[\u4e00-\u9fa5]/` matches the CJK Unified Ideographs block included in Unicode 1.0.1. Before Unicode 3.0 (1992-1999), this expression correctly matched all Han characters. This regex is likely over 20 years old.

However, Unicode has evolved significantly, with version 10.0.0 released in June 2017. Many new Han characters have been added over these 20 years, falling outside the range of this regex. We need a modern solution that keeps up with Unicode standards.

Here's a maintenance-free regex for matching Han characters:

```typescript
const HanZi = /\p{Unified_Ideograph}/u

!!'你好'.match(HanZi) // true
```

It's called [Unicode property escapes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Unicode_Property_Escapes) and already available in [Chrome 64, Firefox 78, Safari 11.1 and Node.js 10](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape#browser_compatibility).

- `\u` is a regex flag defined in ECMAScript 2015, treating the pattern as Unicode code point sequences
- `\p` is a Unicode property escape defined in ECMAScript 2018, enabling pattern construction based on Unicode character properties
- `Unified_Ideograph` is a binary property of Unicode characters: Yes for Han characters, No for others

`\p{Unified_Ideograph}` matches all Unicode characters with `Unified_Ideograph=yes`. The implementation depends on the Unicode version of the runtime, freeing developers from maintaining specific code point ranges.

## Similar Unicode Property Escapes

```typescript
/\p{Ideographic}/u
```

This matches all characters with `Ideographic=yes`, including CJK Unified Ideographs, Tangut characters and components, Nüshu, CJK compatibility characters, Suzhou numerals, " 〇 ", and the Japanese letter-ending mark "〆".

Using `/\p{Ideographic}/u` is too broad for matching Han characters as it includes Tangut, Nüshu, and compatibility characters.

```typescript
/\p{Script=Han}/u
```

The `Script` property selects characters that:
1. Share common graphical features and historical development
2. Are used to represent textual information in a writing system

`Script=Han` includes all CJK Unified Ideographs, compatibility characters, Suzhou numerals, " 〇 ", "〆", " 々 ", and commonly used radicals in dictionaries.

`/\p{Script=Han}/u` matches all characters in the Han Script, including radicals and modifiers that either lack independent meaning or cannot exist independently. This regex confuses the scope of Han Script with Han Characters.

## Summary

1. `/[\u4e00-\u9fa5]/` is outdated, don't use this 20-year-old regex
2. `/\p{Unified_Ideograph}/u` is correct, maintenance-free and matches all Han characters
3. `/\p{Ideographic}/u` and `/\p{Script=Han}/u` match additional characters beyond Han characters and are incorrect for this specific purpose

Ref:
- [Unicode character class escape](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape)
- [Unicode Regular Expressions](https://www.regular-expressions.info/unicode.html)
