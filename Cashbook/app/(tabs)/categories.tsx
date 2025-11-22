import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { categoryApi, Category } from '../../lib/api';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense' | 'investment',
    subCategory: 'need' as 'need' | 'want' | 'investment',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryApi.getCategories();
      console.log('Fetched categories:', data);
      console.log('Categories with missing type:', data.filter((cat: any) => !cat.type));
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load categories',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter a category name');
      return;
    }

    try {
      if (editingCategory) {
        await categoryApi.updateCategory(editingCategory._id, formData);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Category updated successfully',
        });
      } else {
        await categoryApi.createCategory(formData);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Category created successfully',
        });
      }
      setShowAddModal(false);
      setEditingCategory(null);
      setFormData({ name: '', type: 'expense', subCategory: 'need' });
      
      // Fetch categories to update the list
      await fetchCategories();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to save category',
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, type: category.type, subCategory: category.subCategory });
    setShowAddModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await categoryApi.deleteCategory(id);
              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Category deleted',
              });
              fetchCategories();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.response?.data?.message || 'Failed to delete category',
              });
            }
          },
        },
      ]
    );
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete All Categories',
      'Are you sure you want to delete all categories? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all(
                categories.map((cat) => categoryApi.deleteCategory(cat._id))
              );
              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'All categories deleted successfully',
              });
              fetchCategories();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.response?.data?.message || 'Failed to delete categories',
              });
            }
          },
        },
      ]
    );
  };

  const getSubCategoryColor = (subCategory: string) => {
    switch (subCategory) {
      case 'need':
        return '#EF4444';
      case 'want':
        return '#F59E0B';
      case 'investment':
        return '#3B82F6';
      default:
        return '#888';
    }
  };

  const groupedCategories = categories.reduce(
    (acc, cat) => {
      // Fallback to 'expense' if type is missing (for backward compatibility)
      const type = cat.type || 'expense';
      const key = `${type}-${cat.subCategory}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(cat);
      return acc;
    },
    {} as Record<string, Category[]>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <View style={styles.headerActions}>
          {categories.length > 0 && (
            <Pressable
              style={styles.deleteAllButton}
              onPress={handleDeleteAll}
            >
              <Trash2 color="#EF4444" size={20} />
            </Pressable>
          )}
          <Pressable
            style={styles.addButton}
            onPress={() => {
              setEditingCategory(null);
              setFormData({ name: '', type: 'expense', subCategory: 'need' });
              setShowAddModal(true);
            }}
          >
            <Plus color="#fff" size={20} />
          </Pressable>
        </View>
      </View>

      {/* Categories List */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#60A5FA" />
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.centerContainer}>
          <FolderOpen color="#888" size={48} />
          <Text style={styles.emptyText}>No categories yet</Text>
          <Text style={styles.emptySubtext}>
            Create a category to organize your transactions
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {Object.keys(groupedCategories).length === 0 ? (
            <View style={styles.centerContainer}>
              <FolderOpen color="#888" size={48} />
              <Text style={styles.emptyText}>No categories found</Text>
              <Text style={styles.emptySubtext}>
                Categories exist but may be loading. Pull to refresh.
              </Text>
            </View>
          ) : (
            <>
              {(['income', 'expense', 'investment'] as const).map((catType) => {
                return (
                  <View key={catType}>
                    <View style={styles.typeSection}>
                      <Text style={styles.typeSectionTitle}>
                        {catType.charAt(0).toUpperCase() + catType.slice(1)} Categories
                      </Text>
                    </View>
                    {(['need', 'want', 'investment'] as const).map((subCat) => {
                      const key = `${catType}-${subCat}`;
                      const items = groupedCategories[key] || [];
                      if (items.length === 0) return null;

                      return (
                        <View key={key} style={styles.section}>
                          <View style={styles.sectionHeader}>
                            <View
                              style={[
                                styles.sectionIndicator,
                                { backgroundColor: getSubCategoryColor(subCat) },
                              ]}
                            />
                            <Text style={styles.sectionTitle}>
                              {subCat.charAt(0).toUpperCase() + subCat.slice(1)}
                            </Text>
                            <Text style={styles.sectionCount}>({items.length})</Text>
                          </View>

                          {items.map((category) => (
                            <View key={category._id} style={styles.categoryCard}>
                              <View style={styles.categoryInfo}>
                                <Text style={styles.categoryName}>{category.name}</Text>
                                {category.monthlyBudgets.length > 0 && (
                                  <Text style={styles.budgetInfo}>
                                    {category.monthlyBudgets.length} budget(s) set
                                  </Text>
                                )}
                              </View>

                              <View style={styles.categoryActions}>
                                <Pressable
                                  style={styles.actionButton}
                                  onPress={() => handleEdit(category)}
                                >
                                  <Edit color="#60A5FA" size={18} />
                                </Pressable>
                                <Pressable
                                  style={styles.actionButton}
                                  onPress={() => handleDelete(category._id, category.name)}
                                >
                                  <Trash2 color="#EF4444" size={18} />
                                </Pressable>
                              </View>
                            </View>
                          ))}
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCategory ? 'Edit Category' : 'New Category'}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, name: text }))
                }
                placeholder="Enter category name"
                placeholderTextColor="#888"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category Type</Text>
              <View style={styles.typeContainer}>
                {(['income', 'expense', 'investment'] as const).map((catType) => (
                  <Pressable
                    key={catType}
                    style={[
                      styles.typeButton,
                      formData.type === catType && styles.typeButtonActive,
                    ]}
                    onPress={() =>
                      setFormData((prev) => ({ ...prev, type: catType }))
                    }
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        formData.type === catType && styles.typeButtonTextActive,
                      ]}
                    >
                      {catType.charAt(0).toUpperCase() + catType.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Subcategory</Text>
              <View style={styles.typeContainer}>
                {(['need', 'want', 'investment'] as const).map((type) => (
                  <Pressable
                    key={type}
                    style={[
                      styles.typeButton,
                      formData.subCategory === type && styles.typeButtonActive,
                    ]}
                    onPress={() =>
                      setFormData((prev) => ({ ...prev, subCategory: type }))
                    }
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        formData.subCategory === type && styles.typeButtonTextActive,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setEditingCategory(null);
                  setFormData({ name: '', type: 'expense', subCategory: 'need' });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.saveButtonText}>
                  {editingCategory ? 'Update' : 'Create'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  deleteAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  sectionCount: {
    color: '#888',
    fontSize: 14,
  },
  typeSection: {
    marginTop: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  typeSectionTitle: {
    color: '#60A5FA',
    fontSize: 18,
    fontWeight: '700',
  },
  categoryCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  budgetInfo: {
    color: '#888',
    fontSize: 12,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#aaa',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  typeButtonActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#60A5FA',
  },
  typeButtonText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#2A2A2A',
  },
  cancelButtonText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

