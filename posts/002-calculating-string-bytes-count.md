---
title: Calculating String Bytes Count
date: 2024-03-18 11:25:00
tags:
  - Web/Unicode
---
Recently, I encountered a challenging problem at work. I was responsible for developing the file upload function, which stores multiple versions of a file based on the filename. When uploading a file, the total number of bytes in the filename is counted and spliced into the name as an identifier.

At first I used `string.length` as the filename byte count, which resulted in an identifier error. After I checked the wiki documentation, I have a new perception of character encoding.

## Unicode Code Points

The `charCodeAt()` method of String values returns an integer between 0 and 65535 representing the UTF-16 code unit at the given index.

The `codePointAt()` method of String values returns a non-negative integer that is the Unicode code point value of the character starting at the given index. Note that the index is still based on UTF-16 code units, not Unicode code points.

Unicode code points range from 0 to 1114111 (0x10FFFF). `charCodeAt()` always returns a value that is less than 65536, because **the higher code points are represented by a pair of 16-bit surrogate pseudo-characters**. Therefore, in order to get a full character with value greater than 65535, it is necessary to retrieve not only `charCodeAt(i)`, but also `charCodeAt(i + 1)`, or to use `codePointAt(i)` instead.

So we use `codePointAt(i)` method to get the Unicode code point value at the given index.

```typescript
const charCode = str.codePointAt(i)
```

## UTF-8

UTF-8 is a variable-length Unicode encoding format that uses one to four bytes to encode each character.In the following table, the x characters are replaced by the bits of the code point:

| First code point | Last code point | Byte 1   | Byte 2   | Byte 3   | Byte 4   |
| :--------------- | :-------------- | :------- | :------- | :------- | :------- |
| U+0000           | U+007F          | 0xxxxxxx |          |          |          |
| U+0080           | U+07FF          | 110xxxxx | 10xxxxxx |          |          |
| U+0800           | U+FFFF          | 1110xxxx | 10xxxxxx | 10xxxxxx |          |
| U+010000         | [b]U+10FFFF     | 11110xxx | 10xxxxxx | 10xxxxxx | 10xxxxxx |

Information about UTF-8 encoding on Wikipedia: [UTF-8 Encoding](https://en.wikipedia.org/wiki/UTF-8#Encoding).

So we can count the number of bytes in each code point character in segments and then add them up to get the total number.

It's important to note that the higher code points are represented by a pair of 16-bit surrogate pseudo-characters, so when the UTF-16 code units is greater than 0x10FFFF, the index should be an additional 1.

```typescript
/**
 * @description Calculating the number of bytes in a UTF-8 encoded string
 * @param  str - Target string
 * @return The number of bytes in the target string
 */
const stringByteUTF8 = (str: string): number => {
  let total = 0
  let charCode: number
  for (let i = 0, len = str.length; i < len; i++) {
    charCode = str.codePointAt(i)

    if (charCode <= 0x007f) {
      total += 1
    } else if (charCode <= 0x07ff) {
      total += 2
    } else if (charCode <= 0xffff) {
      total += 3
    } else {
      total += 4
      i++ // the index should be an additional 1
    }
  }
  return total
}
```

## UTF-16

UTF-16 encodes up to 65535 with two bytes, and beyond 65535 with four bytes.

So the code to calculate the number of bytes in a UTF16 string is relatively simple.

```typescript
/**
 * @description Calculating the number of bytes in a UTF-16 encoded string
 * @param  str - Target string
 * @return The number of bytes in the target string
 */
const stringByteUTF16 = (str: string): number => {
  let total = 0
  let charCode: number
  for (let i = 0, len = str.length; i < len; i++) {
    charCode = str.codePointAt(i)

    if (charCode <= 0xffff) {
      total += 2
    } else {
      total += 4
      i++
    }
  }
  return total
}
```

## Final Code

```typescript
/**
 * @description Calculating the number of bytes in a string
 * @param  str - Target string
 * @param  charset - Encoding format of the target string
 * @return The number of bytes in the target string
 */
type Charset = "utf-8" | "utf-16"

const stringByte = (str: string, charset: Charset = "utf-8") => {
  let total = 0
  let charCode: number

  if (charset === "utf-8") {
    for (let i = 0, len = str.length; i < len; i++) {
      charCode = str.codePointAt(i)

      if (charCode <= 0x007f) {
        total += 1
      } else if (charCode <= 0x07ff) {
        total += 2
      } else if (charCode <= 0xffff) {
        total += 3
      } else {
        total += 4
        i++
      }
    }
  } else if (charset === "utf-16") {
    for (let i = 0, len = str.length; i < len; i++) {
      charCode = str.codePointAt(i)

      if (charCode <= 0xffff) {
        total += 2
      } else {
        total += 4
        i++
      }
    }
  }

  return total
}
```

Q.E.D.
