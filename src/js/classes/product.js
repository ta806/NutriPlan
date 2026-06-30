class Product {
  baseUrl = 'https://nutriplan-api.vercel.app/api';

  constructor(q = '', limit = 100) {
    this.q = q;
    this.limit = limit;
  }

  async searchProductsByName() {
    const params = new URLSearchParams();

    if (this.q) params.append('q', this.q);
    if (this.limit) params.append('limit', this.limit);

    const url = `${this.baseUrl}/products/search${
      params.toString() ? '?' + params.toString() : ''
    }`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      return data;
    } catch (error) {
      console.error('Product search failed:', error);
      throw error;
    }
  }
}

export default Product;
