module.exports = computeSimilarities;

function computeSimilarities(commits) {
  var index = buildIndex();

  return {
    print: print
  };

  function print(fileName, maxCount) {
    if (maxCount === undefined || Number.isNaN(maxCount)) {
      maxCount = 10;
    }

    index.forEach(printEntry);

    function printEntry(entry) {
      if (entry.name === fileName) {
        console.log(entry.name + ' most often commited with: ');
        console.log('');
        console.log('# together\tSimilarity\tName');
        console.log(entry.related.slice(0, maxCount).map(toUIOutput).join('\n'));
        console.log('');
      }
    }
  }

  function toUIOutput(record) {
    return pad(record.count, 10) + '\t' + pad(record.index.toFixed(2), 10) + '\t' + record.name;
  }

function pad(n, width, z) {
  z = z || ' ';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

  function buildIndex() {
    var files = Object.create(null);// number of times each file was seen

    commits.forEach(countFiles);
    commits.forEach(countCoocurrences);
    var values = toValues(files);
    values.forEach(updateJaccardSimilarity)

    return values;

    function updateJaccardSimilarity(fileRecord) {
      // a & b / (a + b - a & b)
      var related = toValues(fileRecord.similarities);

      related.forEach(otherFile => {
        var together = otherFile.count;
        otherFile.index = together/(fileRecord.count + files[otherFile.name].count - together);
      });

      fileRecord.related = related.sort(byIndex);
    }

    function countCoocurrences(commit) {
      commit.forEach(processFile)

      function processFile(fileA) {
        var aRecord = files[fileA];

        commit.forEach(processOtherFile)

        function processOtherFile(fileB) {
          if (fileB === fileA) return;

          var related = aRecord.similarities[fileB]
          if (!related) related = aRecord.similarities[fileB] = {
            name: fileB,
            count: 0
          };

          related.count += 1; // /commit.length; <- should I weight it?
        }
      }
    }

    function countFiles(commit) {
      commit.forEach(processFile);

      function processFile(file) {
        var record = files[file];
        if (!record) record = files[file] = {
          count: 0,
          name: file,
          similarities: Object.create(null)
        };

        record.count += 1;
      }
    }
  }
}

 function toValues(object) {
   return Object.keys(object).map(toValue);

   function toValue(key) {
     return object[key]
   }
 }

function byIndex(x, y) {
  return y.index - x.index
}
