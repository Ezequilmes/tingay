import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

class PhotoService {
  // Subir foto a Firebase Storage
  async uploadPhoto(file, userId, photoType, index = null) {
    try {
      // Validar que el archivo exista
      if (!file) {
        throw new Error('Archivo inválido');
      }
      
      // Crear referencia única para la foto
      const timestamp = Date.now();
      // Manejar tanto archivos File como Blob (de compresión)
      let fileExtension = 'jpg'; // extensión por defecto
      
      // Validación más robusta para el nombre del archivo
      if (file.name && typeof file.name === 'string' && file.name.includes('.')) {
        const parts = file.name.split('.');
        if (parts.length > 1) {
          fileExtension = parts[parts.length - 1] || 'jpg';
        }
      } else if (file.type && typeof file.type === 'string') {
        // Si es un blob, usar el tipo MIME para determinar la extensión
        const mimeToExt = {
          'image/jpeg': 'jpg',
          'image/jpg': 'jpg',
          'image/png': 'png',
          'image/webp': 'webp',
          'image/gif': 'gif'
        };
        fileExtension = mimeToExt[file.type.toLowerCase()] || 'jpg';
      }
      
      console.log('File info:', { name: file.name, type: file.type, extension: fileExtension });
      
      const fileName = `${photoType}${index !== null ? `_${index}` : ''}_${timestamp}.${fileExtension}`;
      const photoRef = ref(storage, `users/${userId}/photos/${fileName}`);
      
      // Configurar metadata para CORS
      const metadata = {
        contentType: file.type || 'image/jpeg',
        customMetadata: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range'
        }
      };
      
      // Subir archivo con metadata
      const snapshot = await uploadBytes(photoRef, file, metadata);
      
      // Obtener URL de descarga con token
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Agregar parámetros para evitar CORS
      const corsProxyURL = downloadURL + '&alt=media';
      
      return {
        success: true,
        url: corsProxyURL,
        path: snapshot.ref.fullPath
      };
    } catch (error) {
      console.error('Error uploading photo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Eliminar foto de Firebase Storage
  async deletePhoto(photoPath) {
    try {
      const photoRef = ref(storage, photoPath);
      await deleteObject(photoRef);
      
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting photo:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Subir múltiples fotos
  async uploadMultiplePhotos(files, userId, photoType) {
    const uploadPromises = files.map((file, index) => 
      this.uploadPhoto(file, userId, photoType, index)
    );
    
    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);
      
      return {
        success: failedUploads.length === 0,
        successfulUploads,
        failedUploads,
        urls: successfulUploads.map(upload => upload.url)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Comprimir imagen antes de subir (opcional)
  compressImage(file, maxWidth = 1200, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo aspect ratio
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convertir a blob
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // Validar archivo de imagen
  validateImageFile(file, maxSizeMB = 5) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de archivo no válido. Solo se permiten JPG, PNG y WebP.'
      };
    }
    
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `El archivo es demasiado grande. Máximo ${maxSizeMB}MB.`
      };
    }
    
    return { valid: true };
  }
}

export default new PhotoService();