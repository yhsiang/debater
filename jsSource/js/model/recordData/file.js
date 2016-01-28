'use strict';

define(['exports', 'model/fileURL'], function (exports, _fileURL) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.file = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = (function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  })();

  var dataRef = undefined;
  var file = exports.file = {
    get: function get(key) {
      return dataRef[key];
    },
    load: function load() {
      var loadDeferred = new $.Deferred();
      $.get('http://etblue.github.io/debater/file/sample.md').done(function (fileData) {
        var file = new File(fileData);
        dataRef = file.toJSON();
        loadDeferred.resolve(dataRef);
      });
      return loadDeferred;
    }
  };

  var File = (function () {
    function File(fileData) {
      _classCallCheck(this, File);

      this._data = getFileJSON(fileData);
      return this;
    }

    _createClass(File, [{
      key: 'toJSON',
      value: function toJSON() {
        var _this = this;

        var result = {};
        Object.keys(this._data).forEach(function (key) {
          result[key] = _this._data[key];
        });
        return result;
      }
    }]);

    return File;
  })();

  function getFileJSON(fileData) {
    var file = {
      title: "",
      authors: [],
      points: [],
      professions: [],
      relations: [],
      topics: []
    };
    var lines = fileData.split("\n");
    var meta = '';
    $.each(lines, function (index, line) {
      if (line) {
        if (file.title.length == 0 && line[0] != '#') {
          file.title = line;
        } else if (line.startsWith('# ')) {
          file.authors.push({
            name: line.substring(2)
          });
        } else if (line.startsWith('## 個人頁面')) {
          meta = 'profiles';
          file.authors[file.authors.length - 1][meta] = [];
        } else if (line.startsWith('## 關係')) {
          meta = 'relations';
          file.authors[file.authors.length - 1][meta] = [];
        } else if (line.startsWith('## 職業')) {
          meta = 'professions';
          file.authors[file.authors.length - 1][meta] = [];
        } else if (line.startsWith('## 文章')) {
          meta = 'posts';
          file.authors[file.authors.length - 1][meta] = [];
        } else if (line.startsWith('### ')) {
          var post = {
            timestamp: line.substring(4, line.indexOf('http')).trim(),
            url: line.substring(line.indexOf('http')).trim()
          };
          file.authors[file.authors.length - 1]['posts'].push(post);
        } else if (line.startsWith('- ')) {
          if (meta == 'posts') {
            if (!line.includes('#')) {
              return;
            }

            var topics = [];

            if (line.indexOf('#') > 0) {
              topics = line.substring(line.indexOf('#') + 1).split('#');
            }

            var relations = file.authors[file.authors.length - 1]['relations'];
            var professions = file.authors[file.authors.length - 1]['professions'];
            var point = {
              author: file.authors[file.authors.length - 1].name,
              timestamp: file.authors[file.authors.length - 1]['posts'][file.authors[file.authors.length - 1]['posts'].length - 1].timestamp,
              url: file.authors[file.authors.length - 1]['posts'][file.authors[file.authors.length - 1]['posts'].length - 1].url,
              relations: relations,
              professions: professions,
              topics: topics,
              content: line.substring(2, line.indexOf('#'))
            };
            file.points.push(point);
            file.topics = file.topics.concat(topics).filter(function (item, pos, self) {
              return self.indexOf(item) == pos;
            });
            file.relations = file.relations.concat(relations).filter(function (item, pos, self) {
              return self.indexOf(item) == pos;
            });
            ;
            file.professions = file.professions.concat(professions).filter(function (item, pos, self) {
              return self.indexOf(item) == pos;
            });
            ;
          } else {
            file.authors[file.authors.length - 1][meta].push(line.substring(2));
          }
        }
      }
    });
    return file;
  }
});