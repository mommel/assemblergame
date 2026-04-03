import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const mapEditorPlugin = () => ({
  name: 'map-editor',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/api/save-map' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            let out = '{\n';
            for (let x = 0; x < 100; x++) {
              out += `  "x${x}": { `;
              const cols = [];
              for (let y = 0; y < 100; y++) {
                cols.push(`"y${y}": "${data.grid[y][x]}"`);
              }
              out += cols.join(', ');
              out += ` }${x < 99 || data.bosses ? ',' : ''}\n`;
            }
            if (data.bosses) {
              out += `  ,"bosses": ${JSON.stringify(data.bosses, null, 2)}\n`;
            }
            out += '}\n';
            fs.writeFileSync(path.resolve('src/engine/world.json'), out);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      } else {
        next();
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mapEditorPlugin()],
})
