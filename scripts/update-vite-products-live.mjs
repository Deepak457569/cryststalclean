import fs from 'fs';
import path from 'path';

const vitePath = path.resolve('vite.config.ts');
let viteContent = fs.readFileSync(vitePath, 'utf8');

const productsArrayStart = viteContent.indexOf('let products = [');
const productsArrayEnd = viteContent.indexOf('let accessCodes = [');

if (productsArrayStart !== -1 && productsArrayEnd !== -1) {
  let productsPart = viteContent.substring(productsArrayStart, productsArrayEnd);
  const countReplaced = (productsPart.match(/is_active:\s*0/g) || []).length;
  productsPart = productsPart.replace(/is_active:\s*0/g, 'is_active: 1');
  viteContent = viteContent.substring(0, productsArrayStart) + productsPart + viteContent.substring(productsArrayEnd);
  console.log(`Replaced ${countReplaced} occurrences of is_active: 0 in vite.config.ts products array`);
  fs.writeFileSync(vitePath, viteContent, 'utf8');
} else {
  console.error('Could not find products array bounds');
}
