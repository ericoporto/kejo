import {KeJo} from '../src/kejo'

// test utility
function tryConstructKeJo() {
  var kejo = new KeJo
  var mapExists = kejo.map.toString()=="[object Object]"
  return {mapExists}
}

test('instance a kejo singleton', () => {
  var {mapExists} = tryConstructKeJo()
  expect(mapExists).toBe(true)
})
