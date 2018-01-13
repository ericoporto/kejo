import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: './src/kejo.js',
  output: {
    file: './dist/kejo.js',
    format: 'iife'
  },
  name: 'kejo',
  plugins: [
    resolve(),
    commonjs()
  ]
};
