(function() {
  "use strict";
  var Matrix, RotationMatrix, Vector, gyroToMatrix, main, matrixToAxisAngle,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Vector = (function() {
    Vector.empty = function(n) {
      return new Vector((function() {
        var j, ref, results;
        results = [];
        for (j = 0, ref = n; 0 <= ref ? j < ref : j > ref; 0 <= ref ? j++ : j--) {
          results.push(null);
        }
        return results;
      })());
    };

    function Vector(values) {
      this.values = values;
      this.dimension = this.values.length;
    }

    Vector.prototype.isDefinedWith = function(other) {
      var defined;
      defined = other instanceof Vector && this.dimension === other.dimension;
      if (!defined) {
        throw "Operation not defined";
      }
    };

    Vector.prototype.add = function(other) {
      var i, j, ref, result;
      this.isDefinedWith(other);
      result = Vector.empty(this.dimension);
      for (i = j = 0, ref = result.dimension; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        result.values[i] = this.values[i] + other.values[i];
      }
      return result;
    };

    Vector.prototype.scalarProduct = function(scalar) {
      var i, j, ref, result;
      result = Vector.empty(this.dimension);
      for (i = j = 0, ref = result.dimension; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        result.values[i] = scalar * this.values[i];
      }
      return result;
    };

    Vector.prototype.subtract = function(other) {
      return this.add(other.scalarProduct(-1));
    };

    Vector.prototype.dot = function(other) {
      var i, j, ref, result;
      this.isDefinedWith(other);
      result = 0;
      for (i = j = 0, ref = this.dimension; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        result += this.values[i] * other.values[i];
      }
      return result;
    };

    Vector.prototype.norm = function() {
      return Math.pow(this.dot(this), 0.5);
    };

    Vector.prototype.normalize = function() {
      var i, j, norm, ref, result;
      result = Vector.empty(this.dimension);
      norm = this.norm();
      for (i = j = 0, ref = result.dimension; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        result.values[i] = this.values[i] / norm;
      }
      return result;
    };

    Vector.prototype.cross = function(other) {
      var i, index1, index2, j, ref, result;
      this.isDefinedWith(other);
      result = Vector.empty(this.dimension);
      for (i = j = 0, ref = result.dimension; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        index1 = (i + 1) % this.dimension;
        index2 = (i + 2) % this.dimension;
        result.values[i] = this.values[index1] * other.values[index2] - other.values[index1] * this.values[index2];
      }
      return result;
    };

    return Vector;

  })();

  Matrix = (function() {
    Matrix.identity = function(n) {
      var col, j, k, ref, ref1, result, row;
      result = Matrix.empty(n, n);
      for (row = j = 0, ref = result.rows; 0 <= ref ? j < ref : j > ref; row = 0 <= ref ? ++j : --j) {
        for (col = k = 0, ref1 = result.cols; 0 <= ref1 ? k < ref1 : k > ref1; col = 0 <= ref1 ? ++k : --k) {
          result.values[row][col] = row === col ? 1 : 0;
        }
      }
      return result;
    };

    Matrix.empty = function(rows, cols) {
      return new Matrix((function() {
        var j, ref, results;
        results = [];
        for (j = 0, ref = rows; 0 <= ref ? j < ref : j > ref; 0 <= ref ? j++ : j--) {
          results.push((function() {
            var k, ref1, results1;
            results1 = [];
            for (k = 0, ref1 = cols; 0 <= ref1 ? k < ref1 : k > ref1; 0 <= ref1 ? k++ : k--) {
              results1.push(null);
            }
            return results1;
          })());
        }
        return results;
      })());
    };

    function Matrix(values) {
      this.values = values;
      this.rows = this.values.length;
      this.cols = this.values[0].length;
    }

    Matrix.prototype.row = function(n) {
      return new Vector(this.values[n]);
    };

    Matrix.prototype.col = function(n) {
      var row;
      return new Vector((function() {
        var j, ref, results;
        results = [];
        for (row = j = 0, ref = this.rows; 0 <= ref ? j < ref : j > ref; row = 0 <= ref ? ++j : --j) {
          results.push(this.values[row][n]);
        }
        return results;
      }).call(this));
    };

    Matrix.prototype.multiply = function(other) {
      var col, colVector, defined, j, k, ref, ref1, result, row, rowVector;
      defined = other instanceof Matrix && this.cols === other.rows;
      if (!defined) {
        throw "Operation not defined";
      }
      result = Matrix.empty(this.rows, other.cols);
      for (row = j = 0, ref = result.rows; 0 <= ref ? j < ref : j > ref; row = 0 <= ref ? ++j : --j) {
        for (col = k = 0, ref1 = result.cols; 0 <= ref1 ? k < ref1 : k > ref1; col = 0 <= ref1 ? ++k : --k) {
          rowVector = this.row(row);
          colVector = other.col(col);
          result.values[row][col] = rowVector.dot(colVector);
        }
      }
      return result;
    };

    return Matrix;

  })();

  RotationMatrix = (function(superClass) {
    extend(RotationMatrix, superClass);

    function RotationMatrix(axis, angle) {
      switch (axis) {
        case 0:
          RotationMatrix.__super__.constructor.call(this, [[1, 0, 0], [0, Math.cos(angle), -Math.sin(angle)], [0, Math.sin(angle), Math.cos(angle)]]);
          break;
        case 1:
          RotationMatrix.__super__.constructor.call(this, [[Math.cos(angle), 0, Math.sin(angle)], [0, 1, 0], [-Math.sin(angle), 0, Math.cos(angle)]]);
          break;
        case 2:
          RotationMatrix.__super__.constructor.call(this, [[Math.cos(angle), -Math.sin(angle), 0], [Math.sin(angle), Math.cos(angle), 0], [0, 0, 1]]);
          break;
        default:
          throw "Invalid axis";
      }
    }

    return RotationMatrix;

  })(Matrix);

  matrixToAxisAngle = function(matrix) {
    var X, X2, angle, axis, cross, diff1, diff2, x;
    x = new Vector([1, 0, 0]);
    X = matrix.col(0);
    X2 = matrix.multiply(matrix).col(0);
    diff1 = X.subtract(x);
    diff2 = X2.subtract(X);
    cross = diff1.cross(diff2);
    angle = Math.asin(cross.norm() / (diff1.norm() * diff2.norm()));
    axis = cross.normalize();
    return [axis, angle];
  };

  gyroToMatrix = function(rotations) {
    var angle, axis, j, len, matrix, rotation;
    matrix = Matrix.identity(3);
    for (axis = j = 0, len = rotations.length; j < len; axis = ++j) {
      angle = rotations[axis];
      rotation = new RotationMatrix(axis, angle);
      matrix = matrix.multiply(rotation);
    }
    return matrix;
  };

  main = function() {
    var angle, axis, prec, ref, ref1, scale, x, y, z;
    scale = id("app-deg").checked ? 180 / Math.PI : 1;
    x = strToFinite(id("app-x").value);
    y = strToFinite(id("app-y").value);
    z = strToFinite(id("app-z").value);
    if (!Number.isNaN(x) && !Number.isNaN(y) && !Number.isNaN(z)) {
      prec = 3;
      ref = matrixToAxisAngle(gyroToMatrix([x / scale, y / scale, z / scale])), axis = ref[0], angle = ref[1];
      ref1 = axis.values, x = ref1[0], y = ref1[1], z = ref1[2];
      id("app-axis").value = "(" + (round(x, prec)) + ", " + (round(y, prec)) + ", " + (round(z, prec)) + ")";
      return id("app-angle").value = String(round(scale * angle, prec));
    }
  };

  listen(id("app-rad, app-deg, app-x, app-y, app-z"), "change", main.bind(this));

}).call(this);
