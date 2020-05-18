# date-expressions-v4

![Node.js CI](https://github.com/TheTeamJ/date-expressions-v4/workflows/Node.js%20CI/badge.svg)

https://scrapbox.io/teamj/date-expressions_(v4)

## Usage
```js
const DateExp = require('@daiiz/date-expressions')

const dateExp = new DateExp('去年の8月', 'Asia/Tokyo')
const ranges = dateExp.resolve().dateRanges
// [
//   [ 2019-07-31T15:00:00.000Z, 2019-08-31T14:59:59.999Z ]
// ]
```

### Examples
- [Absolute expressions](https://github.com/TheTeamJ/date-expressions-v4/blob/master/test/absolute.js)

## Dev: Run examples
```
$ TZ=UTC DEBUG=* node src/examples.js
```

## Dev: test
```
$ npm run test:mocha
```
