import { Platform } from 'react-native';
import { Category } from '../app/types';

const getBaseUrl = () => {
  return Platform.OS === 'android' 
    ? 'http://10.0.2.2:5158' 
    : Platform.OS === 'ios'
      ? 'http://localhost:5158'
      : 'http://localhost:5158';
};

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/Categories`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
};

export const fetchCategoryById = async (id: number): Promise<Category> => {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/Categories/${id}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch category with id ${id}:`, error);
    throw error;
  }
};

export const updateCategory = async (category: Category): Promise<Category> => {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/Categories/${category.id}`;
    console.log('Updating category at URL:', url);
    console.log('With payload:', JSON.stringify(category));
    
    // Переконуємося, що відправляємо тільки потрібні дані у форматі, який очікує API
    const payload = {
      id: category.id,
      name: category.name,
      imageUrl: category.imageUrl
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }
    
    // Some APIs don't return content on POST, handle both cases
    let result;
    try {
      result = await response.json();
      console.log('Response JSON:', JSON.stringify(result));
    } catch (err) {
      console.log('No JSON response or empty response, returning original category');
      result = category;
    }
    
    return result;
  } catch (error) {
    console.error('Failed to update category:', error);
    throw error;
  }
};

export const deleteCategory = async (id: number): Promise<void> => {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/Categories/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
  } catch (error) {
    console.error(`Failed to delete category with id ${id}:`, error);
    throw error;
  }
};

export const createCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/Categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to create category:', error);
    throw error;
  }
};

// Додаємо альтернативний метод для оновлення категорій
export const editCategory = async (category: Category): Promise<Category> => {
  try {
    const baseUrl = getBaseUrl();
    // Спробуємо використати інший URL шлях для редагування
    const url = `${baseUrl}/api/Categories/Edit/${category.id}`;
    console.log('Editing category using URL:', url);
    console.log('With payload:', JSON.stringify(category));
    
    const payload = {
      id: category.id,
      name: category.name,
      imageUrl: category.imageUrl
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
    });
    
    console.log('Edit response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edit error response body:', errorText);
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }
    
    let result;
    try {
      result = await response.json();
      console.log('Edit response JSON:', JSON.stringify(result));
    } catch (err) {
      console.log('No JSON response from edit, returning original category');
      result = category;
    }
    
    return result;
  } catch (error) {
    console.error('Failed to edit category:', error);
    throw error;
  }
};

// Додаємо ще один метод для оновлення категорій через PATCH
export const patchCategory = async (category: Category): Promise<Category> => {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/Categories/${category.id}`;
    console.log('Patching category at URL:', url);
    console.log('With payload:', JSON.stringify(category));
    
    const payload = {
      id: category.id,
      name: category.name,
      imageUrl: category.imageUrl
    };
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
    });
    
    console.log('Patch response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Patch error response body:', errorText);
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }
    
    let result;
    try {
      result = await response.json();
      console.log('Patch response JSON:', JSON.stringify(result));
    } catch (err) {
      console.log('No JSON response from patch, returning original category');
      result = category;
    }
    
    return result;
  } catch (error) {
    console.error('Failed to patch category:', error);
    throw error;
  }
};

// Функція для перевірки, які HTTP методи доступні для категорій
export const checkCategoryApiMethods = async (): Promise<string[]> => {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/Categories/1`; // використовуємо тестовий ID
    
    console.log('Checking available HTTP methods for categories API...');
    
    // Надсилаємо OPTIONS запит для визначення доступних методів
    const response = await fetch(url, {
      method: 'OPTIONS',
    });
    
    // Перевіримо заголовок Allow, який повинен містити список дозволених методів
    const allowHeader = response.headers.get('Allow');
    console.log('Allow header:', allowHeader);
    
    if (allowHeader) {
      // Розбиваємо на масив методів
      const methods = allowHeader.split(',').map(method => method.trim());
      console.log('Available methods:', methods);
      return methods;
    }
    
    // Якщо немає заголовка Allow, спробуємо перевірити вручну основні методи
    const availableMethods = [];
    
    // Перевіряємо метод GET
    try {
      const getResponse = await fetch(url, { method: 'GET' });
      if (getResponse.ok || getResponse.status === 404) { 
        // 404 - це OK для перевірки, тому що означає що URL правильний, але ресурс не знайдено
        availableMethods.push('GET');
      }
    } catch (error) {
      console.log('GET not supported');
    }
    
    console.log('Available methods (manual check):', availableMethods);
    return availableMethods;
  } catch (error) {
    console.error('Failed to check API methods:', error);
    return [];
  }
};

// Додаємо метод для оновлення через параметри URL (GET запит)
export const updateCategoryViaQuery = async (category: Category): Promise<Category> => {
  try {
    const baseUrl = getBaseUrl();
    
    // Формуємо URL з параметрами для GET запиту
    const url = `${baseUrl}/api/Categories/Update?id=${category.id}&name=${encodeURIComponent(category.name)}&imageUrl=${encodeURIComponent(category.imageUrl)}`;
    
    console.log('Updating category via GET query URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('Update via query response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update via query error response body:', errorText);
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }
    
    let result;
    try {
      result = await response.json();
      console.log('Update via query response JSON:', JSON.stringify(result));
    } catch (err) {
      console.log('No JSON response from query update, returning original category');
      result = category;
    }
    
    return result;
  } catch (error) {
    console.error('Failed to update category via query:', error);
    throw error;
  }
};

// Додаємо метод оновлення через PUT з різними Content-Type
export const updateCategoryAlternative = async (category: Category): Promise<Category> => {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/Categories/${category.id}`;
    console.log('Trying alternative PUT with different content type:', url);
    
    // Використовуємо FormData замість JSON
    const formData = new FormData();
    formData.append('id', category.id.toString());
    formData.append('name', category.name);
    formData.append('imageUrl', category.imageUrl);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json'
        // Не додаємо Content-Type, щоб браузер автоматично додав правильний для FormData
      },
      body: formData,
    });
    
    console.log('Alternative PUT response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Alternative PUT error response body:', errorText);
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }
    
    let result;
    try {
      result = await response.json();
      console.log('Alternative PUT response JSON:', JSON.stringify(result));
    } catch (err) {
      console.log('No JSON response from alternative PUT, returning original category');
      result = category;
    }
    
    return result;
  } catch (error) {
    console.error('Failed to update category with alternative PUT:', error);
    throw error;
  }
};

// Додаємо метод для оновлення полів категорії окремо (по одному)
export const updateCategoryFields = async (category: Category): Promise<Category> => {
  try {
    const baseUrl = getBaseUrl();
    
    console.log('Trying to update category fields one by one');
    
    // Оновлюємо назву категорії
    const nameUrl = `${baseUrl}/api/Categories/UpdateName?id=${category.id}&name=${encodeURIComponent(category.name)}`;
    console.log('Updating name with URL:', nameUrl);
    
    const nameResponse = await fetch(nameUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('Name update response status:', nameResponse.status);
    
    if (!nameResponse.ok) {
      const errorText = await nameResponse.text();
      console.error('Name update error response body:', errorText);
      throw new Error(`Error updating name: ${nameResponse.status} - ${errorText}`);
    }
    
    // Оновлюємо URL зображення категорії
    const imageUrl = `${baseUrl}/api/Categories/UpdateImage?id=${category.id}&imageUrl=${encodeURIComponent(category.imageUrl)}`;
    console.log('Updating image URL with URL:', imageUrl);
    
    const imageResponse = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('Image URL update response status:', imageResponse.status);
    
    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('Image URL update error response body:', errorText);
      throw new Error(`Error updating image URL: ${imageResponse.status} - ${errorText}`);
    }
    
    // Якщо обидва запити успішні, повертаємо оновлену категорію
    return category;
  } catch (error) {
    console.error('Failed to update category fields:', error);
    throw error;
  }
};

// Додаємо функцію для тестування різних URL для категорій
export const scanCategoryEndpoints = async (): Promise<void> => {
  const baseUrl = getBaseUrl();
  const endpoints = [
    '/api/Categories',
    '/api/Categories/1',
    '/api/Categories/Edit/1',
    '/api/Categories/Update',
    '/api/Categories/Update/1',
    '/api/Categories/Edit',
    '/api/Categories/UpdateName',
    '/api/Categories/UpdateImage'
  ];
  
  const methods = ['GET', 'POST'];
  
  for (const endpoint of endpoints) {
    for (const method of methods) {
      try {
        console.log(`Testing ${method} ${endpoint}...`);
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: method
        });
        console.log(`${method} ${endpoint} - Status: ${response.status}`);
      } catch (error) {
        console.error(`Error testing ${method} ${endpoint}:`, error);
      }
    }
  }
  
  console.log('Endpoint scan complete');
};

// Додаємо метод для оновлення категорії через POST на основний URL
export const updateCategoryToRoot = async (category: Category): Promise<Category> => {
  try {
    const baseUrl = getBaseUrl();
    // Використовуємо основний URL категорій без ID
    const url = `${baseUrl}/api/Categories`;
    console.log('Updating category with POST to root URL:', url);
    console.log('With payload:', JSON.stringify(category));
    
    const payload = {
      id: category.id,
      name: category.name,
      imageUrl: category.imageUrl
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
    });
    
    console.log('Root URL POST response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Root URL POST error response body:', errorText);
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }
    
    let result;
    try {
      result = await response.json();
      console.log('Root URL POST response JSON:', JSON.stringify(result));
    } catch (err) {
      console.log('No JSON response from root URL POST, returning original category');
      result = category;
    }
    
    return result;
  } catch (error) {
    console.error('Failed to update category with root URL POST:', error);
    throw error;
  }
}; 