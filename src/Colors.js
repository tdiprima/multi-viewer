const colors = function () {
  getColor(num) = function {

      let rtnColor

      switch (num) {
        case 1:
          // light blue, #a6cee3
          rtnColor = [166, 206, 227]
          break
        case 2:
          // strong blue, #1f78b4
          rtnColor = [31, 120, 180]
          break
        case 3:
          // light green, #b2df8a
          rtnColor = [178, 223, 138]
          break
        case 4:
          // green, #33a02c
          rtnColor = [51, 160, 44]
          break
        case 5:
          // pink, #fb9a99
          rtnColor = [251, 154, 153]
          break
        case 6:
          // red, #e31a1c
          rtnColor = [227, 26, 28]
          break
        case 7:
          // light orange, #fdbf6f
          rtnColor = [253, 191, 111]
          break
        case 8:
          // orange, #ff7f00
          rtnColor = [255, 127, 0]
          break
        case 9:
          // light violet, #cab2d6
          rtnColor = [202, 178, 214]
          break
        case 10:
          // violet, #6a3d9a
          rtnColor = [106, 61, 154]
          break
        case 11:
          // light yellow, #ffff99
          rtnColor = [255, 255, 153]
          break;
        case 12:
          // sienna, #b15928
          rtnColor = [177, 89, 40]
          break
        default:
          // green
          rtnColor = [0, 255, 0]
      }
      return rtnColor

    }
}
