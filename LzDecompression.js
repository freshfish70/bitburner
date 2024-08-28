const text = "5aaabb450723abb";
// Lempel-Ziv (LZ) compression is a data compression technique which encodes data using references to earlier parts of the data. In this variant of LZ, data is encoded in two types of chunk. Each chunk begins with a length L, encoded as a single ASCII digit from 1 to 9, followed by the chunk data, which is either:
//
// 1. Exactly L characters, which are to be copied directly into the uncompressed data.
// 2. A reference to an earlier part of the uncompressed data. To do this, the length is followed by a second ASCII digit X: each of the L output characters is a copy of the character X places before it in the uncompressed data.
//
// For both chunk types, a length of 0 instead means the chunk ends immediately, and the next character is the start of a new chunk. The two chunk types alternate, starting with type 1, and the final chunk may be of either type.

// const lzDecompression = (text) => {
//   let output = "";
//   console.log(text);
//   for (let i = 0; i < text.length; i++) {
//     let char = Number(text[i]);
//     let char2;
//
//     if (i + 1 <= text.length - 1) {
//       char2 = Number(text[i + 1]);
//     }
//
//     if (Number.isInteger(char) && Number.isInteger(char2)) {
//       if (char === 0 || char2 === 0) {
//         //
//       } else {
//         console.log(char, char2, output);
//         console.log(output.length - char2, char);
//         const sliced = output.slice(-char2);
//         let word = "";
//         if (sliced.length < char) {
//           const r = char % sliced.length;
//           const rep = Math.ceil(char / sliced.length);
//           const i = new Array(rep).fill(sliced);
//           console.log(r);
//           const nw = i.join("").slice(0, -r);
//           word = nw;
//         } else {
//           word = output.slice(0, char);
//         }
//         console.log(sliced, "sliced");
//         console.log(word, "the word");
//         output += word;
//         i++; // skip the next number as it is already used
//         console.log("___________________");
//       }
//       // let count = parseInt(char.toString() + char2.toString());
//       // const word = text.slice(i + 2, i + count + 2);
//       // console.log(word);
//     } else if (Number.isInteger(parseInt(char))) {
//       if (char !== 0) {
//         let count = parseInt(char);
//         let word = text.slice(i + 1, i + count + 1); //.split(/\d/gi)[0];
//         word = word.split(/\d/gi)[0];
//         console.log(word);
//         if (word.length < char) {
//           const i = new Array(char).fill(word);
//           const nw = i.join("");
//           console.log(word, "the word");
//           word = nw;
//         }
//         // console.log(word, "the word");
//         output += word;
//         console.log("___________________");
//         //
//         // let count = parseInt(char);
//         // const word = text.slice(i + 1, i + count + 1);
//         //
//         // console.log(word, "the word");
//         // output += word;
//         // console.log("___________________");
//         // //
//       }
//     }
//   }
//   return output;
// };

console.log(lzDecompress("5aaabb450723abb"));
console.log("aaabbaaababababaabb");
function lzCompress(input) {
  let compressed = "";
  let currentIndex = 0;

  while (currentIndex < input.length) {
    let chunkLength = 1;
    while (
      currentIndex + chunkLength < input.length &&
      input[currentIndex] === input[currentIndex + chunkLength]
    ) {
      chunkLength++;
    }

    if (chunkLength > 9) {
      // Split a long run into multiple chunks
      while (chunkLength > 9) {
        compressed += "9" + input[currentIndex];
        chunkLength -= 9;
      }
    }

    compressed += chunkLength.toString() + input[currentIndex];
    currentIndex += chunkLength;
  }

  return compressed;
}

function lzDecompress(compressed) {
  let decompressed = "";
  let currentIndex = 0;

  while (currentIndex < compressed.length) {
    const chunkLength = parseInt(compressed[currentIndex], 10);
    currentIndex += 1;

    if (chunkLength === 0) {
      currentIndex += 1;
      continue;
    }

    const chunkData = compressed[currentIndex];
    currentIndex += 1;

    for (let i = 0; i < chunkLength; i++) {
      decompressed +=
        decompressed[decompressed.length - parseInt(chunkData, 10)];
    }
  }

  return decompressed;
}

// Example usage:
// const originalData = "AAABBBCCCCDDDD";
// const compressedData = lzCompress(originalData);
// console.log("Compressed: ", compressedData);
const decompressedData = lzDecompress("5aaabb450723abb");
console.log("Decompressed: ", decompressedData);
