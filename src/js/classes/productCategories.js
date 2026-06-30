class ProductCategories {
  baseUrl = 'https://nutriplan-api.vercel.app/api';

  constructor(page = 1, limit = 50) {
    this.page = page;
    this.limit = limit;
  }

  async getProductCategories() {
    const params = new URLSearchParams();

    if (this.page) params.append('page', this.page);
    if (this.limit) params.append('limit', this.limit);

    const url = `${this.baseUrl}/products/categories${
      params.toString() ? '?' + params.toString() : ''
    }`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      return data.results;
    } catch (error) {
      console.error('Product categories fetch failed:', error);
      throw error;
    }
  }

  async getProductByCategory(category) {
    const url = `${this.baseUrl}/products/category/${category}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      console.log(data);
      console.log(url);

      if (!data) {
        console.error('No categories returned from API');
        throw new Error('No categories returned from API');
      }
      console.log(data.results);

      return data.results;
    } catch (error) {
      console.error('Categories fetch failed:', error);
      throw error;
    }
  }
}

export default ProductCategories;
