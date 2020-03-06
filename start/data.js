const fs = require('fs');

const parseData = (text) => {
  const regex = /((\d*)\. (.|\n)*?)(?=\n\d*\.)/g;
  let ls = [];
  let a;
  let year;
  let level;
  while (a = regex.exec(text)) {
    const match = a[1].replace(/\n/g, ' ');
    if (match.replace(/_/g,'').length < 10) {
      continue;
    }
    if (match.includes('MATHCOUNTS')) {
      year = match.match(/\s\d{4}\s/)[0];
      level = match.match(/school|chapter|state|national/i);
      continue;
    }
    ls.push(match);
    // extra slide for answer
    ls.push("42");
  }
  return {
    year: year,
    level: level,
    questions: ls
  };
}

const getData = () => {
  return new Promise((resolve, reject) => {
    fs.readFile('questions.txt', (err, content) => {
      if (err) return reject('Error loading client secret file: ' + err);
      resolve(parseData(content));
    })
  });
}

module.exports.getData = getData;

module.exports.getDataAppend = (...pre) => {
  return new Promise((resolve, reject) => {
    getData().then(data => resolve([...pre, data]));
  })
}
