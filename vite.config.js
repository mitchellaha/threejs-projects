import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
                bibleangel: path.resolve(__dirname, 'projects/bibleangel/index.html'),
                cubeofaggression: path.resolve(__dirname, 'projects/cubeofaggression/index.html'),
                mirrortest: path.resolve(__dirname, 'projects/mirrortest/index.html'),
                tunnelvision: path.resolve(__dirname, 'projects/tunnelvision/index.html'),
                // add more projects as needed
            },
        },
    },
});
