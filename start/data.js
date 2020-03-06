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
      n = match.match(/(\d{4}) (school|chapter|state|national)/i);
      [year, level] = [n[1], n[2]]
      continue;
    }
    ls.push(match);
  }
  if (parseInt(year) >= 2012) {
    ls = [];
    const qregex = /([A-Z](.|\n)*?\?.*)/g
    let i = 1;
    while (a = qregex.exec(text)) {
      const match = a[1].replace(/\n/g, ' ');
      if (match.includes('MATHCOUNTS')) continue;
      ls.push(i + ". " + match);
      i++;
    }
  }
  let qAndA = [];
  for (let q of ls) {
    qAndA.push(q);
    // placeholder for answer
    qAndA.push("42");
  }
  return {
    year: year,
    level: level,
    questions: qAndA
  }
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
