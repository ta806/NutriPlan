class Barcode {
  baseUrl = 'https://nutriplan-api.vercel.app/api';

  constructor(code) {
    this.code = code;
  }

  async searchProductsByBarcode() {
    const url = `${this.baseUrl}/products/barcode/${this.code}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      return data.result;
    } catch (error) {
      console.error('Barcode search failed:', error);
      throw error;
    }
  }
}

export default Barcode;
