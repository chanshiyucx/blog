// var regex = /ab{2,5}c/g
// var string = 'abc abbc abbbc abbbbc abbbbbc abbbbbbc'
// console.log(string.match(regex))

// var regex = /a[123]b/g;
// var string = "a0b a1b a2b a3b a4b";
// console.log( string.match(regex) );

// var regex = /good|goodbye/g;
// var string = "goodbye";
// console.log( string.match(regex) );

// var regex = /goodbye|good/g;
// var string = "goodbye";
// console.log( string.match(regex) );

var regex = /#[0-9a-zA-Z]{3}([0-9a-zA-Z]{3})?/g

var regex = /#([0-9a-zA-Z]{6}|[0-9a-zA-Z]{3})/g

const regex = /#([0-9a-zA-Z]{6}|[0-9a-zA-Z]{3})/g
const str = `#ffbbad #Fc01DF #FFF #ffE`
let m

while ((m = regex.exec(str)) !== null) {
  // This is necessary to avoid infinite loops with zero-width matches
  if (m.index === regex.lastIndex) {
    regex.lastIndex++
  }

  // The result can be accessed through the `m`-variable.
  m.forEach((match, groupIndex) => {
    console.log(`Found match, group ${groupIndex}: ${match}`)
  })
}

const str = 'aaa1 bbb2 ccc3'
const regex = /\b(\w+)(\d+)\b/g
console.log('match1:', str.match(regex))
console.log('match2:', str.match(regex))
console.log('match3:', str.match(regex))
console.log('exec1:', regex.exec(str))
console.log('exec2:', regex.exec(str))
console.log('exec3:', regex.exec(str))
