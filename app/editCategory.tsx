import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { fetchCategoryById } from '../services/categoryService';
import { Category } from './types';

// Отримуємо список категорій через GET - це працює
const getCategories = async () => {
  const baseUrl = Platform.OS === 'android' 
    ? 'http://10.0.2.2:5158' 
    : Platform.OS === 'ios'
      ? 'http://localhost:5158'
      : 'http://localhost:5158';
  
  const response = await fetch(`${baseUrl}/api/Categories`);
  
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  
  return await response.json();
};

export default function EditCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadCategory(parseInt(id));
    } else {
      setLoading(false);
      setError('Category ID is missing');
    }
  }, [id]);

  const loadCategory = async (categoryId: number) => {
    try {
      setLoading(true);
      const data = await fetchCategoryById(categoryId);
      setCategory(data);
      setName(data.name);
      setImageUrl(data.imageUrl);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch category:', err);
      setError('Failed to load category. Please try again later.');
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!category) return;
    
    if (!name.trim()) {
      Alert.alert('Error', 'Category name cannot be empty');
      return;
    }

    if (!imageUrl.trim()) {
      Alert.alert('Error', 'Image URL cannot be empty');
      return;
    }

    try {
      setUpdating(true);
      
      // Перевірка, чи дані змінились
      const nameChanged = name !== category.name;
      const imageUrlChanged = imageUrl !== category.imageUrl;
      
      // Якщо нічого не змінилось, просто повертаємось
      if (!nameChanged && !imageUrlChanged) {
        console.log('No changes detected, returning to previous screen');
        router.back();
        return;
      }
      
      console.log('Returning to categories screen with updated data');
      
      // Оскільки сервер не приймає PUT/POST запити для оновлення категорій,
      // ми просто повертаємося назад і передаємо дані для оновлення на екрані категорій
      router.replace({
        pathname: '/categories',
        params: {
          updated: 'true',
          updatedCategoryId: category.id.toString(),
          updatedCategoryName: name,
          updatedCategoryImageUrl: imageUrl,
          timestamp: Date.now().toString() // Додаємо часову мітку для уникнення кешування
        }
      });
    } catch (err) {
      console.error('Failed to update category:', err);
      Alert.alert('Error', 'Failed to update category. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Web-specific accessibility props
  const webAccessibilityProps = Platform.OS === 'web' ? {
    accessibilityLiveRegion: 'polite' as 'polite',
  } : {};

  if (loading) {
    return (
      <View style={styles.centered} {...webAccessibilityProps}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered} {...webAccessibilityProps}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.back()}
          accessible={true}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      {...webAccessibilityProps}
    >
      <ScrollView 
        style={styles.scrollView}
        accessible={true}
        accessibilityRole="scrollbar"
      >
        <Text style={styles.title}>Edit Category</Text>
        
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.previewImage}
            resizeMode="cover"
            accessible={true}
            accessibilityLabel={`Preview image for category ${name}`}
          />
        ) : (
          <View 
            style={styles.imagePlaceholder}
            accessible={true}
            accessibilityLabel="No image preview available"
          >
            <Text style={styles.placeholderText}>No Image Preview</Text>
          </View>
        )}
        
        <View style={styles.formContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Category Name"
            accessible={true}
            accessibilityLabel="Category name input"
            accessibilityRole="text"
          />
          
          <Text style={styles.label}>Image URL</Text>
          <TextInput
            style={styles.input}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="Image URL"
            autoCapitalize="none"
            accessible={true}
            accessibilityLabel="Image URL input"
            accessibilityRole="text"
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={() => router.back()}
              accessible={true}
              accessibilityLabel="Cancel and go back"
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, updating && styles.disabledButton]} 
              onPress={handleUpdate}
              disabled={updating}
              accessible={true}
              accessibilityLabel={updating ? "Updating category" : "Update category"}
              accessibilityRole="button"
              accessibilityState={{ disabled: updating }}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Update</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    backgroundColor: '#3498db',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
}); 