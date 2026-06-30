class Analyze {
  baseUrl = 'https://nutriplan-api.vercel.app/api';
  apiKey = 'blENUaoJVaHoHJpPP8rI2bQPa1B2pSHJ8vLUrru3';

  constructor(title, ingredients = []) {
    this.ingredients = ingredients;
    this.title = title;

    console.log(`ingredients`, this.ingredients);
    console.log(`title`, this.title);
  }

  async fetchCaloriesData() {
    const url = `${this.baseUrl}/nutrition/analyze`;
    try {
      const requestBody = {
        recipeName: this.title,
        ingredients: this.ingredients,
      };

      console.log('Request body:', requestBody);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error(`Error fetching ingredient data:`, error);
      throw error;
    }
  }
}

export default Analyze;
