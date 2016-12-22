(function() {
  "use strict";
  var Matrix, Rotate, Vector, gyroToMatrix, matrixToAxisAngle;

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

  Rotate = (function() {
    function Rotate() {}

    Rotate.x = function(angle) {
      return new Matrix([[1, 0, 0], [0, Math.cos(angle), -Math.sin(angle)], [0, Math.sin(angle), Math.cos(angle)]]);
    };

    Rotate.y = function(angle) {
      return new Matrix([[Math.cos(angle), 0, Math.sin(angle)], [0, 1, 0], [-Math.sin(angle), 0, Math.cos(angle)]]);
    };

    Rotate.z = function(angle) {
      return new Matrix([[Math.cos(angle), -Math.sin(angle), 0], [Math.sin(angle), Math.cos(angle), 0], [0, 0, 1]]);
    };

    return Rotate;

  })();

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
    var angle, axis, j, len, matrix, ref, rotation;
    matrix = Matrix.identity(3);
    for (j = 0, len = rotations.length; j < len; j++) {
      ref = rotations[j], axis = ref[0], angle = ref[1];
      rotation = Rotate[axis](angle);
      matrix = matrix.multiply(rotation);
    }
    return matrix;
  };

}).call(this);
