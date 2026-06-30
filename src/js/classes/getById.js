class GetById {
  baseUrl = 'https://nutriplan-api.vercel.app/api';

  constructor(mealId) {
    this.mealId = mealId;
  }

  async getMealById() {
    if (!this.mealId) {
      throw new Error('Meal ID is required');
    }

    const url = `${this.baseUrl}/meals/${this.mealId}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      return data.result;
    } catch (error) {
      console.error('Get meal by ID failed:', error);
      throw error;
    }
  }
}

export default GetById;
