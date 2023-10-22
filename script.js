async function processImage() {
  const fileInput = document.getElementById('fileInput');
  const colorCountInput = document.getElementById('colorCount').value;
  const dimensionInput = document.getElementById('dimension').value;

  const formData = new FormData();
  formData.append('image', fileInput.files[0]);
  formData.append('colorCount', colorCountInput);
  formData.append('dimension', dimensionInput);

  const response = await fetch('http://localhost:3000/processImage', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  // Display color palette
  const paletteDiv = document.getElementsByClassName('palette')[0];
  paletteDiv.innerHTML = '';
  result.colors.forEach((color) => {
    const colorDiv = document.createElement('div');
    colorDiv.className = 'color-box'
    colorDiv.style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    paletteDiv.appendChild(colorDiv);
  });

  // Display the new image
  const newImageElement = document.getElementById('newImage');
  newImageElement.src = `data:image/png;base64,${result.newImage}`;
}

