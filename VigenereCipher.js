const alphabet = "abcdefghijklmnopqrstuvwxyz";
const alphabetUpper = "abcdefghijklmnopqrstuvwxyz".toUpperCase();

const vigenereCipher = (text, keyword) => {
  let encrypted = "";
  let keywordIndex = 0;
  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    let key = keyword[keywordIndex];
    let keyIndex = alphabet.indexOf(key.toLowerCase());
    let keyIndexUpper = alphabetUpper.indexOf(key.toUpperCase());
    if (alphabet.indexOf(char.toLowerCase()) === -1) {
      encrypted += char;
      continue;
    }
    if (char === char.toUpperCase()) {
      encrypted +=
        alphabetUpper[(alphabetUpper.indexOf(char) + keyIndexUpper) % 26];
    } else {
      encrypted += alphabet[(alphabet.indexOf(char) + keyIndex) % 26];
    }
    keywordIndex = (keywordIndex + 1) % keyword.length;
  }
  return encrypted;
};

console.log(vigenereCipher("DEBUGPRINTSHIFTCACHEPOPUP", "SCANNER"));
