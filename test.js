const request = require('supertest');
const app = require('./volopayassessment');

  
  //  getting total items sold in Marketing

//   curl 'http://localhost:8000/api/total_items?start_date=2022-05-10&end_date=2022-05-11&department=Marketting'

  describe('GET /api/total_items', () => {
    it('should return the total number of seats sold in Marketing during Q3', async () => {
      const response = await request(app).get('/api/total_items')
        .query({ start_date: '2022-05-10', end_date: '2022-05-11', department: 'Marketing' });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total_seats', 19); 
    });
  });

  //  getting the Nth most sold item by quantity
//   curl 'http://localhost:8000/api/nth_most_total_item?item_by=price&start_date=2022-05-10&end_date=2022-05-11&n=1'
  describe('GET /api/nth_most_total_item', () => {
    it('should return the Nth most sold item by quantity', async () => {
      const response = await request(app).get('/api/nth_most_total_item')
        .query({ item_by: 'price', start_date: '2022-05-10', end_date: '2022-05-11', n: 1 });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('item_name', 'Apple');
      
      const response1 = await request(app).get('/api/nth_most_total_item')
        .query({ item_by: 'quantity', start_date: '2022-05-10', end_date: '2022-05-11', n: 1 });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('item_name', 'Fullstory');
      

    });
  });


  //  getting the percentage of sold items by department
//   curl 'http://localhost:8000/api/percentage_of_department_wise_sold_items?start_date=2022-05-10&end_date=2022-05-11'
  describe('GET /api/percentage_of_department_wise_sold_items', () => {
    it('should return the percentage of sold items by department', async () => {
      const response = await request(app).get('/api/percentage_of_department_wise_sold_items')
        .query({ start_date: '2022-05-10', end_date: '2022-05-11' });
      expect(response.status).toBe(200);
    //   expect(response.body).toHaveProperty("Customer Success", "13%","HR", "7%","Marketting", "21%","Sales", "21%","Tech", "36%"); // Replace '50%' with the expected percentage
    });
  });

  //  getting monthly sales for a product
//   curl 'http://localhost:8000/api/monthly_sales?product_name=Teams'
  describe('GET /api/monthly_sales', () => {
    it('should return the monthly sales for a product', async () => {
      const response = await request(app).get('/api/monthly_sales')
        .query({ product_name: 'Teams' });
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(13);
    });
  });
