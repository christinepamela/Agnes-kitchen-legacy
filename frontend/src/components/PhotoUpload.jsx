import React, { useState } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const PhotoUpload = ({ recipeId, onPhotoUploadComplete }) => {
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (uploadedPhotos.length + files.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }

    setIsUploading(true);
    try {
      for (let file of files) {
        const storageRef = ref(storage, `recipes/${recipeId}/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setUploadedPhotos(prev => [...prev, { id: Date.now(), url, name: file.name }]);
      }
      onPhotoUploadComplete(uploadedPhotos);
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Error uploading photos');
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (photoId) => {
    const updated = uploadedPhotos.filter(p => p.id !== photoId);
    setUploadedPhotos(updated);
    onPhotoUploadComplete(updated);
  };

  return (
    <div className="photo-upload">
      <div className="form-group">
        <label>📸 Upload Photos (Max 5)</label>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
          Photos uploaded: {uploadedPhotos.length}/5
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handlePhotoSelect}
          disabled={isUploading || uploadedPhotos.length >= 5}
          style={{ padding: '0.5rem', cursor: uploadedPhotos.length >= 5 ? 'not-allowed' : 'pointer' }}
        />
      </div>

      {uploadedPhotos.length > 0 && (
        <div className="photo-gallery">
          <h4>Uploaded Photos:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {uploadedPhotos.map(photo => (
              <div key={photo.id} style={{ position: 'relative', borderRadius: '4px', overflow: 'hidden' }}>
                <img src={photo.url} alt={photo.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="btn btn-danger"
                  style={{ position: 'absolute', top: '5px', right: '5px', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;