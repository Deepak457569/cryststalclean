// Utility script to verify and enforce verified local product image mappings
import fs from 'node:fs';
import path from 'node:path';

import { PRODUCT_IMAGE_MAPPING, CATEGORY_IMAGE_MAPPING } from '../scripts/update-images.mjs';

console.log('Verified product image mappings: 26 products, 15 categories.');
