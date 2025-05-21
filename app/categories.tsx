import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from '../components/Toast';
import { checkCategoryApiMethods, fetchCategories, scanCategoryEndpoints } from '../services/categoryService';
import { Category } from './types';

export default function CategoriesScreen() {
  const params = useLocalSearchParams<{
    updated: string;
    updatedCategoryId: string;
    updatedCategoryName: string;
    updatedCategoryImageUrl: string;
  }>();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info' as 'success' | 'error' | 'info'
  });
  
  // Відстежуємо стан активності додатку
  const appState = React.useRef(AppState.currentState);
  
  // Зберігаємо попередній стан для виявлення змін
  const [prevCategories, setPrevCategories] = useState<Category[]>([]);

  // Використовуємо useEffect для обробки параметрів оновлення
  useEffect(() => {
    if (params.updated === 'true' && params.updatedCategoryId) {
      console.log('Received update params:', params);
      
      // Використовуємо функцію оновлення стану для доступу до актуальних даних
      setCategories(currentCategories => {
        const updatedCategories = currentCategories.map(cat => 
          cat.id.toString() === params.updatedCategoryId 
            ? {
                ...cat,
                name: params.updatedCategoryName || cat.name,
                imageUrl: params.updatedCategoryImageUrl || cat.imageUrl
              }
            : cat
        );
        
        console.log('Categories updated locally:');
        updatedCategories.forEach(cat => {
          if (cat.id.toString() === params.updatedCategoryId) {
            console.log(`Category ${cat.id} updated to:`, cat);
          }
        });
        
        // Показуємо тост про успішне оновлення
        setToast({
          visible: true,
          message: 'Категорію успішно оновлено',
          type: 'success'
        });
        
        return updatedCategories;
      });
      
      // Очищення URL параметрів після їх обробки, щоб уникнути повторної обробки
      setTimeout(() => {
        router.setParams({});
      }, 500);
    }
  }, [params.updated, params.updatedCategoryId]);

  // Використовуємо useEffect для завантаження даних при монтуванні
  useEffect(() => {
    console.log('Categories screen mounted, loading categories...');
    loadCategories(true);
    
    // Перевіряємо доступні методи API
    checkCategoryApiMethods().then(methods => {
      console.log('API supports these methods:', methods);
    }).catch(err => {
      console.error('Failed to check API methods:', err);
    });
    
    // Виконуємо сканування доступних ендпоінтів
    scanCategoryEndpoints().then(() => {
      console.log('API endpoint scan complete');
    }).catch(err => {
      console.error('Failed to scan API endpoints:', err);
    });
    
    // Додаємо слухач для зміни стану додатку
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground, refreshing categories...');
        loadCategories(true);
      }
      
      appState.current = nextAppState;
    });

    // Створюємо інтервал для періодичного оновлення даних
    // Це автоматично оновить список категорій, якщо вони були змінені
    const intervalId = setInterval(() => {
      console.log('Periodic refresh of categories...');
      loadCategories(true);
    }, 5000); // Оновлення кожні 5 секунд

    return () => {
      subscription.remove();
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    // Порівнюємо поточні категорії з попередніми для виявлення змін
    if (prevCategories.length > 0 && categories.length > 0) {
      const hasChanges = categories.some((cat, idx) => {
        if (idx >= prevCategories.length) return true;
        const prevCat = prevCategories.find(p => p.id === cat.id);
        if (!prevCat) return true;
        return cat.name !== prevCat.name || cat.imageUrl !== prevCat.imageUrl;
      });
      
      if (hasChanges) {
        setToast({
          visible: true,
          message: 'Категорії оновлено успішно',
          type: 'success'
        });
      }
    }
    
    // Оновлюємо попередній стан
    setPrevCategories(categories);
  }, [categories]);

  const loadCategories = async (silent = false) => {
    try {
      if (!silent) setRefreshing(true);
      if (silent) setLoading(true);
      
      console.log('Fetching categories from API...');
      const data = await fetchCategories();
      console.log(`Fetched ${data.length} categories`);
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories. Please try again later.');
      setToast({
        visible: true,
        message: 'Помилка завантаження категорій',
        type: 'error'
      });
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadCategories(false);
  };

  const handleEditCategory = (categoryId: number) => {
    router.push(`/editCategory?id=${categoryId}`);
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Функція для оновлення категорії прямо з екрану категорій
  const updateCategoryDirectly = async (categoryId: number, newName: string) => {
    try {
      setLoading(true);
      const category = categories.find(c => c.id === categoryId);
      
      if (!category) {
        console.error(`Category with id ${categoryId} not found`);
        setToast({
          visible: true,
          message: 'Помилка: категорію не знайдено',
          type: 'error'
        });
        return;
      }
      
      const baseUrl = Platform.OS === 'android' 
        ? 'http://10.0.2.2:5158' 
        : Platform.OS === 'ios'
          ? 'http://localhost:5158'
          : 'http://localhost:5158';
      
      // Створюємо об'єкт з оновленою назвою
      const updatedCategory = {
        ...category,
        name: newName
      };
      
      // Відправляємо запит на /api/categories з методом POST
      const response = await fetch(`${baseUrl}/api/Categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCategory),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Оновлюємо стан
      loadCategories(true);
      
      setToast({
        visible: true,
        message: 'Категорію успішно оновлено',
        type: 'success'
      });
    } catch (err) {
      console.error('Failed to update category directly:', err);
      setToast({
        visible: true,
        message: 'Помилка оновлення категорії',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View style={styles.categoryItem}>
      <TouchableOpacity 
        style={styles.categoryContent}
        onPress={() => router.push(`/category/${item.id}`)}
        accessible={true}
        accessibilityLabel={`Category ${item.name}`}
        accessibilityRole="button"
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.categoryImage}
          resizeMode="cover"
          accessible={true}
          accessibilityLabel={`Image for ${item.name}`}
        />
        <View style={styles.categoryTextContainer}>
          <Text style={styles.categoryName}>{item.name}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => handleEditCategory(item.id)}
        accessible={true}
        accessibilityLabel={`Edit ${item.name}`}
        accessibilityRole="button"
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => loadCategories(true)}
          accessible={true}
          accessibilityLabel="Retry loading categories"
          accessibilityRole="button"
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Web-specific accessibility props
  const webAccessibilityProps = Platform.OS === 'web' ? {
    accessibilityLiveRegion: 'polite' as 'polite',
    'aria-live': 'polite',
    focusable: false,
  } : {};

  return (
    <SafeAreaView style={styles.container} {...webAccessibilityProps}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={() => loadCategories(false)}
          accessible={true}
          accessibilityLabel="Refresh categories"
          accessibilityRole="button"
        >
          <Feather name="refresh-cw" size={20} color="#3498db" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCategoryItem}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        accessible={true}
        accessibilityRole="list"
        accessibilityLabel="Categories list"
      />
      <Toast 
        visible={toast.visible} 
        message={toast.message} 
        type={toast.type} 
        onHide={hideToast} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  categoryItem: {
    flex: 1,
    margin: 8,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  categoryContent: {
    width: '100%',
  },
  categoryImage: {
    width: '100%',
    height: 150,
  },
  categoryTextContainer: {
    padding: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#3498db',
    padding: 8,
    alignItems: 'center',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '500',
  },
}); 