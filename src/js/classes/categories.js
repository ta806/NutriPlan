class Categories {
  baseUrl = 'https://nutriplan-api.vercel.app/api';

  async getCategories() {
    const url = `${this.baseUrl}/meals/categories`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!data) {
        console.error('No categories returned from API');
        throw new Error('No categories returned from API');
      }

      const halalCategories = data.results.filter(cat => cat.name !== 'Pork');

      return halalCategories;
    } catch (error) {
      console.error('Categories fetch failed:', error);
      throw error;
    }
  }


}

export default Categories;
