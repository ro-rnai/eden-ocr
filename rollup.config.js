import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/index.js',
        format: 'iife'
    },
    plugins: [
        terser(),
        copy({
            targets: [
                {
                    src: 'index.html', dest: 'dist'
                },
            ]
        })
    ]
}
