---
---

"use strict";

class Vector
    @empty: (n) ->
        new Vector((null for [0...n]))

    constructor: (@values) ->
        @dimension = @values.length

    isDefinedWith: (other) ->
        defined = other instanceof Vector and @dimension == other.dimension
        throw "Operation not defined" if not defined

    add: (other) ->
        @isDefinedWith(other)
        result = Vector.empty(@dimension)
        for i in [0...result.dimension]
            result.values[i] = @values[i] + other.values[i]
        result

    scalarProduct: (scalar) ->
        result = Vector.empty(@dimension)
        for i in [0...result.dimension]
            result.values[i] = scalar*@values[i]
        result

    subtract: (other) ->
        @add(other.scalarProduct(-1))

    dot: (other) ->
        @isDefinedWith(other)
        result = 0
        for i in [0...@dimension]
            result += @values[i]*other.values[i]
        result

    norm: ->
        Math.pow(@dot(@), 0.5)

    normalize: ->
        result = Vector.empty(@dimension)
        norm = @norm()
        for i in [0...result.dimension]
            result.values[i] = @values[i]/norm
        result

    cross: (other) ->
        @isDefinedWith(other)
        result = Vector.empty(@dimension)
        for i in [0...result.dimension]
            index1 = (i + 1) % @dimension
            index2 = (i + 2) % @dimension
            result.values[i] = @values[index1]*other.values[index2] - other.values[index1]*@values[index2]
        result

class Matrix
    @identity: (n) ->
        result = Matrix.empty(n, n)
        for row in [0...result.rows]
            for col in [0...result.cols]
                result.values[row][col] = if (row == col) then 1 else 0
        result

    @empty: (rows, cols) ->
        new Matrix(((null for [0...cols]) for [0...rows]))

    constructor: (@values) ->
        @rows = @values.length
        @cols = @values[0].length

    row: (n) ->
        new Vector(@values[n])

    col: (n) ->
        new Vector((@values[row][n] for row in [0...@rows]))

    multiply: (other) ->
        defined = other instanceof Matrix and @cols == other.rows
        throw "Operation not defined" if not defined
        result = Matrix.empty(@rows, other.cols)
        for row in [0...result.rows]
            for col in [0...result.cols]
                rowVector = @row(row)
                colVector = other.col(col)
                result.values[row][col] = rowVector.dot(colVector)
        result

class RotationMatrix extends Matrix
    constructor: (axis, angle) ->
        switch axis
            when 0
                super [[1, 0, 0]
                       [0, Math.cos(angle), -Math.sin(angle)]
                       [0, Math.sin(angle), Math.cos(angle)]]

            when 1
                super [[Math.cos(angle), 0, Math.sin(angle)]
                       [0, 1, 0]
                       [-Math.sin(angle), 0, Math.cos(angle)]]

            when 2
                super [[Math.cos(angle), -Math.sin(angle), 0]
                       [Math.sin(angle), Math.cos(angle), 0]
                       [0, 0, 1]]
            
            else throw "Invalid axis"

matrixToAxisAngle = (matrix) ->
    x = new Vector [1, 0, 0]
    X = matrix.col(0)
    X2 = matrix.multiply(matrix).col(0)
    diff1 = X.subtract(x)
    diff2 = X2.subtract(X)
    cross = diff1.cross(diff2)
    angle = Math.asin(cross.norm() / (diff1.norm()*diff2.norm()))
    axis = cross.normalize()
    [axis, angle]

gyroToMatrix = (rotations) ->
    matrix = Matrix.identity(3)
    for angle, axis in rotations
        rotation = new RotationMatrix(axis, angle)
        matrix = matrix.multiply(rotation)
    matrix

main = () ->
    scale = if id("app-deg").checked then 180/Math.PI else 1
    x = strToFinite(id("app-x").value)
    y = strToFinite(id("app-y").value)
    z = strToFinite(id("app-z").value)
    if (!Number.isNaN(x) and !Number.isNaN(y) and !Number.isNaN(z))
        prec = 3
        [axis, angle] = matrixToAxisAngle(gyroToMatrix([x/scale, y/scale, z/scale]))
        [x, y, z] = axis.values
        id("app-axis").value = "(#{ round(x, prec) }, #{ round(y, prec) }, #{ round(z, prec) })"
        id("app-angle").value = String(round((scale * angle), prec))

listen(id("app-rad, app-deg, app-x, app-y, app-z"), "change", main.bind(this))