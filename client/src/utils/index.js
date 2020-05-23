const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const getRandomLetter = () => {
  return chars.charAt(Math.floor(Math.random() * chars.length));
};

export const getRandomLetters = (rounds) => {
  let lettersSet = new Set();

  while (lettersSet.size < rounds) {
    const char = chars.charAt(Math.floor(Math.random() * chars.length));
    lettersSet.add(char);
  }
  return Array.from(lettersSet);
};
