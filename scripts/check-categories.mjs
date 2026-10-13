async function test() {
  const res = await fetch('http://localhost:5173/api/categories');
  const data = await res.json();
  console.log('Category Image Status Report:');
  console.log('------------------------------------------------------------------------------------------------------');
  for (const cat of data.categories) {
    const imgRes = await fetch('http://localhost:5173' + cat.image_url);
    const contentType = imgRes.headers.get('content-type');
    console.log(`${cat.name.padEnd(38)} | ${cat.image_url.padEnd(38)} | HTTP ${imgRes.status} (${contentType})`);
  }
}
test();
