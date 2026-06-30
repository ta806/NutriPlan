class Filter {
  baseUrl = 'https://nutriplan-api.vercel.app/api';

  constructor(category = '', area = '', ingredient = '', limit = 25) {
    this.category = category;
    this.area = area;
    this.ingredient = ingredient;
    this.limit = limit;
  }

  async filterMeals() {
    const params = new URLSearchParams();

    if (this.category) params.append('category', this.category);
    if (this.area) params.append('area', this.area);
    if (this.ingredient) params.append('ingredient', this.ingredient);
    if (this.limit) params.append('limit', this.limit);

    const url = `${this.baseUrl}/meals/filter${
      params.toString() ? '?' + params.toString() : ''
    }`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      return data.results;
    } catch (error) {
      console.error('Filter fetch failed:', error);
      throw error;
    }
  }
}

export default Filter;
