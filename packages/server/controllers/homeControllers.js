import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// export function getHome(req, res) {
//   res.send('Hello World!')
// }
// Serve the static html file with the react JS bundle
export function getHome(req, res) {
  res.sendFile(join(__dirname, "../public", "index.html"));
};

