async function processImage() {
  const form = new FormData(document.getElementById('imageForm'));

  const response = await fetch('http://localhost:3000/processImage', {
    method: 'POST',
    body: form,
  });

  const data = await response.json();
  console.log(data.colors);
}
