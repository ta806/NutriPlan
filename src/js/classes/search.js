class Search {
  baseUrl = 'https://nutriplan-api.vercel.app/api';

  constructor(searchTerm = '', pageNumber = 1, limit = 25) {
    this.searchTerm = searchTerm;
    this.pageNumber = pageNumber;
    this.limit = limit;
  }

  async searchMealsByName() {
    const params = new URLSearchParams();

    if (this.searchTerm) params.append('q', this.searchTerm);
    if (this.pageNumber) params.append('page', this.pageNumber);
    if (this.limit) params.append('limit', this.limit);

    const url = `${this.baseUrl}/meals/search${
      params.toString() ? '?' + params.toString() : ''
    }`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      return data.results;
    } catch (error) {
      console.error('Meals search failed:', error);
      throw error;
    }
  }

  async getAreas() {
    const url = `${this.baseUrl}/meals/areas`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      const areas = data.results.slice(0, 10);

      areas.unshift({ name: 'All Cuisines' });

      return areas;
    } catch (error) {
      console.error('Areas fetch failed:', error);
      throw error;
    }
  }
}

export default Search;
