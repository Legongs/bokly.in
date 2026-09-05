async function check() {
  try {
    const res = await fetch('http://localhost:3000');
    const html = await res.text();
    const matches = html.match(/<link[^>]+>/g) || [];
    console.log('Link tags in localhost:3000:');
    matches.filter(m => m.includes('icon') || m.includes('image')).forEach(m => console.log(m));
  } catch (err) {
    console.error('Error fetching localhost:3000:', err.message);
  }
}
check();
