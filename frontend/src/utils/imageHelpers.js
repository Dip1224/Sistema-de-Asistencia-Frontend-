export function fileToImage(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No se recibió la foto"));
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}
