import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'index.html'),
                bibleangel: path.resolve(__dirname, 'projects/bibleangel/index.html'),
                cubeofagression: path.resolve(__dirname, 'projects/cubeofagression/index.html'),
                // add more projects as needed
            },
        },
    },
});
