import { useDocumentContext } from '../context/DocumentContext';
import { useSections } from './useSections';

export const useImageManagement = () => {
  const { 
    selectedSection, 
    selectedSectionId, 
    showNotification,
    swappingIndex,
    setSwappingIndex
  } = useDocumentContext();
  
  const { updateSection } = useSections();

const MAX_IMAGES = 9;

  const handleImageUpload = (file) => {
    if (!selectedSection || !file) return;

    const currentImages = selectedSection.images || [];
    
    // Check image limit
    if (currentImages.length >= MAX_IMAGES) {
      showNotification(`Maximum ${MAX_IMAGES} images allowed per section`);
      return;
    }

    if (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg') {
      const reader = new FileReader();
      reader.onloadend = () => {
        const figureLabel = String.fromCharCode(65 + currentImages.length);
        const newImage = {
          file,
          preview: reader.result,
          label: `Fig ${figureLabel}`
        };
        updateSection(selectedSectionId, 'images', [...currentImages, newImage]);

        // Show warning if section has only images
        if (!selectedSection.name?.trim() && !selectedSection.content?.trim()) {
          showNotification('⚠️ Warning: Add a heading - it\'s required for export');
        } else {
          showNotification('Image added');
        }
      };
      reader.readAsDataURL(file);
    } else {
      showNotification('Please upload PNG or JPG');
    }
  };


  const moveImage = (imageIndex, direction) => {
    if (!selectedSection) return;
    const images = [...selectedSection.images];
    const newIndex = direction === 'up' ? imageIndex - 1 : imageIndex + 1;

    if (newIndex < 0 || newIndex >= images.length) return;

    [images[imageIndex], images[newIndex]] = [images[newIndex], images[imageIndex]];

    // Relabel images
    images.forEach((img, idx) => {
      img.label = `Fig ${String.fromCharCode(65 + idx)}`;
    });

    updateSection(selectedSectionId, 'images', images);
  };

  const deleteImage = (imageIndex) => {
    if (!selectedSection) return;
    const images = selectedSection.images.filter((_, idx) => idx !== imageIndex);

    // Relabel remaining images
    images.forEach((img, idx) => {
      img.label = `Fig ${String.fromCharCode(65 + idx)}`;
    });

    updateSection(selectedSectionId, 'images', images);
    showNotification('Image removed');
  };

  const updateImageLabel = (imageIndex, newLabel) => {
    if (!selectedSection) return;
    const images = [...selectedSection.images];
    images[imageIndex].label = newLabel;
    updateSection(selectedSectionId, 'images', images);
    showNotification('Image label updated');
  };

  const swapImagesWithSpring = (idx) => {
    if (swappingIndex !== null) return; // prevent double clicks

    setSwappingIndex(idx);

    // swap AFTER spring animation completes
    setTimeout(() => {
      moveImage(idx, 'down');
      setSwappingIndex(null);
    }, 420); // must match duration
  };

  return { 
    handleImageUpload, 
    moveImage, 
    deleteImage, 
    updateImageLabel, 
    swapImagesWithSpring 
  };
};